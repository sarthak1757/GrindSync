import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import { calculateWeeklyScore } from '../../utils/scoreCalculator'

export default function GroupCard({ group }) {
  const leaderboardPreview = [...(group.members || [])]
    .map((member) => ({
      ...member,
      score: calculateWeeklyScore(member.weeklyStats || {}),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-100">{group.name}</h3>
          <p className="text-xs text-zinc-400">{group.members?.length || 0} members</p>
        </div>
        <Link className="text-sm text-indigo-300" to={`/groups/${group.id}`}>View</Link>
      </div>
      {leaderboardPreview.length ? (
        <div className="mt-3 space-y-1">
          {leaderboardPreview.map((member, idx) => (
            <div key={member.userId} className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                {idx + 1}. {member.displayName}
              </span>
              <span>{member.score}</span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
