import { useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useQuestions } from '../context/QuestionContext'
import { useRevisionScheduler } from '../hooks/useRevisionScheduler'

export default function Revision() {
  const { revisionQueue, questions } = useQuestions()
  const { markRevised, snoozeRevision } = useRevisionScheduler()
  const [processingId, setProcessingId] = useState(null)
  const [timeByQueueId, setTimeByQueueId] = useState({})

  const pendingQueue = useMemo(
    () =>
      [...revisionQueue]
        .filter((item) => item.status === 'pending' || item.status === 'snoozed')
        .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
    [revisionQueue],
  )

  const handleRevision = async (queueItem, feeling) => {
    const q = questions.find((item) => item.id === queueItem.questionId)
    if (!q) return
    setProcessingId(queueItem.id)
    try {
      const timeTaken = Number(timeByQueueId[queueItem.id] || q.revision?.averageTimeMins || 20)
      await markRevised(q, feeling, timeTaken)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Revision Queue</h1>
      {!pendingQueue.length && (
        <Card>
          <p className="text-sm text-zinc-400">All caught up. No pending revisions.</p>
        </Card>
      )}
      {pendingQueue.map((item) => (
        <Card key={item.id}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-zinc-100">{item.questionTitle}</h3>
            <span className="text-xs text-zinc-400">
              Due: {item.scheduledFor ? new Date(item.scheduledFor).toLocaleDateString() : 'Today'}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {item.reason || 'Scheduled by spaced repetition algorithm.'}
          </p>
          <div className="mt-3 max-w-[220px]">
            <label className="mb-1 block text-xs text-zinc-400">Time taken (mins)</label>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={timeByQueueId[item.id] || ''}
              onChange={(e) =>
                setTimeByQueueId((prev) => ({ ...prev, [item.id]: Number(e.target.value || 0) }))
              }
              placeholder="e.g. 18"
              min={1}
              type="number"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => handleRevision(item, 'easy')} disabled={processingId === item.id}>
              Easy
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleRevision(item, 'okay')}
              disabled={processingId === item.id}
            >
              Okay
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRevision(item, 'hard')}
              disabled={processingId === item.id}
            >
              Hard
            </Button>
            <Button
              variant="ghost"
              onClick={() => snoozeRevision(item.id)}
              disabled={processingId === item.id}
            >
              Snooze 1 day
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
