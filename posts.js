export default async function handler(req, res) {
  const site = req.query.site || "hydro";

  // Exemple de contenu généré
  const posts = [
    { id: 1, title: `Nouvelles du site ${site}`, content: "Exemple d'article généré." },
    { id: 2, title: "Capteurs hydroponiques", content: "Détails sur les capteurs connectés." }
  ];

  res.status(200).json({ ok: true, site, posts });
}
