import Modal from '../ui/Modal'
import Badge from '../ui/Badge'

export default function QuestionDetailsModal({ question, open, onClose }) {
  if (!question) return null

  return (
    <Modal open={open} onClose={onClose} title="Question details">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100">{question.title}</h3>
          <p className="mt-1 text-xs text-zinc-400">
            {question.topic} • {question.platform}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">{question.difficulty}</Badge>
          <Badge tone="primary">Mastery: {question.revision?.masteryScore ?? 0}%</Badge>
          <Badge tone="warning">
            Next revision: {question.revision?.nextRevisionDate?.slice?.(0, 10) || 'TBD'}
          </Badge>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-zinc-200">Solve history</h4>
          {question.solveHistory?.length ? (
            <div className="space-y-2">
              {question.solveHistory.map((entry, index) => (
                <article key={`${entry.solvedAt}-${index}`} className="rounded-lg border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-300">
                    {new Date(entry.solvedAt).toLocaleString()} • {entry.timeTakenMins} mins • felt{' '}
                    {entry.felt}
                  </p>
                  {entry.notes ? <p className="mt-1 text-xs text-zinc-400">{entry.notes}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No solve history available yet.</p>
          )}
        </div>

        {question.url ? (
          <a
            href={question.url}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-indigo-300 hover:text-indigo-200"
          >
            Open original question
          </a>
        ) : null}
      </div>
    </Modal>
  )
}
