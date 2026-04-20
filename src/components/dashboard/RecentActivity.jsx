import Card from '../ui/Card'

export default function RecentActivity({ events = [] }) {
  return (
    <Card title="Recent Activity">
      {events.length === 0 ? (
        <p className="text-sm text-zinc-400">No recent activity yet.</p>
      ) : (
        <ul className="space-y-2 text-sm text-zinc-300">
          {events.map((event) => (
            <li key={event.id} className="rounded-lg border border-zinc-800 px-3 py-2">{event.text}</li>
          ))}
        </ul>
      )}
    </Card>
  )
}
