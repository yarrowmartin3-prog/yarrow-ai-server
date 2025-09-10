export default async function handler(req, res) {
  // Autoriser les appels depuis GitHub Pages
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // S’assurer qu’on parse bien le JSON
    const { question, site } = req.body || {};

    if (!question) {
      return res.status(400).json({ ok: false, error: "Question manquante" });
    }

    // Réponse test (plus tard tu pourras mettre OpenAI ici)
    const fakeAnswer = `Salut 🚀, tu as demandé : "${question}" (site: ${site})`;

    res.status(200).json({
      ok: true,
      site,
      answer: fakeAnswer,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
