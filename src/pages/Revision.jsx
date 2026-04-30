import { useCallback, useMemo, useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useQuestions } from '../context/QuestionContext'
import { useRevisionScheduler } from '../hooks/useRevisionScheduler'
import { CheckCircle2, Clock, Zap, Star, AlertTriangle, Trophy, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

// ── Timer Component ────────────────────────────────────────────────────────
function ActiveTimer({ averageTimeMins, onTimeUpdate, isPaused }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isPaused])

  useEffect(() => {
    onTimeUpdate(Math.max(1, Math.floor(seconds / 60)))
  }, [seconds, onTimeUpdate])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  const avgSecs = (averageTimeMins || 20) * 60
  let color = 'text-emerald-400'
  let glow = 'shadow-[0_0_20px_rgba(52,211,153,0.1)]'
  let pulse = ''

  if (seconds > avgSecs * 0.8) {
    color = 'text-amber-400'
    glow = 'shadow-[0_0_20px_rgba(251,191,36,0.1)]'
  }
  if (seconds > avgSecs * 1.2) {
    color = 'text-rose-400'
    glow = 'shadow-[0_0_30px_rgba(244,63,94,0.2)]'
    pulse = 'animate-pulse'
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800/80 ${glow} transition-all duration-700`}>
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Elapsed Time</span>
      <div className={`text-6xl font-mono font-bold tracking-tighter ${color} ${pulse} transition-colors duration-500`}>
        {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      </div>
      <span className="text-xs text-zinc-500 mt-2 font-medium">Avg: {averageTimeMins || 20}m</span>
    </div>
  )
}

// ── Revision View ────────────────────────────────────────────────────────
export default function Revision() {
  const { revisionQueue, questions } = useQuestions()
  const { markRevised, snoozeRevision } = useRevisionScheduler()

  const [processingId, setProcessingId] = useState(null)
  const [flippedState, setFlippedState] = useState(null) // { feeling, timeTaken, gradeText, xp, queueId }
  const [manualTime, setManualTime] = useState('')
  const [useTimer, setUseTimer] = useState(true)
  const [timerMins, setTimerMins] = useState(1)

  // IDs currently fully dismissed
  const [dismissedIds, setDismissedIds] = useState(new Set())

  // Compute completed today
  const completedToday = useMemo(() => {
    let count = 0
    const today = new Date().toDateString()
    questions.forEach(q => {
      q.solveHistory?.forEach(s => {
        const d = s.solvedAt?.toDate ? s.solvedAt.toDate() : new Date(s.solvedAt)
        if (d.toDateString() === today && (s.notes?.toLowerCase().includes('revision') || s.notes?.toLowerCase().includes('spaced'))) {
          count++
        }
      })
    })
    return count
  }, [questions])

  // Derive visible list
  const pendingQueue = useMemo(
    () =>
      [...revisionQueue]
        .filter(
          (item) =>
            (item.status === 'pending' || item.status === 'snoozed') &&
            !dismissedIds.has(item.id),
        )
        .sort((a, b) => {
          const dateA = a.scheduledFor?.toDate ? a.scheduledFor.toDate() : new Date(a.scheduledFor)
          const dateB = b.scheduledFor?.toDate ? b.scheduledFor.toDate() : new Date(b.scheduledFor)
          return dateA.getTime() - dateB.getTime()
        }),
    [revisionQueue, dismissedIds],
  )

  const totalToday = pendingQueue.length + completedToday
  const progressPercent = totalToday === 0 ? 100 : Math.round((completedToday / totalToday) * 100)
  const allCaughtUp = pendingQueue.length === 0 && !flippedState

  // The single active card
  const activeItem = pendingQueue[0]
  const activeQuestion = activeItem ? questions.find((q) => q.id === activeItem.questionId) : null

  // Process submission
  const handleSubmit = useCallback(async (feeling) => {
    if (!activeItem || !activeQuestion) return
    
    const timeTaken = useTimer ? timerMins : (Number(manualTime) || activeQuestion.revision?.averageTimeMins || 20)
    
    let gradeText = ''
    let xp = 0
    if (feeling === 'easy') { gradeText = 'Perfect recall! Interval doubled.'; xp = 20; }
    else if (feeling === 'okay') { gradeText = 'Good job. Interval increased slightly.'; xp = 10; }
    else { gradeText = "Don't worry - you'll nail it next time! 💪"; xp = 5; }

    setFlippedState({ feeling, timeTaken, gradeText, xp, queueId: activeItem.id })
    setProcessingId(activeItem.id)

    // Show the back of the card for 2.5 seconds, then dismiss and update Firestore
    setTimeout(async () => {
      setDismissedIds((prev) => new Set(prev).add(activeItem.id))
      setFlippedState(null)
      setProcessingId(null)
      setManualTime('')
      setUseTimer(true)
      setTimerMins(1)

      try {
        await markRevised(activeQuestion, feeling, timeTaken, activeItem.id)
      } catch (e) { console.error(e) }
    }, 2500)
  }, [activeItem, activeQuestion, useTimer, timerMins, manualTime, markRevised])

  const handleSnooze = useCallback(async () => {
    if (!activeItem) return
    setProcessingId(activeItem.id)
    setDismissedIds((prev) => new Set(prev).add(activeItem.id))
    setProcessingId(null)
    try {
      await snoozeRevision(activeItem.id)
    } catch (e) { console.error(e) }
  }, [activeItem, snoozeRevision])

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      
      {/* ── Header & Progress ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-400" />
            Daily Training
          </h1>
          <div className="text-right">
            <p className="text-sm font-bold text-zinc-300">
              {completedToday} of {totalToday} completed
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── All Caught Up State ────────────────────────────────────────────── */}
      {allCaughtUp && (
        <div className="animate-count-up flex flex-col items-center justify-center p-16 text-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-50 blur-xl"></div>
          <Trophy className="h-24 w-24 text-emerald-400 mb-6 relative z-10 animate-bounce" strokeWidth={1} />
          <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10">Mission Accomplished!</h2>
          <p className="text-zinc-300 max-w-md relative z-10 mb-8">
            You've completed all your scheduled revisions for today. Your memory traces are strengthening.
          </p>
          <Link to="/questions" className="relative z-10 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
            <Sparkles className="w-5 h-5" /> Browse Questions
          </Link>
        </div>
      )}

      {/* ── Active Revision Card ───────────────────────────────────────────── */}
      {!allCaughtUp && activeItem && activeQuestion && (
        <div className="relative perspective-1000 w-full min-h-[500px]">
          <div 
            className={`w-full h-full absolute top-0 left-0 transition-all duration-700 transform-style-3d ${
              flippedState?.queueId === activeItem.id ? 'rotate-y-180' : ''
            }`}
          >
            
            {/* FRONT OF CARD */}
            <div className="absolute w-full h-full backface-hidden">
              <Card className="h-full flex flex-col border-zinc-700/50 bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-widest rounded-lg border border-indigo-500/30">
                    Up Next
                  </span>
                  <span className="text-sm font-medium text-zinc-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {activeItem.reason || 'Scheduled by algorithm'}
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                  <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">{activeItem.questionTitle}</h2>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-md border border-zinc-700">
                      {activeQuestion.topic || 'General'}
                    </span>
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-md border border-zinc-700">
                      {activeQuestion.difficulty}
                    </span>
                  </div>

                  {useTimer ? (
                    <ActiveTimer 
                      averageTimeMins={activeQuestion.revision?.averageTimeMins} 
                      onTimeUpdate={setTimerMins}
                      isPaused={!!processingId}
                    />
                  ) : (
                    <div className="w-full max-w-xs mx-auto">
                      <label className="block text-sm font-semibold text-zinc-400 mb-2">Manual Time (mins)</label>
                      <input
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-lg font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        placeholder={`Avg: ${activeQuestion.revision?.averageTimeMins || 20}m`}
                        type="number"
                        disabled={!!processingId}
                      />
                    </div>
                  )}

                  <button 
                    onClick={() => setUseTimer(!useTimer)}
                    className="mt-4 text-xs font-semibold text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    {useTimer ? 'Enter time manually' : 'Use timer'}
                  </button>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3 mt-8">
                  <button
                    onClick={() => handleSubmit('hard')}
                    disabled={!!processingId}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span className="text-xl mb-1">😓</span>
                    <span className="font-bold tracking-wide">Hard</span>
                  </button>
                  <button
                    onClick={() => handleSubmit('okay')}
                    disabled={!!processingId}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span className="text-xl mb-1">👍</span>
                    <span className="font-bold tracking-wide">Okay</span>
                  </button>
                  <button
                    onClick={() => handleSubmit('easy')}
                    disabled={!!processingId}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span className="text-xl mb-1">🧠</span>
                    <span className="font-bold tracking-wide">Easy</span>
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={handleSnooze}
                    disabled={!!processingId}
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-300 underline underline-offset-4 disabled:opacity-50"
                  >
                    Snooze for 1 day
                  </button>
                </div>
              </Card>
            </div>

            {/* BACK OF CARD (Feedback) */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180">
              <Card className={`h-full flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 transition-colors duration-500 ${
                flippedState?.feeling === 'easy' ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]' :
                flippedState?.feeling === 'okay' ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.2)]' :
                'border-rose-500/50 bg-rose-500/10 shadow-[0_0_50px_rgba(244,63,94,0.2)]'
              }`}>
                
                {flippedState?.feeling === 'easy' && <Sparkles className="w-20 h-20 text-emerald-400 mb-6 animate-pulse" />}
                {flippedState?.feeling === 'okay' && <CheckCircle2 className="w-20 h-20 text-blue-400 mb-6 animate-pulse" />}
                {flippedState?.feeling === 'hard' && <Star className="w-20 h-20 text-rose-400 mb-6 animate-pulse" />}

                <h2 className={`text-3xl font-extrabold mb-4 ${
                  flippedState?.feeling === 'easy' ? 'text-emerald-300' :
                  flippedState?.feeling === 'okay' ? 'text-blue-300' : 'text-rose-300'
                }`}>
                  {flippedState?.gradeText}
                </h2>

                <div className="flex items-center justify-center gap-8 mb-8 mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Your Time</span>
                    <span className="text-2xl font-mono font-bold text-white">{flippedState?.timeTaken}m</span>
                  </div>
                  <div className="w-px h-12 bg-zinc-700/50"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Average</span>
                    <span className="text-2xl font-mono font-bold text-zinc-300">{activeQuestion?.revision?.averageTimeMins || 20}m</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-6 py-2 rounded-full font-bold text-lg border border-yellow-500/30 animate-bounce">
                  +{flippedState?.xp} XP 🌟
                </div>

                <p className="absolute bottom-6 text-sm text-zinc-500 animate-pulse">
                  Moving to next question...
                </p>
              </Card>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
