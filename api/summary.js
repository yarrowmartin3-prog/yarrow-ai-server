export default async function handler(req, res) {
  // Exemple de résumé santé fictif
  const summary = {
    steps: 4567,
    hr: 72,
    sleep: 7.5,
    battery: 87
  };

  res.status(200).json({ ok: true, summary });
}
