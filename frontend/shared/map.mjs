export function contactMap(contact) {
  let query = contact.address
  let saved
  try {
    saved = new URL(contact.mapUrl)
  } catch {
    /* Manzil bo‘yicha xarita. */
  }
  if (saved?.protocol === 'https:') {
    const host = saved.hostname.toLowerCase()
    if (['www.google.com', 'google.com', 'maps.google.com'].includes(host)) {
      if (/^\/maps\/embed(?:\/|$)/.test(saved.pathname))
        return { embed: saved.href, link: saved.href }
      query =
        saved.searchParams.get('q') || saved.searchParams.get('query') || query
      const coordinates = saved.pathname.match(
        /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
      )
      if (coordinates) query = `${coordinates[1]},${coordinates[2]}`
    }
    if (
      ['yandex.ru', 'yandex.com', 'yandex.uz'].includes(host) &&
      /^\/map-widget\/v1\//.test(saved.pathname)
    )
      return { embed: saved.href, link: saved.href }
  }
  const encoded = encodeURIComponent(query)
  return {
    embed: `https://www.google.com/maps?q=${encoded}&output=embed`,
    link:
      saved?.protocol === 'https:'
        ? saved.href
        : `https://www.google.com/maps/search/?api=1&query=${encoded}`,
  }
}
