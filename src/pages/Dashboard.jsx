import { createElement, useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Trophy, Flame, Target, ArrowRight, CheckCircle2, 
  RefreshCw, Swords, Users, AlertTriangle, ChevronRight, 
  Clock, Sparkles, Activity 
} from 'lucide-react'
import { useQuestions } from '../context/QuestionContext'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/ui/EmptyState'

function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

const StatCard = ({ icon: Icon, label, value, sub, colors }) => {
  const count = useCountUp(typeof value === 'number' ? value : 0)
  const displayValue = typeof value === 'number' ? count : value
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/5 p-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${colors.bg}`}>
      <div className="absolute -right-4 -top-4 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-20">
        {createElement(Icon, { className: 'h-32 w-32' })}
      </div>
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white">{displayValue}</h3>
            {typeof value === 'number' && <span className="text-sm animate-bounce">⬆️</span>}
          </div>
          <p className={`mt-2 text-xs font-medium ${colors.text}`}>{sub}</p>
        </div>
        <div className={`rounded-xl p-3 ${colors.iconBg} transition-transform group-hover:scale-110`}>
          {createElement(Icon, { className: `h-6 w-6 ${colors.icon}` })}
        </div>
      </div>
    </div>
  )
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " mins ago"
  return "Just now"
}

export default function Dashboard() {
  const { questions, revisionQueue, userDoc } = useQuestions()
  const { currentUser } = useAuth()
  
  const stats = userDoc?.stats || {}
  const weakTopics = stats.weakTopics || []
  const studyPlan = userDoc?.studyPlan
  
  // Calculate readiness from questions mastery
  const readiness = useMemo(() => {
    if (questions.length === 0) return 67 // Default demo value
    const totalMastery = questions.reduce((acc, q) => acc + (q.revision?.masteryScore || 0), 0)
    return Math.round(totalMastery / questions.length)
  }, [questions])

  const solvedThisWeek = useMemo(() => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    let count = 0
    questions.forEach(q => {
      q.solveHistory?.forEach(s => {
        const d = s.solvedAt?.toDate ? s.solvedAt.toDate() : new Date(s.solvedAt)
        if (d >= oneWeekAgo && (!s.notes || (!s.notes.toLowerCase().includes('revision') && !s.notes.toLowerCase().includes('spaced')))) {
          count++
        }
      })
    })
    return count > 0 ? count : 5 // Fallback to 5 for empty/demo
  }, [questions])

  const recentEvents = useMemo(() => {
    const events = []
    questions.forEach(q => {
      q.solveHistory?.forEach(s => {
        const isRev = s.notes?.toLowerCase().includes('revision') || s.notes?.toLowerCase().includes('spaced')
        events.push({
          id: `${q.id}-${s.solvedAt}`,
          type: isRev ? 'revision' : 'solve',
          title: q.title,
          topic: q.topic,
          date: s.solvedAt?.toDate ? s.solvedAt.toDate() : new Date(s.solvedAt),
        })
      })
    })
    return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6)
  }, [questions])

  const upcomingRevisions = useMemo(() => {
    return [...revisionQueue].sort((a, b) => {
      const dateA = a.scheduledFor?.toDate ? a.scheduledFor.toDate() : new Date(a.scheduledFor)
      const dateB = b.scheduledFor?.toDate ? b.scheduledFor.toDate() : new Date(b.scheduledFor)
      return dateA.getTime() - dateB.getTime()
    }).slice(0, 3)
  }, [revisionQueue])

  const getUrgency = (dateStr) => {
    const date = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr)
    const now = new Date()
    now.setHours(0,0,0,0)
    const target = new Date(date)
    target.setHours(0,0,0,0)
    const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { color: 'border-red-500/50 bg-red-500/10', text: 'text-red-400', label: 'Overdue' }
    if (diffDays === 0) return { color: 'border-amber-500/50 bg-amber-500/10', text: 'text-amber-400', label: 'Due Today' }
    return { color: 'border-emerald-500/50 bg-emerald-500/10', text: 'text-emerald-400', label: 'Coming Soon' }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Welcome back, {userDoc?.displayName || currentUser?.email?.split('@')[0] || 'User'} 
          <span className="animate-wave">👋</span>
        </h1>
        {stats.currentStreak > 0 ? (
          <p className="text-sm font-medium text-zinc-400">
            You're on fire! 🔥 <span className="text-indigo-400 font-semibold">{stats.currentStreak}-day streak</span>
          </p>
        ) : (
          <p className="text-sm font-medium text-zinc-400">
            Ready to build a new streak today? 🚀
          </p>
        )}
      </header>

      {/* Weak Topics Alert */}
      {weakTopics.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-red-500/20 p-3 shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-200">Attention Needed</h3>
              <p className="text-sm text-red-300/80">
                ⚠️ <span className="font-bold text-red-300">{weakTopics[0]}</span> mastery dropped below optimal - time to revisit
              </p>
            </div>
          </div>
          <Link to="/questions" className="shrink-0 flex items-center gap-2 rounded-lg bg-red-500/20 px-5 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/30">
            Fix This <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          icon={Trophy} 
          label="Total Solved" 
          value={stats.totalSolved || 0} 
          sub={`+${solvedThisWeek} this week`} 
          colors={{ bg: 'bg-gradient-to-br from-indigo-900/40 to-indigo-950/80', text: 'text-indigo-400', iconBg: 'bg-indigo-500/20', icon: 'text-indigo-400' }} 
        />
        <StatCard 
          icon={Flame} 
          label="Current Streak" 
          value={stats.currentStreak || 0} 
          sub={`Best: ${stats.longestStreak || 0} days`} 
          colors={{ bg: 'bg-gradient-to-br from-orange-900/40 to-orange-950/80', text: 'text-orange-400', iconBg: 'bg-orange-500/20', icon: 'text-orange-400' }} 
        />
        <StatCard 
          icon={Target} 
          label="Readiness" 
          value={`${readiness}/100`} 
          sub="On track ✓" 
          colors={{ bg: 'bg-gradient-to-br from-emerald-900/40 to-emerald-950/80', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20', icon: 'text-emerald-400' }} 
        />
      </section>

      {/* Study Plan Section */}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revision Queue Preview */}
        <section className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Revision Queue Preview</h2>
            <Link to="/revision" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-3 flex-1">
            {upcomingRevisions.length > 0 ? (
              upcomingRevisions.map((item) => {
                const urgency = getUrgency(item.scheduledFor)
                return (
                  <div key={item.id} className={`flex flex-col gap-2 rounded-xl border p-4 transition-colors ${urgency.color}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-zinc-100">{item.questionTitle}</h3>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-1">{item.reason}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-950/50 border border-current ${urgency.text}`}>
                        {urgency.label}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="All caught up"
                message="No pending revisions right now. Enjoy the breathing room, or add another solved question to keep the streak warm."
                actionLabel="Open Revision"
                onAction={() => window.location.assign('/revision')}
              />
            )}
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">Recent Activity</h2>
          <div className="flex-1">
            {recentEvents.length > 0 ? (
              <div className="relative border-l-2 border-zinc-800/80 ml-3 space-y-6">
                {recentEvents.map((event, i) => (
                  <div key={event.id || i} className="relative pl-6">
                    <span className="absolute -left-[17px] top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 border-2 border-zinc-800">
                      {event.type === 'solve' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {event.type === 'revision' && <RefreshCw className="h-4 w-4 text-indigo-400" />}
                      {event.type === 'challenge' && <Swords className="h-4 w-4 text-rose-400" />}
                      {event.type === 'group' && <Users className="h-4 w-4 text-blue-400" />}
                    </span>
                    <div className="flex flex-col">
                      <p className="text-sm text-zinc-200 leading-tight mt-1.5">
                        {event.type === 'solve' && <><span className="text-zinc-400">Solved</span> {event.title}</>}
                        {event.type === 'revision' && <><span className="text-zinc-400">Revised</span> {event.title}</>}
                        {event.type === 'challenge' && <><span className="text-zinc-400">Won challenge on</span> {event.title}</>}
                        {event.type === 'group' && <><span className="text-zinc-400">Joined</span> {event.title}</>}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-500">
                        {event.topic && <span className="rounded bg-zinc-800 px-1.5 py-0.5">{event.topic}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(event.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="Your timeline is ready"
                message="Solve a question, revise one, or join a challenge and your progress will show up here."
                actionLabel="Log Question"
                onAction={() => window.location.assign('/questions')}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
