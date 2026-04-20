import Card from '../ui/Card'
import Badge from '../ui/Badge'

export default function RevisionQueue({ items = [] }) {
  return (
    <Card title="Revision Queue">
      {items.length === 0 ? (
        <p className="text-sm text-zinc-400">No revision tasks due today.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-zinc-800 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-zinc-100">{item.questionTitle}</h4>
                <Badge tone="warning">Due today</Badge>
              </div>
              <p className="text-xs text-zinc-400">{item.reason || 'Practice to retain speed and pattern recall.'}</p>
            </article>
          ))}
        </div>
      )}
    </Card>
  )
}
