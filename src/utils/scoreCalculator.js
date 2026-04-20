export function calculateWeeklyScore({
  questionsSolved = 0,
  revisionsCompleted = 0,
  currentStreak = 0,
  challengesWon = 0,
}) {
  return (questionsSolved * 10) + (revisionsCompleted * 15) + (currentStreak * 5) + (challengesWon * 20)
}
