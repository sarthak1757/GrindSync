import Card from '../components/ui/Card'

export default function Profile() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Card title="Stats Overview"><p className="text-sm text-zinc-300">Total solved, streak trends, and topic breakdown live here.</p></Card>
      <Card title="Solve History Calendar"><p className="text-sm text-zinc-400">Contribution-style calendar scaffold is ready for data binding.</p></Card>
      <Card title="Achievements"><p className="text-sm text-zinc-400">Badges and milestones will appear as you progress.</p></Card>
    </div>
  )
}
