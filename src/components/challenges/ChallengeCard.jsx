import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { useChallenge } from '../../hooks/useChallenge'

export default function ChallengeCard({ challenge }) {
  const { timeLeftMs } = useChallenge(challenge.expiresAt)
  const totalMinutes = Math.floor(timeLeftMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-zinc-100">{challenge.questionTitle}</p>
          <p className="text-xs text-zinc-400">{challenge.topic} • {challenge.difficulty}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {challenge.challenger?.displayName} vs {challenge.challenged?.displayName}
          </p>
          {challenge.status !== 'completed' ? (
            <p className="mt-1 text-xs text-zinc-500">
              Time left: {hours}h {mins}m
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">
              Winner: {challenge.winner || 'TBD'} •{' '}
              {(challenge.challenger?.timeTakenMins ?? '-')}m vs{' '}
              {(challenge.challenged?.timeTakenMins ?? '-')}m
            </p>
          )}
        </div>
        <Badge tone={challenge.status === 'completed' ? 'success' : 'warning'}>{challenge.status}</Badge>
      </div>
    </Card>
  )
}
