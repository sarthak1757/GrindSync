import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ChallengeCard from '../components/challenges/ChallengeCard'
import ChallengeModal from '../components/challenges/ChallengeModal'
import ChallengeEditorModal from '../components/challenges/ChallengeEditorModal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../context/GroupContext'
import { useQuestions } from '../context/QuestionContext'
import { createChallenge } from '../services/firestore'

export default function Challenges() {
  const { currentUser } = useAuth()
  const { challenges, groups } = useGroups()
  const { questions } = useQuestions()
  const [open, setOpen] = useState(false)
  const [activeSolveChallenge, setActiveSolveChallenge] = useState(null)

  const active = useMemo(() => challenges.filter((c) => c.status !== 'completed'), [challenges])
  const completed = useMemo(() => challenges.filter((c) => c.status === 'completed'), [challenges])
  const friendOptions = useMemo(() => {
    const members = groups.flatMap((group) => group.members || [])
    const unique = new Map()
    members
      .filter((member) => member.userId !== currentUser?.uid)
      .forEach((member) => unique.set(member.userId, member))
    return [...unique.values()]
  }, [currentUser?.uid, groups])

  const headToHead = useMemo(() => {
    const stats = {}
    completed.forEach((challenge) => {
      const opponent =
        challenge.challenger?.userId === currentUser?.uid
          ? challenge.challenged
          : challenge.challenger
      if (!opponent?.userId) return
      if (!stats[opponent.userId]) {
        stats[opponent.userId] = { name: opponent.displayName, wins: 0, losses: 0, draws: 0 }
      }

      if (!challenge.winner || challenge.winner === 'draw') stats[opponent.userId].draws += 1
      else if (challenge.winner === currentUser?.uid) stats[opponent.userId].wins += 1
      else stats[opponent.userId].losses += 1
    })
    return Object.values(stats)
  }, [completed, currentUser?.uid])

  const sendChallenge = async (payload) => {
    try {
      const friend = friendOptions.find((item) => item.userId === payload.challengedUserId)
      if (!friend) {
        toast.error('Select a friend to challenge.')
        return
      }

      await createChallenge({
        questionId: payload.questionUrl, // We can use the URL as a unique ID reference or just store it.
        questionTitle: payload.questionTitle,
        questionUrl: payload.questionUrl,
        difficulty: payload.difficulty,
        topic: 'custom',
        challenger: { userId: currentUser.uid, displayName: currentUser.displayName || currentUser.email, status: 'pending' },
        challenged: { userId: friend.userId, displayName: friend.displayName, status: 'pending' },
        groupId: payload.groupId || null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * Number(payload.expiresHours || 24)).toISOString(),
      })
      toast.success('Challenge sent')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Challenges</h1>
        <Button onClick={() => setOpen(true)} disabled={!friendOptions.length}>
          Send Challenge
        </Button>
      </div>
      {!friendOptions.length ? (
        <Card>
          <p className="text-sm text-zinc-400">
            Join a group with friends first, then you can challenge them here.
          </p>
        </Card>
      ) : null}
      <Card title="Active Challenges">
        <div className="space-y-2">{active.map((c) => <ChallengeCard key={c.id} challenge={c} onSolve={setActiveSolveChallenge} />)}</div>
      </Card>
      <Card title="Completed Challenges">
        <div className="space-y-2">{completed.map((c) => <ChallengeCard key={c.id} challenge={c} />)}</div>
      </Card>
      <Card title="Head-to-Head Record">
        {!headToHead.length ? (
          <p className="text-sm text-zinc-400">No completed matches yet.</p>
        ) : (
          <div className="space-y-2">
            {headToHead.map((record) => (
              <div key={record.name} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm">
                <p className="text-zinc-200">{record.name}</p>
                <p className="text-xs text-zinc-400">
                  W {record.wins} • L {record.losses} • D {record.draws}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ChallengeModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={sendChallenge}
        friendOptions={friendOptions}
        groupOptions={groups}
      />
      <ChallengeEditorModal
        open={!!activeSolveChallenge}
        onClose={() => setActiveSolveChallenge(null)}
        challenge={activeSolveChallenge}
      />
    </div>
  )
}
