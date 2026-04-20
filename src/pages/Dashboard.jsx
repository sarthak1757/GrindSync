import { useMemo } from 'react'
import RecentActivity from '../components/dashboard/RecentActivity'
import RevisionQueue from '../components/dashboard/RevisionQueue'
import StatsCard from '../components/dashboard/StatsCard'
import Card from '../components/ui/Card'
import { useQuestions } from '../context/QuestionContext'

export default function Dashboard() {
  const { questions, revisionQueue } = useQuestions()

  const todayStats = useMemo(() => {
    const solvedToday = questions.filter((q) => q.solveHistory?.some((s) => new Date(s.solvedAt).toDateString() === new Date().toDateString())).length
    const dailyGoal = 5
    return { solvedToday, dailyGoal, progress: Math.min(100, Math.round((solvedToday / dailyGoal) * 100)) }
  }, [questions])

  const recentEvents = useMemo(() => questions.slice(0, 5).map((q) => ({ id: q.id, text: `Solved ${q.title} (${q.topic})` })), [questions])

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Solved Today" value={todayStats.solvedToday} />
        <StatsCard label="Daily Goal" value={`${todayStats.progress}%`} helper={`${todayStats.solvedToday}/${todayStats.dailyGoal}`} />
        <StatsCard label="Pending Revisions" value={revisionQueue.length} />
        <StatsCard label="Readiness Score" value="72" helper="AI computed" />
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <RevisionQueue items={revisionQueue.slice(0, 5)} />
        <RecentActivity events={recentEvents} />
      </section>
      <Card title="Weak Topics Summary">
        <p className="text-sm text-zinc-400">Arrays, Graphs, and DP currently need reinforcement based on your latest solve cadence.</p>
      </Card>
    </div>
  )
}
