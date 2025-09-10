export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { userText } = req.body || {};
    if (!userText) return res.status(400).json({ error: "userText is required" });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Tu es un assistant utile et concis pour le site Yarrow Beta 3D." },
          { role: "user", content: userText }
        ],
        temperature: 0.7
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: "OpenAI error", detail: err });
    }

    const data = await r.json();
    const answer = data.choices?.[0]?.message?.content ?? "(pas de réponse)";
    res.status(200).json({ answer });
  } catch (e) {
    res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
