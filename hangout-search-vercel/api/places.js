
const API = "https://api.opentripmap.com/0.1";
module.exports = async (req, res) => {
  try {
    const { lat, lon, radius = "2500", kinds = "foods,cafes,interesting_places", limit = "20", lang = "en" } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "missing lat/lon" });
    const key = process.env.OPENTRIPMAP_KEY || "";
    const p = new URLSearchParams({ radius, lon, lat, kinds, rate: "2", limit, apikey: key, format: "json" });
    const url = `${API}/${lang}/places/radius?` + p.toString();
    const r = await fetch(url);
    const base = await r.json();
    // fetch details for top 8
    const top = base.slice(0, 8);
    const details = await Promise.all(top.map(async it => {
      try {
        const dr = await fetch(`${API}/${lang}/places/xid/${it.xid}?apikey=${key}`);
        if (!dr.ok) throw 0;
        const d = await dr.json();
        return {
          xid: it.xid, name: d.name || it.name, kinds: d.kinds, rate: it.rate || d.rate,
          lat: d.point?.lat ?? it.point?.lat, lon: d.point?.lon ?? it.point?.lon,
          address: d.address?.road || d.address?.house_number || d.address?.city ? d.address : null,
          url: d.url || d.otm,
          wikipedia: d.wikipedia_extracts?.text || null,
          opening_hours: d.properties?.opening_hours || null
        };
      } catch { 
        return { xid: it.xid, name: it.name, kinds: it.kinds, rate: it.rate, point: it.point };
      }
    }));
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate");
    res.status(200).json(details);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
