
module.exports = async (req, res) => {
  try {
    const { a, b, profile = "foot" } = req.query; // a="lon,lat", b="lon,lat"
    if (!a || !b) return res.status(400).json({ error: "missing a/b" });
    const url = `https://router.project-osrm.org/route/v1/${profile}/${a};${b}?overview=false&alternatives=false&steps=false`;
    const r = await fetch(url);
    const data = await r.json();
    const route = data?.routes?.[0];
    const duration_min = route ? Math.round(route.duration / 60) : null;
    const distance_km = route ? +(route.distance / 1000).toFixed(2) : null;
    res.setHeader("Cache-Control", "s-maxage=300");
    res.status(200).json({ duration_min, distance_km });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
