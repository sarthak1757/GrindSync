import { useMemo } from 'react'
import { Sparkles, Target, Activity } from 'lucide-react'
import RecentActivity from '../components/dashboard/RecentActivity'
import RevisionQueue from '../components/dashboard/RevisionQueue'
import StatsCard from '../components/dashboard/StatsCard'
import Card from '../components/ui/Card'
import { useQuestions } from '../context/QuestionContext'

export default function Dashboard() {
  const { questions, revisionQueue, userDoc } = useQuestions()
  const studyPlan = userDoc?.studyPlan

  const todayStats = useMemo(() => {
    const solvedToday = questions.filter((q) => q.solveHistory?.some((s) => new Date(s.solvedAt).toDateString() === new Date().toDateString())).length
    const dailyGoal = studyPlan?.weeks?.[0]?.dailyGoal || 5
    return { solvedToday, dailyGoal, progress: Math.min(100, Math.round((solvedToday / dailyGoal) * 100)) }
  }, [questions, studyPlan])

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

      {studyPlan && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-100">Active Study Plan: {studyPlan.weeks[0]?.theme}</h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-3xl mb-4">{studyPlan.overview}</p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4">
                <Target className="h-4 w-4 text-emerald-400 mb-2" />
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Focus Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {studyPlan.weeks[0]?.topics?.map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs text-zinc-300">{t}</span>)}
                </div>
              </div>
              
              <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4">
                <Activity className="h-4 w-4 text-amber-400 mb-2" />
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Milestone</p>
                <p className="text-sm text-zinc-300">{studyPlan.weeks[0]?.milestone}</p>
              </div>

              <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4 sm:col-span-2 lg:col-span-1">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">Up Next</p>
                <ul className="space-y-1">
                  {studyPlan.weeks[0]?.specificQuestions?.slice(0, 3).map((q, i) => (
                    <li key={i} className="text-xs flex items-center justify-between">
                      <span className="text-zinc-300 truncate pr-2">{q.title}</span>
                      <span className="text-zinc-500">{q.difficulty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        <RevisionQueue items={revisionQueue.slice(0, 5)} />
        <RecentActivity events={recentEvents} />
      </section>

      {!studyPlan && (
        <Card title="Weak Topics Summary">
          <p className="text-sm text-zinc-400">Arrays, Graphs, and DP currently need reinforcement based on your latest solve cadence. Generate a study plan in the Mentor tab to track progress here.</p>
        </Card>
      )}
    </div>
  )
}
