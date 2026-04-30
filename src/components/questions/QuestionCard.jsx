import { useState } from 'react'
import { Code2, Terminal, Clock, CalendarDays, Target, ExternalLink, RotateCcw, CheckCircle2 } from 'lucide-react'

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + "y ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + "mo ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + "d ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + "h ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + "m ago"
  return "Just now"
}

const MasteryCircle = ({ score }) => {
  const color = score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-rose-500'
  const strokeColor = score >= 70 ? 'stroke-emerald-500' : score >= 40 ? 'stroke-amber-500' : 'stroke-rose-500'
  const dashOffset = 100 - score
  return (
    <div className="relative flex items-center justify-center w-12 h-12 group-hover:scale-110 transition-transform duration-500">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          className="stroke-zinc-800"
          strokeWidth="3"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeWidth="3"
          strokeDasharray="100, 100"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className={`absolute text-[11px] font-bold ${color}`}>
        {score}%
      </div>
    </div>
  )
}

export default function QuestionCard({ question, onView }) {
  const [touchStart, setTouchStart] = useState(null)
  const [dragX, setDragX] = useState(0)
  const lastHistory = question.solveHistory?.[question.solveHistory.length - 1]
  const lastSolved = lastHistory?.solvedAt?.toDate 
    ? timeAgo(lastHistory.solvedAt.toDate()) 
    : (lastHistory?.solvedAt ? timeAgo(new Date(lastHistory.solvedAt)) : 'N/A')

  const nextRevisionStr = question.revision?.nextRevisionDate?.toDate 
    ? question.revision.nextRevisionDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : (question.revision?.nextRevisionDate ? new Date(question.revision.nextRevisionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD')

  const masteryScore = question.revision?.masteryScore ?? 0
  const avgTime = question.revision?.averageTimeMins || 0
  const diffLower = question.difficulty?.toLowerCase() || 'intermediate'
  
  const diffColors = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }

  const handleTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX)
  }

  const handleTouchMove = (event) => {
    if (touchStart === null) return
    const delta = event.touches[0].clientX - touchStart
    setDragX(Math.max(-92, Math.min(92, delta)))
  }

  const handleTouchEnd = () => {
    if (Math.abs(dragX) > 64) {
      window.navigator?.vibrate?.(8)
    }
    setTouchStart(null)
    setDragX(0)
  }

  return (
    <div 
      className="group relative flex touch-pan-y flex-col rounded-2xl border border-zinc-800 bg-zinc-950/78 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-[0_12px_40px_rgb(0,0,0,0.4),0_0_26px_rgba(99,102,241,0.08)] hover:bg-zinc-950 cursor-pointer"
      style={{ transform: dragX ? `translateX(${dragX}px)` : undefined }}
      onClick={() => onView(question)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-300 transition-opacity ${dragX > 28 ? 'opacity-100' : 'opacity-0'}`}>
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-300 transition-opacity ${dragX < -28 ? 'opacity-100' : 'opacity-0'}`}>
        <RotateCcw className="h-5 w-5" />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${diffColors[diffLower] || diffColors.intermediate}`}>
              {question.difficulty}
            </span>
            {question.platform && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-800 px-2 py-0.5 rounded">
                {question.platform.toLowerCase() === 'leetcode' ? <Code2 className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                {question.platform}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
            {question.title}
          </h3>
          
          <div className="flex flex-wrap gap-1.5">
            {/* Fallback to topic array if it exists or split the string */}
            {(question.topic || 'General').split(',').map(t => (
              <span key={t} className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-[10px] font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                {t.trim()}
              </span>
            ))}
          </div>
        </div>
        
        <div className="shrink-0">
          <MasteryCircle score={masteryScore} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-800/60 pt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Avg</span>
          </div>
          <span className="text-xs font-medium text-zinc-300">{avgTime}m</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Last</span>
          </div>
          <span className="text-xs font-medium text-zinc-300">{lastSolved}</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Target className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Next</span>
          </div>
          <span className="text-xs font-medium text-zinc-300">{nextRevisionStr}</span>
        </div>
      </div>

      {/* Hover Reveal Button */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-4 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] pointer-events-auto">
          View Details <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </div>
  )
}
