export default async function handler(req, res) {
  const site = req.query.site || "hydro";

  const curated = [
    {
      title: `Curation pour ${site}`,
      html: "<p>Exemple de contenu trouvé via flux RSS.</p>",
      source: "https://exemple.com"
    }
  ];

  res.status(200).json({ ok: true, site, curated });
}
