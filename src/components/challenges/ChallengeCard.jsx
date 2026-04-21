import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { useChallenge } from '../../hooks/useChallenge'
import { useAuth } from '../../context/AuthContext'
import { Code2, Trash2 } from 'lucide-react'

export default function ChallengeCard({ challenge, onSolve, onDelete }) {
  const { currentUser } = useAuth()
  const { timeLeftMs } = useChallenge(challenge.expiresAt)
  const totalMinutes = Math.floor(timeLeftMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  const isChallenger = challenge.challenger?.userId === currentUser?.uid
  const isChallenged = challenge.challenged?.userId === currentUser?.uid

  const myStatus = isChallenger ? challenge.challenger?.status : isChallenged ? challenge.challenged?.status : null
  const canSolve = challenge.status !== 'completed' && myStatus === 'pending'
  
  // Show "Waiting..." if you submitted but it's not completed globally
  const displayStatus = challenge.status === 'completed'
    ? 'completed'
    : myStatus === 'completed'
      ? 'waiting for opponent'
      : challenge.status

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <a href={challenge.questionUrl} target="_blank" rel="noreferrer" className="font-medium text-emerald-400 hover:underline">
            {challenge.questionTitle} ↗
          </a>
          <p className="text-xs text-zinc-400 mt-1">{challenge.topic} • {challenge.difficulty}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {challenge.challenger?.displayName} vs {challenge.challenged?.displayName}
          </p>
          {challenge.status !== 'completed' ? (
            <p className="mt-1 text-xs text-zinc-500">
              Time left: {hours}h {mins}m
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">
              Winner: {challenge.winner === 'draw' ? 'Draw' : challenge.winner === challenge.challenger?.userId ? challenge.challenger?.displayName : challenge.challenged?.displayName} •{' '}
              {(challenge.challenger?.timeTakenMins ?? '-')}m vs{' '}
              {(challenge.challenged?.timeTakenMins ?? '-')}m
            </p>
          )}
        </div>
        
        <div className="flex sm:flex-col items-center sm:items-end gap-2">
          <Badge tone={displayStatus === 'completed' ? 'success' : displayStatus === 'waiting for opponent' ? 'info' : 'warning'}>
            {displayStatus}
          </Badge>
          <div className="flex flex-row items-center gap-2">
            {canSolve && (
              <Button size="sm" onClick={() => onSolve(challenge)} className="gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-500 border-none">
                <Code2 className="w-4 h-4" /> Solve
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" onClick={() => onDelete(challenge.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
