import Card from '../ui/Card'

export default function StatsCard({ label, value, helper }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-100">{value}</p>
      {helper && <p className="mt-1 text-xs text-zinc-500">{helper}</p>}
    </Card>
  )
}
