export const formatScorePercent = (val)=> {
  if (val === undefined || val === null) return 'N/A'
  return `${(val * 100).toFixed(1)}%`
}

export const formatZScore = (z)=> {
  if (z === undefined || z === null) return 'N/A'
  return z > 0 ? `+${z.toFixed(2)}` : z.toFixed(2)
}
