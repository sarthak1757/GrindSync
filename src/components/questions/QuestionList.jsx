import { useState } from 'react'
import QuestionCard from './QuestionCard'
import { ClipboardList, RefreshCw } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import { SkeletonCard } from '../ui/Skeleton'

export default function QuestionList({ questions, onView, onAdd }) {
  const [pullStart, setPullStart] = useState(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleTouchStart = (event) => {
    if (window.scrollY > 4) return
    setPullStart(event.touches[0].clientY)
  }

  const handleTouchMove = (event) => {
    if (pullStart === null) return
    const distance = Math.max(0, event.touches[0].clientY - pullStart)
    setPullDistance(Math.min(distance, 84))
  }

  const handleTouchEnd = () => {
    if (pullDistance > 64) {
      setRefreshing(true)
      window.setTimeout(() => {
        setRefreshing(false)
        setPullDistance(0)
      }, 750)
    } else {
      setPullDistance(0)
    }
    setPullStart(null)
  }

  if (refreshing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-300">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Refreshing your question list
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (!questions?.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No questions found"
        message="Your current filters are hiding everything, or you have not logged a problem yet. Add one now and GrindSync will start tracking your mastery."
        actionLabel="Add Question"
        onAction={onAdd}
      />
    )
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <div
        className="pointer-events-none mb-3 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-300 transition-all"
        style={{ height: pullDistance ? 32 : 0, opacity: pullDistance / 84 }}
      >
        <RefreshCw className="h-4 w-4" />
        Pull to refresh
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {questions.map((question) => <QuestionCard key={question.id} question={question} onView={onView} />)}
      </div>
    </div>
  )
}
