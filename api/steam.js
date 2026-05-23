export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { appid } = req.query
  if (!appid) return res.status(400).json({ error: 'Missing appid' })

  try {
    const r = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=fr&l=en`
    )
    const json = await r.json()
    const data = json[appid]?.data
    if (!data) return res.status(404).json({ error: 'Game not found' })

    res.status(200).json({
      name: data.name,
      short_description: data.short_description,
      header_image: data.header_image,
      genres: data.genres?.map(g => g.description) ?? [],
      price_final: data.price_overview?.final ?? 0,
      positive_pct: data.metacritic?.score ?? null,
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal error', detail: err.message })
  }
}
