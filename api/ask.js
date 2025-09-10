export default async function handler(req, res) {
  // Autoriser les appels depuis n'importe quel site (GitHub Pages inclus)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Réponse rapide aux pré-requêtes CORS
  }

  try {
    const { question, site } = req.body;

    if (!question) {
      return res.status(400).json({ ok: false, error: "Question manquante" });
    }

    // ➝ Ici tu peux appeler OpenAI ou mettre une réponse test
    const fakeAnswer = `Salut 🚀, tu as demandé : "${question}" (site: ${site})`;

    res.status(200).json({
      ok: true,
      site,
      answer: fakeAnswer
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
