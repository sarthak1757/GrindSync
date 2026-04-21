const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function calculateNextRevision(question, feelingAfterRevision, timeTaken) {
  let fallbackAvg = 30
  if (question.difficulty === 'beginner' || question.difficulty === 'easy') {
    fallbackAvg = 15
  } else if (question.difficulty === 'advanced' || question.difficulty === 'hard') {
    fallbackAvg = 60
  } else {
    fallbackAvg = 35
  }

  const avgTime = question.revision?.averageTimeMins || fallbackAvg
  const currentInterval = question.revision?.intervalDays || 1

  let newInterval = currentInterval
  let masteryDelta = 0
  let appliedGrade = feelingAfterRevision

  // Grade Override logic:
  if (timeTaken > avgTime * 1.5) {
    appliedGrade = 'hard'
  } else if (feelingAfterRevision === 'easy' && timeTaken >= avgTime) {
    appliedGrade = 'okay'
  }

  // Interval & Mastery Application based purely on the final applied grade:
  if (appliedGrade === 'easy') {
    newInterval = currentInterval * 2
    masteryDelta = 10
  } else if (appliedGrade === 'okay') {
    newInterval = currentInterval * 1.5
    masteryDelta = 5
  } else if (appliedGrade === 'hard') {
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
    appliedGrade,
  }
}
