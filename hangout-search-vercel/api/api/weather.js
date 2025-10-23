
module.exports = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "missing lat/lon" });
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,temperature_2m&daily=precipitation_probability_max&timezone=auto`;
    const r = await fetch(url);
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=600");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
