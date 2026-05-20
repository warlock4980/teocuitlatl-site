import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

const allowedCoins = new Set([
  "patzcuaro",
  "cenote",
  "sun",
  "moon",
  "septiembre",
  "zapata",
  "alcubierre"
]);

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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function hash(value = "") {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function normalizePicks(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).filter(item => allowedCoins.has(item)))].slice(0, 3);
}

async function ensureSchema(sql) {
  await sql`
    create table if not exists coin_poll_votes (
      id bigserial primary key,
      picks text[] not null,
      user_agent_hash text,
      referer text,
      created_at timestamptz not null default now()
    )
  `;
}

async function getResults(sql) {
  const rows = await sql`
    select coin, count(*)::int as votes
    from coin_poll_votes, unnest(picks) as coin
    group by coin
    order by votes desc, coin asc
  `;

  return Object.fromEntries(rows.map(row => [row.coin, row.votes]));
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (!process.env.DATABASE_URL) {
    res.status(500).json({ error: "DATABASE_URL is not configured." });
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  await ensureSchema(sql);

  if (req.method === "GET") {
    res.status(200).json({ results: await getResults(sql) });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const picks = normalizePicks(req.body?.picks);
  if (!picks.length) {
    res.status(400).json({ error: "Choose at least one valid coin." });
    return;
  }

  await sql`
    insert into coin_poll_votes (picks, user_agent_hash, referer)
    values (
      ${picks},
      ${hash(req.headers["user-agent"] || "")},
      ${(req.headers.referer || "").slice(0, 500)}
    )
  `;

  res.status(200).json({ ok: true, picks, results: await getResults(sql) });
}
