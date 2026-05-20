export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "teocuitlatl-poll",
    neon: Boolean(process.env.DATABASE_URL)
  });
}
