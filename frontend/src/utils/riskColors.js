export const getRiskTierBadge = (tier) => {
  const t = (tier || '').toLowerCase()
  if (t.includes('elevated')) return 'badge-red'
  if (t.includes('moderate')) return 'badge-orange'
  if (t.includes('mild')) return 'badge-yellow'
  return 'badge-green'
}

export const getDeviationBadge = (status) => {
  const s = (status || '').toLowerCase()
  if (s.includes('significant')) return 'badge-red'
  if (s.includes('moderate')) return 'badge-orange'
  if (s.includes('minor')) return 'badge-yellow'
  if (s.includes('insufficient')) return 'badge-gray'
  if (s.includes('stable')) return 'badge-blue'
  return 'badge-green'
}
