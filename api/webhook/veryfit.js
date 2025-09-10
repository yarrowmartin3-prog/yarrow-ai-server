export default async function handler(req, res) {
  try {
    const data = req.body;
    console.log("Webhook VeryFit reçu:", data);

    res.status(200).json({ ok: true, received: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.toString() });
  }
}
