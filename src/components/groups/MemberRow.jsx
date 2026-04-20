export default function MemberRow({ member }) {
  const stats = member.weeklyStats || {}
  return (
    <div className="rounded-lg border border-zinc-800 px-3 py-2 text-sm">
      <div className="flex items-center justify-between">
        <span>{member.displayName}</span>
        <span className="text-zinc-400">Streak: {stats.currentStreak || 0}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>Q: {stats.questionsSolved || 0}</span>
        <span>R: {stats.revisionsCompleted || 0}</span>
        <span>W: {stats.challengesWon || 0}</span>
      </div>
    </div>
  )
}
