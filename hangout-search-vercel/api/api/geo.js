
module.exports = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "missing q" });
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { "User-Agent": "hangout-planner/1.0 (+https://vercel.app)" } });
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.status(200).json(data.map(x => ({
      display_name: x.display_name,
      lat: parseFloat(x.lat),
      lon: parseFloat(x.lon)
    })));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
