const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function calculateNextRevision(question, feelingAfterRevision, timeTaken) {
  const avgTime = question.revision.averageTimeMins || 30
  const currentInterval = question.revision.intervalDays || 1

  let newInterval = currentInterval
  let masteryDelta = 0

  if (feelingAfterRevision === 'easy' && timeTaken < avgTime) {
    newInterval = currentInterval * 2
    masteryDelta = 10
  } else if (feelingAfterRevision === 'okay') {
    newInterval = currentInterval * 1.5
    masteryDelta = 5
  } else if (feelingAfterRevision === 'hard' || timeTaken > avgTime * 1.5) {
    newInterval = 1
    masteryDelta = -10
  }

  const masteryScore = clamp((question.revision.masteryScore || 0) + masteryDelta, 0, 100)
  const roundedInterval = Math.max(1, Math.round(newInterval))
  const next = new Date()
  next.setDate(next.getDate() + roundedInterval)

  const totalAttempts = (question.revision.totalAttempts || 0) + 1
  const averageTimeMins =
    ((question.revision.averageTimeMins || 0) * (totalAttempts - 1) + Number(timeTaken || 0)) / totalAttempts

  return {
    newInterval: roundedInterval,
    masteryScore,
    nextRevisionDate: next.toISOString(),
    totalAttempts,
    averageTimeMins: Number(averageTimeMins.toFixed(1)),
  }
}
