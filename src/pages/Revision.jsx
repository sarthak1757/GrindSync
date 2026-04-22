import { useCallback, useMemo, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useQuestions } from '../context/QuestionContext'
import { useRevisionScheduler } from '../hooks/useRevisionScheduler'

// How long the fade-out animation plays before the card is removed (ms)
const DISMISS_DURATION = 320

export default function Revision() {
  const { revisionQueue, questions } = useQuestions()
  const { markRevised, snoozeRevision } = useRevisionScheduler()

  const [processingId, setProcessingId]   = useState(null)
  const [timeByQueueId, setTimeByQueueId] = useState({})

  // IDs currently mid-animation (fade-out started, Firestore call in-flight)
  const [dismissingIds, setDismissingIds] = useState(new Set())
  // IDs fully gone — keeps card hidden even if Firestore snapshot arrives before animation ends
  const [dismissedIds,  setDismissedIds]  = useState(new Set())

  // Ref so async callbacks always read the latest dismissedIds without stale closure
  const dismissedRef = useRef(new Set())

  // Start the exit animation then fire the actual work
  const dismiss = useCallback(async (queueId, work) => {
    // Kick off fade-out immediately
    setDismissingIds((prev) => new Set(prev).add(queueId))
    setProcessingId(queueId)

    // Let animation play, then commit removal and run Firestore work in parallel
    await new Promise((resolve) => setTimeout(resolve, DISMISS_DURATION))

    dismissedRef.current.add(queueId)
    setDismissedIds((prev) => new Set(prev).add(queueId))
    setDismissingIds((prev) => { const s = new Set(prev); s.delete(queueId); return s })
    setProcessingId(null)

    // Fire Firestore update after animation — user already sees it's gone
    try { await work() } catch { /* toast already shown by hook on error */ }
  }, [])

  const handleRevision = useCallback(async (queueItem, feeling) => {
    const q = questions.find((item) => item.id === queueItem.questionId)
    if (!q) return
    const timeTaken = Number(timeByQueueId[queueItem.id] || q.revision?.averageTimeMins || 20)
    await dismiss(queueItem.id, () => markRevised(q, feeling, timeTaken, queueItem.id))
  }, [questions, timeByQueueId, dismiss, markRevised])

  const handleSnooze = useCallback(async (queueItem) => {
    await dismiss(queueItem.id, () => snoozeRevision(queueItem.id))
  }, [dismiss, snoozeRevision])

  // Derive visible list — exclude fully dismissed items + apply existing status filter + sort
  const pendingQueue = useMemo(
    () =>
      [...revisionQueue]
        .filter(
          (item) =>
            (item.status === 'pending' || item.status === 'snoozed') &&
            !dismissedRef.current.has(item.id),
        )
        .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revisionQueue, dismissedIds], // dismissedIds triggers re-memo when set changes
  )

  const allCaughtUp = pendingQueue.length === 0 && dismissingIds.size === 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Revision Queue</h1>
        {pendingQueue.length > 0 && (
          <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-400">
            {pendingQueue.length} due today
          </span>
        )}
      </div>

      {/* All-caught-up state */}
      {allCaughtUp && (
        <Card>
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <span className="text-3xl">✅</span>
            <p className="font-medium text-zinc-200">All caught up!</p>
            <p className="text-sm text-zinc-400">No pending revisions. Come back tomorrow.</p>
          </div>
        </Card>
      )}

      {/* Revision cards */}
      {pendingQueue.map((item) => {
        const isDismissing = dismissingIds.has(item.id)

        return (
          <div
            key={item.id}
            style={{
              transition: `opacity ${DISMISS_DURATION}ms ease, transform ${DISMISS_DURATION}ms ease, max-height ${DISMISS_DURATION}ms ease`,
              opacity: isDismissing ? 0 : 1,
              transform: isDismissing ? 'translateY(-8px) scale(0.98)' : 'translateY(0) scale(1)',
              overflow: 'hidden',
              maxHeight: isDismissing ? '0px' : '600px',
            }}
          >
            <Card>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-zinc-100">{item.questionTitle}</h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {item.reason || 'Scheduled by spaced repetition algorithm.'}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-500">
                  Due: {item.scheduledFor ? new Date(item.scheduledFor).toLocaleDateString() : 'Today'}
                </span>
              </div>

              <div className="mt-3 max-w-[220px]">
                <label className="mb-1 block text-xs text-zinc-400">Time taken (mins)</label>
                <input
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={timeByQueueId[item.id] || ''}
                  onChange={(e) =>
                    setTimeByQueueId((prev) => ({ ...prev, [item.id]: Number(e.target.value || 0) }))
                  }
                  placeholder="e.g. 18"
                  min={1}
                  type="number"
                  disabled={isDismissing || processingId === item.id}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => handleRevision(item, 'easy')}
                  disabled={!!processingId || isDismissing}
                >
                  Easy
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleRevision(item, 'okay')}
                  disabled={!!processingId || isDismissing}
                >
                  Okay
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleRevision(item, 'hard')}
                  disabled={!!processingId || isDismissing}
                >
                  Hard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleSnooze(item)}
                  disabled={!!processingId || isDismissing}
                >
                  Snooze 1 day
                </Button>
              </div>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
