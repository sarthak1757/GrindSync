import Card from '../ui/Card'

export default function Leaderboard({ rows = [] }) {
  return (
    <Card title="Weekly Leaderboard">
      <div className="space-y-2 text-sm">
        {rows.map((row, idx) => (
          <div key={row.userId || idx} className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2">
            <span>{idx + 1}. {row.displayName}</span>
            <span className="text-indigo-300">{row.score}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
