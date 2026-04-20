import Card from '../ui/Card'
import Badge from '../ui/Badge'

export default function MentorInsights({ analysis }) {
  return (
    <Card title="Weakness Analysis">
      {!analysis?.weakTopics?.length ? (
        <p className="text-sm text-zinc-400">Generate analysis to view weak topics.</p>
      ) : (
        <div className="space-y-3">
          {analysis.weakTopics.map((topic) => (
            <div key={topic.topic} className="rounded-lg border border-zinc-800 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-medium text-zinc-100">{topic.topic}</p>
                <Badge tone={topic.urgency === 'high' ? 'danger' : 'warning'}>{topic.urgency}</Badge>
              </div>
              <p className="text-xs text-zinc-400">{topic.recommendation || topic.reason}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
