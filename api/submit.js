export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { game, steamUrl, platforms, contacts } = req.body

    const price = game.price_final === 0 ? '🆓 Free' : `💰 €${(game.price_final / 100).toFixed(2)}`
    const genreList = game.genres.slice(0, 3).join(', ') || '—'

    const contactLines = Object.entries(contacts)
      .map(([platform, handle]) => `**${platform}** — ${handle}`)
      .join('\n')

    await fetch(process.env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '@everyone 🚨 **New game submission just came in!**',
        embeds: [{
          color: 0x0073FF,
          author: {
            name: 'SideQuest — New Submission',
            icon_url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/steamworks_docs/english/sits_login.jpg'
          },
          title: game.name,
          url: steamUrl,
          description: game.short_description || 'No description available.',
          thumbnail: { url: game.header_image },
          fields: [
            {
              name: '🎮  Game Info',
              value: `**Genres:** ${genreList}\n**Price:** ${price}`,
              inline: false,
            },
            {
              name: '🔗  Steam URL',
              value: `[Open on Steam](${steamUrl})`,
              inline: false,
            },
            {
              name: '📬  Contact Details',
              value: contactLines,
              inline: false,
            },
            {
              name: '✅  Eligibility',
              value: 'Confirmed by submitter',
              inline: true,
            },
            {
              name: '🕐  Submitted At',
              value: new Date().toLocaleString('en-GB', { timeZone: 'Europe/Paris', dateStyle: 'medium', timeStyle: 'short' }),
              inline: true,
            },
          ],
          image: { url: game.header_image },
          footer: {
            text: 'SideQuest Platform • Reply within 48h',
            icon_url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/steamworks_docs/english/sits_login.jpg'
          },
          timestamp: new Date().toISOString(),
        }]
      })
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
