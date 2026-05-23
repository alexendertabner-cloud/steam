export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { game, steamUrl, platforms, contacts } = req.body

    const fields = Object.entries(contacts).map(([platform, handle]) => ({
      name: platform,
      value: String(handle),
      inline: true,
    }))

    await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          color: 0x0073FF,
          title: `🎮 ${game.name}`,
          url: steamUrl,
          description: game.short_description,
          thumbnail: { url: game.header_image },
          fields: [
            { name: 'Steam URL', value: steamUrl, inline: false },
            { name: 'Genres', value: game.genres.join(', ') || '—', inline: true },
            { name: 'Price', value: game.price_final === 0 ? 'Free' : `€${(game.price_final / 100).toFixed(2)}`, inline: true },
            ...fields,
          ],
          footer: { text: 'SideQuest Submission' },
          timestamp: new Date().toISOString(),
        }]
      })
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
