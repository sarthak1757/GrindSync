import Badge from '../ui/Badge'
import Card from '../ui/Card'

export default function QuestionCard({ question, onView }) {
  const lastSolved =
    question.solveHistory?.[question.solveHistory.length - 1]?.solvedAt?.slice?.(0, 10) || 'N/A'

  return (
    <Card className="transition hover:border-indigo-500/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <button
            onClick={() => onView(question)}
            className="text-left text-sm font-semibold text-zinc-100 hover:text-indigo-300"
          >
            {question.title}
          </button>
          <p className="mt-1 text-xs text-zinc-400">{question.topic} • {question.platform}</p>
        </div>
        <Badge tone="primary">{question.revision?.masteryScore ?? 0}%</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
        <Badge tone="neutral">{question.difficulty}</Badge>
        <span>Last solved: {lastSolved}</span>
        <span>Next: {question.revision?.nextRevisionDate?.slice?.(0, 10) || 'TBD'}</span>
      </div>
      <button
        onClick={() => onView(question)}
        className="mt-3 text-xs text-indigo-300 hover:text-indigo-200"
      >
        View full history
      </button>
      <div className="mt-2" />
      <div>
        {question.url ? (
          <a
            href={question.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-300"
          >
            Open link
          </a>
        ) : null}
      </div>
    </Card>
  )
}
