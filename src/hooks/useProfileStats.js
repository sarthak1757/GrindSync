import { useMemo } from 'react'
import { startOfDay, format, differenceInDays, subDays } from 'date-fns'

export function useProfileStats(questions = [], challenges = [], currentUser) {
  return useMemo(() => {
    let totalAttempts = 0
    let totalTimeMins = 0
    let hardSolved = 0
    let mediumSolved = 0
    let easySolved = 0
    const topicScores = {} // { topic: { totalScore: 0, count: 0 } }
    
    // Normalize solve events for heatmap and streak
    const solveDatesMap = new Map() // 'yyyy-MM-dd' -> count
    const activities = []

    questions.forEach((q) => {
      // Process difficulty for readiness
      const diff = q.difficulty?.toLowerCase?.() || 'easy'
      if (diff === 'hard') hardSolved++
      else if (diff === 'medium') mediumSolved++
      else easySolved++

      // Process topic mastery
      const topic = q.topic || 'unknown'
      if (!topicScores[topic]) topicScores[topic] = { totalScore: 0, count: 0 }
      topicScores[topic].totalScore += (q.revision?.masteryScore || 50)
      topicScores[topic].count++

      // Process history
      const history = Array.isArray(q.solveHistory) ? q.solveHistory : []
      history.forEach((h) => {
        totalAttempts++
        totalTimeMins += (Number(h.timeTakenMins) || 0)
        
        let solvedAtDate = null
        if (h.solvedAt) {
          solvedAtDate = typeof h.solvedAt.toDate === 'function' ? h.solvedAt.toDate() : new Date(h.solvedAt)
          const dateStr = format(solvedAtDate, 'yyyy-MM-dd')
          solveDatesMap.set(dateStr, (solveDatesMap.get(dateStr) || 0) + 1)

          activities.push({
            id: `q-${q.id}-${solvedAtDate.getTime()}`,
            type: 'solve',
            title: `Solved ${q.title} (${q.difficulty}) in ${h.timeTakenMins}m`,
            timestamp: solvedAtDate,
          })
        }
      })
    })

    const avgSolveTime = totalAttempts > 0 ? Math.round(totalTimeMins / totalAttempts) : 0

    // Collect Topic Breakdown
    const topicMastery = Object.entries(topicScores).map(([topic, data]) => ({
      topic,
      mastery: Math.round(data.totalScore / data.count),
      count: data.count
    })).sort((a, b) => b.mastery - a.mastery)

    // Calculate Streak
    const sortedDatesStr = Array.from(solveDatesMap.keys()).sort((a, b) => new Date(b) - new Date(a))
    let currentStreak = 0
    let longestStreak = 0
    
    if (sortedDatesStr.length > 0) {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd')
      
      // Calculate current streak
      if (sortedDatesStr.includes(todayStr) || sortedDatesStr.includes(yesterdayStr)) {
        currentStreak = 1
        let checkDate = sortedDatesStr.includes(todayStr) ? new Date() : subDays(new Date(), 1)
        checkDate = subDays(checkDate, 1)
        while (solveDatesMap.has(format(checkDate, 'yyyy-MM-dd'))) {
          currentStreak++
          checkDate = subDays(checkDate, 1)
        }
      }

      // Calculate longest streak
      let tempStreak = 1
      longestStreak = 1
      for (let i = 0; i < sortedDatesStr.length - 1; i++) {
        const d1 = new Date(sortedDatesStr[i])
        const d2 = new Date(sortedDatesStr[i + 1])
        if (differenceInDays(d1, d2) === 1) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak)
    }

    // Heatmap data covering the past 365 days
    const heatmapData = []
    const today = new Date()
    for (let i = 365; i >= 0; i--) {
      const d = subDays(today, i)
      const dateStr = format(d, 'yyyy-MM-dd')
      heatmapData.push({
        date: dateStr,
        count: solveDatesMap.get(dateStr) || 0
      })
    }

    // Readiness Score (Weighted algo: max 100)
    // 3 pts hard, 2 pts medium, 1 pt easy. + Streak bonus. 
    // Say, targeting 150 points for 100%.
    const rawScore = (hardSolved * 3) + (mediumSolved * 2) + (easySolved * 1) + (currentStreak * 2)
    const readinessScore = Math.min(100, Math.round((rawScore / 150) * 100))
    const totalSolved = questions.length

    // Process Challenges for activity & badges
    let challengesWon = 0
    challenges.forEach(c => {
      let resolvedAt = null
      if (c.createdAt) {
         resolvedAt = typeof c.createdAt.toDate === 'function' ? c.createdAt.toDate() : new Date(c.createdAt)
      }
      if (c.status === 'completed') {
        const opponent = c.challenger?.userId === currentUser?.uid ? c.challenged : c.challenger
        if (c.winner === currentUser?.uid) {
          challengesWon++
          if (resolvedAt) {
            activities.push({
              id: `c-${c.id}`,
              type: 'challenge',
              title: `Won challenge against ${opponent?.displayName || 'opponent'}`,
              timestamp: resolvedAt,
            })
          }
        } else if (c.winner === 'draw' && resolvedAt) {
           activities.push({
              id: `c-draw-${c.id}`,
              type: 'challenge',
              title: `Drew challenge against ${opponent?.displayName || 'opponent'}`,
              timestamp: resolvedAt,
            })
        }
      }
    })

    activities.sort((a, b) => b.timestamp - a.timestamp)
    const recentActivity = activities.slice(0, 10)

    // Badges/Achievements mapping
    const badges = [
      { id: 'first_solve', title: 'First Solve', desc: 'Solved 1 question', unlocked: totalSolved >= 1, icon: 'zap' },
      { id: 'consistent', title: 'Consistent', desc: '7 day streak', unlocked: longestStreak >= 7, icon: 'flame' },
      { id: 'grinder', title: 'Grinder', desc: '50 questions solved', unlocked: totalSolved >= 50, icon: 'target' },
      { id: 'speed_demon', title: 'Speed Demon', desc: 'Solved a hard < 30 mins', unlocked: false, icon: 'zap' }, // Calculate below
      { id: 'topic_master', title: 'Topic Master', desc: '95%+ mastery in a topic', unlocked: topicMastery.some(t => t.mastery >= 95), icon: 'star' },
      { id: 'challenger', title: 'Challenger', desc: 'Won 10 challenges', unlocked: challengesWon >= 10, icon: 'trophy' },
    ]

    // Check Speed Demon explicitly
    let isSpeedDemon = false
    questions.forEach(q => {
      if (q.difficulty?.toLowerCase?.() === 'hard') {
        const hist = Array.isArray(q.solveHistory) ? q.solveHistory : []
        if (hist.some(h => (Number(h.timeTakenMins) || Infinity) < 30)) {
          isSpeedDemon = true
        }
      }
    })
    const demonBadge = badges.find(b => b.id === 'speed_demon')
    if (demonBadge) demonBadge.unlocked = isSpeedDemon

    // Build line chart trend data (last 30 days)
    const trendData = []
    for (let i = 29; i >= 0; i--) {
      const d = subDays(today, i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const dispLabel = format(d, 'MMM dd')
      
      let dayTimeSum = 0
      let daySolves = 0

      questions.forEach(q => {
        const hist = Array.isArray(q.solveHistory) ? q.solveHistory : []
        hist.forEach(h => {
           if (!h.solvedAt) return
           const hDate = typeof h.solvedAt.toDate === 'function' ? h.solvedAt.toDate() : new Date(h.solvedAt)
           if (format(hDate, 'yyyy-MM-dd') === dateStr) {
             daySolves++
             dayTimeSum += (Number(h.timeTakenMins) || 0)
           }
        })
      })

      trendData.push({
        date: dispLabel,
        questionsSolved: daySolves,
        avgSolveTime: daySolves > 0 ? Math.round(dayTimeSum / daySolves) : 0
      })
    }

    return {
      totalSolved,
      currentStreak,
      longestStreak,
      avgSolveTime,
      readinessScore,
      topicMastery,
      heatmapData,
      badges,
      recentActivity,
      trendData
    }

  }, [questions, challenges, currentUser?.uid])
}
