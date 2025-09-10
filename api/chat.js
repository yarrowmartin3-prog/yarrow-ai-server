export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userText, history = [] } = req.body || {};
    if (!userText) return res.status(400).json({ error: "userText is required" });

    const messages = [
      {
        role: "system",
        content: `
Tu es Yarrow Assistant : chaleureux, clair et concret.
Contexte: Yarrow Beta 3D (plantes, capteurs, interface web).
Style: phrases courtes, propose toujours la prochaine action.
Si tu n'es pas sûr, dis-le et propose 1 solution.
Réponds dans la langue de l'utilisateur.
`.trim()
      },
      ...history,                       // OK if empty (front not sending it yet)
      { role: "user", content: userText }
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",                // ← smarter model (you can switch to gpt-4o-mini to save cost)
        messages,
        temperature: 0.6,
        max_tokens: 300
      })
    });

    if (!r.ok) {
      return res.status(500).json({ error: "OpenAI error", detail: await r.text() });
    }

    const data = await r.json();
    const answer = data.choices?.[0]?.message?.content ?? "(pas de réponse)";
    res.status(200).json({ answer });
  } catch (e) {
    res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
