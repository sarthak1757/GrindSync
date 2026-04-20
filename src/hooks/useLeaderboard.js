import { useMemo } from 'react'
import { calculateWeeklyScore } from '../utils/scoreCalculator'

export function useLeaderboard(members = []) {
  return useMemo(
    () =>
      members
        .map((member) => ({ ...member, score: calculateWeeklyScore(member.weeklyStats || {}) }))
        .sort((a, b) => b.score - a.score),
    [members],
  )
}
