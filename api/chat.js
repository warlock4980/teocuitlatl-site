import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

// CORS — match the existing poll.js pattern.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://teocuitlatl.com,http://teocuitlatl.com")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Best-effort in-memory rate limit. Resets on cold starts; swap for Vercel KV
// or Upstash if real abuse appears.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const buckets = new Map();

function getClientHash(req) {
  const fingerprint = [
    req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
    req.headers["user-agent"] || ""
  ].join("|");
  return crypto.createHash("sha256").update(fingerprint).digest("hex").slice(0, 32);
}

function isRateLimited(req) {
  const id = getClientHash(req);
  const now = Date.now();
  const entry = buckets.get(id) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now >= entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  entry.count += 1;
  buckets.set(id, entry);
  return entry.count > RATE_LIMIT_MAX;
}

// Ensures chat_log table exists. Idempotent; safe to call every request.
async function ensureChatLog(sql) {
  await sql`
    create table if not exists chat_log (
      id bigserial primary key,
      voter_hash text,
      message text not null,
      response_excerpt text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create index if not exists chat_log_voter_hash_idx
      on chat_log (voter_hash)
  `;
  await sql`
    create index if not exists chat_log_created_at_idx
      on chat_log (created_at desc)
  `;
}

// DRAFT system prompt — refine wording with SME judgment before production.
// Legal-framing disclaimer mirrors the existing FAQ verbatim.
const SYSTEM_PROMPT = `You are the Mexica Guide, a helper for the Project Mexica testnet/demo website (teocuitlatl.com).

You explain only these topics:
- TOM (payment-flow concept; testnet/demo only, not legal tender)
- TEO (route reward concept; testnet/demo only, not an investment)
- Proof badges: MIC (Michoacán / Lake Pátzcuaro route, near Janitzio and El Estribo Grande), CEN (Cenote Cancún Adventure, near Puerto Morelos)
- Heritage medallion concept art (Sun, Moon, Tenochtitlán, Moctezuma — commemorative concept art only, not legal tender or investment)
- Partner pilot tiers (route sponsorships, tourism activations — see https://teocuitlatl.com/partners.html)
- Privacy and data removal (route to https://teocuitlatl.com/privacy.html)
- The coin poll on the gallery (visitors vote on coin concepts at https://teocuitlatl.com/gallery.html)

HARD RULES — never violate, no exceptions:

1. NEVER recommend buying, selling, investing, or expecting returns. If the user asks about price, investment, returns, profits, ROI, mainnet, exchange listing, or token sale — refuse and reply with this EXACT wording: "Important: this is a prototype/testnet demonstration. Nothing here is investment advice, a securities offer, a promise of returns, legal tender, or a public token sale. For direct questions, email hola@teocuitlatl.com."

2. Do NOT invent facts. Do not make up partner names, route stops, dates, prices, features, or timelines that aren't in this prompt. If you don't know, say so and route to email: hola@teocuitlatl.com.

3. Stay strictly on Project Mexica topics. For unrelated questions (politics, other crypto projects, personal advice, weather, sports, etc.), politely decline and redirect to hola@teocuitlatl.com.

4. Keep replies under 120 words. Be tight, factual, brand-aligned. No emojis. Match the existing FAQ tone — informative, restrained, prototype-focused.

5. Do NOT make forward-looking claims about mainnet launches, exchange listings, commercial availability, partnerships, or product roadmap beyond the testnet/demo prototype framing.

6. If genuinely unsure, route the user to hola@teocuitlatl.com.`;

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (!process.env.LLM_API_URL || !process.env.LLM_API_KEY || !process.env.LLM_MODEL) {
    res.status(500).json({ error: "LLM endpoint not configured." });
    return;
  }

  if (isRateLimited(req)) {
    res.status(429).json({ error: "Too many requests. Try again in a minute." });
    return;
  }

  const message = (req.body?.message || "").toString().trim().slice(0, 1000);
  if (!message) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  // Stream from upstream LLM and re-emit as SSE to the client.
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  let responseAccumulated = "";

  try {
    const upstream = await fetch(process.env.LLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        max_tokens: 220,
        temperature: 0.4,
        stream: true
      })
    });

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text().catch(() => "");
      res.write(`data: ${JSON.stringify({ error: "upstream-failed", detail: errorText.slice(0, 200) })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let upstreamDone = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let lineEnd;
      while ((lineEnd = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") {
          upstreamDone = true;
          break;
        }
        try {
          const json = JSON.parse(payload);
          const token = json.choices?.[0]?.delta?.content || "";
          if (token) {
            responseAccumulated += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
        } catch {
          // Ignore non-JSON chunks (keep-alive comments, etc.)
        }
      }
      if (upstreamDone) break;
    }

    res.write("data: [DONE]\n\n");
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "stream-failed", detail: String(err).slice(0, 200) })}\n\n`);
    res.write("data: [DONE]\n\n");
  }

  // Best-effort logging — failure here must NOT affect the client response
  // (which has already been streamed). Privacy disclosure for this storage
  // lives in privacy.html under "Chatbot."
  if (process.env.DATABASE_URL && responseAccumulated.trim()) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await ensureChatLog(sql);
      await sql`
        insert into chat_log (voter_hash, message, response_excerpt)
        values (
          ${getClientHash(req)},
          ${message},
          ${responseAccumulated.slice(0, 280)}
        )
      `;
    } catch (err) {
      console.error("[chat] log write failed:", err?.message || err);
    }
  }

  res.end();
}
