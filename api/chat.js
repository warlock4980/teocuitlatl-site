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

function getLlmConfig() {
  const providerRaw = (process.env.LLM_PROVIDER || "").trim().toLowerCase();
  const provider = providerRaw || (process.env.ANTHROPIC_API_KEY ? "anthropic" : "openai");

  if (provider === "anthropic" || provider === "claude") {
    return {
      provider: "anthropic",
      apiUrl: process.env.ANTHROPIC_API_URL || "https://api.anthropic.com/v1/messages",
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY,
      model: process.env.ANTHROPIC_MODEL || process.env.LLM_MODEL || "claude-3-5-haiku-latest"
    };
  }

  return {
    provider: "openai",
    apiUrl: process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions",
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || "gpt-4o-mini"
  };
}

function writeSseToken(res, token) {
  if (!token) return;
  res.write(`data: ${JSON.stringify({ token })}\n\n`);
}

async function streamOpenAI(config, message, res) {
  const upstream = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
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
    throw new Error(errorText.slice(0, 240) || `OpenAI upstream ${upstream.status}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";
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
          accumulated += token;
          writeSseToken(res, token);
        }
      } catch {
        // Ignore non-JSON chunks.
      }
    }
    if (upstreamDone) break;
  }

  return accumulated;
}

async function streamAnthropic(config, message, res) {
  const upstream = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: config.model,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: message }
      ],
      max_tokens: 220,
      temperature: 0.4,
      stream: true
    })
  });

  if (!upstream.ok || !upstream.body) {
    const errorText = await upstream.text().catch(() => "");
    throw new Error(errorText.slice(0, 240) || `Anthropic upstream ${upstream.status}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let eventEnd;
    while ((eventEnd = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, eventEnd);
      buffer = buffer.slice(eventEnd + 2);
      const dataLine = block
        .split("\n")
        .map(line => line.trim())
        .find(line => line.startsWith("data:"));
      if (!dataLine) continue;

      try {
        const json = JSON.parse(dataLine.slice(5).trim());
        if (json.type === "content_block_delta") {
          const token = json.delta?.text || "";
          if (token) {
            accumulated += token;
            writeSseToken(res, token);
          }
        }
      } catch {
        // Ignore non-JSON chunks.
      }
    }
  }

  return accumulated;
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

If the user writes in Spanish, reply in natural Mexican Spanish. Prefer official Mexican-source links when relevant, especially .gob.mx, sre.gob.mx, inm.gob.mx, miconsulado.sre.gob.mx, and Spanish Project Mexica pages under https://teocuitlatl.com/es/. Do not sound like a literal translation. Use Mexican service-site wording such as "consulta", "cobertura", "origen y destino", "servicios", "aliados", and "asesor" where it fits. Say "Centro de Viajes", not "Travel Hub" or "Hub de Viajes"; say "Aventura de Cenotes en Cancún", not "Cenote Cancún Adventure"; and for Spanish travel/passport/FMM questions route directly to https://teocuitlatl.com/es/travel.html.

You explain only these topics:
- TOM (payment-flow concept; testnet/demo only, not legal tender)
- TEO (route reward concept; testnet/demo only, not an investment)
- Proof badges: MIC (Michoacán / Lake Pátzcuaro route, near Janitzio and El Estribo Grande), CEN (English: Cenote Cancún Adventure; Spanish: Aventura de Cenotes en Cancún, near Puerto Morelos)
- Heritage medallion concept art (Sun, Moon, Tenochtitlán, Moctezuma — commemorative concept art only, not legal tender or investment)
- Partner pilot tiers (route sponsorships, tourism activations — see https://teocuitlatl.com/partners.html)
- Tip jar / creator support (voluntary XRP support at https://teocuitlatl.com/gallery.html#support; not an investment, token sale, partner payment, or product purchase)
- Travel hub content (Mexico map, route ideas, airports, passport/FMM official links, SENTRI/Global Entry starting points — see https://teocuitlatl.com/travel.html)
- Privacy and data removal (route to https://teocuitlatl.com/privacy.html)
- The coin poll on the gallery (visitors vote on coin concepts at https://teocuitlatl.com/gallery.html)

HARD RULES — never violate, no exceptions:

1. NEVER recommend buying, selling, investing, or expecting returns. If the user asks in English about price, investment, returns, profits, ROI, mainnet, exchange listing, or token sale — refuse and reply with this EXACT wording: "Important: this is a prototype/testnet demonstration. Nothing here is investment advice, a securities offer, a promise of returns, legal tender, or a public token sale. For direct questions, email hola@teocuitlatl.com." If the user asks in Spanish about those topics, refuse with this EXACT wording: "Importante: esto es un prototipo en red de prueba. Nada aquí es consejo de inversión, oferta de valores, promesa de rendimientos, moneda de curso legal ni venta pública de tokens. Para preguntas directas, escribe a hola@teocuitlatl.com."

2. Do NOT invent facts. Do not make up partner names, route stops, dates, prices, features, or timelines that aren't in this prompt. If you don't know, say so and route to email: hola@teocuitlatl.com.

3. Stay strictly on Project Mexica topics, including Mexico travel hub planning. For unrelated questions (politics, other crypto projects, personal advice, weather, sports, etc.), politely decline and redirect to hola@teocuitlatl.com.

4. Keep replies under 120 words. Be tight, factual, brand-aligned. No emojis. Match the existing FAQ tone — informative, restrained, prototype-focused. Do not use Markdown link syntax like [label](url); write plain URLs so the site can link them cleanly.

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

  const llmConfig = getLlmConfig();
  if (!llmConfig.apiKey || !llmConfig.model || !llmConfig.apiUrl) {
    res.status(500).json({
      error: "LLM endpoint not configured.",
      provider: llmConfig.provider,
      hasApiUrl: Boolean(llmConfig.apiUrl),
      hasApiKey: Boolean(llmConfig.apiKey),
      hasModel: Boolean(llmConfig.model),
      hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
      hasOpenAiKey: Boolean(process.env.LLM_API_KEY)
    });
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
    responseAccumulated = llmConfig.provider === "anthropic"
      ? await streamAnthropic(llmConfig, message, res)
      : await streamOpenAI(llmConfig, message, res);
    res.write("data: [DONE]\n\n");
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "upstream-failed", detail: String(err).slice(0, 240) })}\n\n`);
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
