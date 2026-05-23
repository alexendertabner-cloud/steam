export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { appid } = req.query
  if (!appid) return res.status(400).json({ error: 'Missing appid' })

  const r = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=fr&l=en`
  )
  const json = await r.json()
  const data = json[appid]?.data
  if (!data) return res.status(404).json({ error: 'Game not found' })

  res.json({
    name: data.name,
    short_description: data.short_description,
    header_image: data.header_image,
    genres: data.genres?.map(g => g.description) ?? [],
    p
