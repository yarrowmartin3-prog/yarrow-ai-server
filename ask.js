export default async function handler(req, res) {
  try {
    const { question, site } = req.body;
    // Ici tu pourrais brancher OpenAI → réponse simplifiée pour test
    res.status(200).json({
      ok: true,
      site,
      answer: `Réponse simulée de Nova à la question: "${question}"`
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.toString() });
  }
}
