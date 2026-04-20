export function normalizeDifficulty(platform, difficulty) {
  const p = String(platform || '').toLowerCase()
  const d = String(difficulty || '').toLowerCase()

  if (p === 'leetcode') {
    if (d === 'easy') return 'beginner'
    if (d === 'medium') return 'intermediate'
    if (d === 'hard') return 'advanced'
  }

  if (p === 'codeforces') {
    const rating = Number(d)
    if (rating >= 800 && rating <= 1200) return 'beginner'
    if (rating > 1200 && rating <= 1800) return 'intermediate'
    if (rating > 1800) return 'advanced'
  }

  return d || 'intermediate'
}
