import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import ChallengeCard from '../components/challenges/ChallengeCard'
import ChallengeModal from '../components/challenges/ChallengeModal'
import ChallengeEditorModal from '../components/challenges/ChallengeEditorModal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { useGroups } from '../context/GroupContext'
import { createChallenge, deleteChallenge } from '../services/firestore'
import { Trophy, Medal } from 'lucide-react'

export default function Challenges() {
  const { currentUser } = useAuth()
  const { challenges, groups } = useGroups()
  const [open, setOpen] = useState(false)
  const [activeSolveChallenge, setActiveSolveChallenge] = useState(null)
  const prevChallengesRef = useRef({})

  // Seed the ref on first load (no notifications on initial data)
  useEffect(() => {
    if (!challenges.length || Object.keys(prevChallengesRef.current).length > 0) return
    const snapshot = {}
    challenges.forEach((c) => { snapshot[c.id] = c })
    prevChallengesRef.current = snapshot
  }, [challenges])

  // Opponent submission / completion notifications
  useEffect(() => {
    if (!currentUser || !challenges.length) return
    if (Object.keys(prevChallengesRef.current).length === 0) return

    challenges.forEach((challenge) => {
      const prev = prevChallengesRef.current[challenge.id]
      if (!prev) return

      const isChallenger = challenge.challenger?.userId === currentUser.uid
      const isChallenged = challenge.challenged?.userId === currentUser.uid
      if (!isChallenger && !isChallenged) return

      const opponent = isChallenger ? challenge.challenged : challenge.challenger
      const prevOpponent = isChallenger ? prev.challenged : prev.challenger

      if (prevOpponent?.status !== 'completed' && opponent?.status === 'completed') {
        if (challenge.status === 'completed') {
          if (challenge.winner === 'draw') {
            toast('🤝 Challenge ended in a Draw!', { icon: '⚖️' })
          } else if (challenge.winner === currentUser.uid) {
            toast.success('🏆 You won the challenge!')
          } else {
            toast.error(`${opponent?.displayName} won the challenge. Better luck next time!`)
          }
        } else {
          toast(`⚡ ${opponent?.displayName} just submitted! Hurry up!`, {
            icon: '🔔',
            duration: 5000,
          })
        }
      }
    })

    const snapshot = {}
    challenges.forEach((c) => { snapshot[c.id] = c })
    prevChallengesRef.current = snapshot
  }, [challenges, currentUser])

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

  // Global leaderboard across all participants
  const leaderboard = useMemo(() => {
    const stats = {}
    const register = (player) => {
      if (!player?.userId) return
      if (!stats[player.userId]) {
        stats[player.userId] = { name: player.displayName, wins: 0, losses: 0, draws: 0, points: 0 }
      }
    }
    completed.forEach(({ challenger, challenged, winner }) => {
      register(challenger)
      register(challenged)
      if (!winner || winner === 'draw') {
        if (challenger?.userId) stats[challenger.userId].draws += 1
        if (challenged?.userId) stats[challenged.userId].draws += 1
      } else {
        const loserId = winner === challenger?.userId ? challenged?.userId : challenger?.userId
        if (stats[winner]) { stats[winner].wins += 1; stats[winner].points += 3 }
        if (loserId && stats[loserId]) stats[loserId].losses += 1
      }
    })
    return Object.values(stats).sort((a, b) => b.points - a.points || b.wins - a.wins)
  }, [completed])

  // Personal head-to-head record vs each opponent
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
      if (!friend) { toast.error('Select a friend to challenge.'); return }
      await createChallenge({
        questionId: payload.questionUrl,
        questionTitle: payload.questionTitle,
        questionUrl: payload.questionUrl,
        difficulty: payload.difficulty,
        topic: 'custom',
        challenger: { userId: currentUser.uid, displayName: currentUser.displayName || currentUser.email, status: 'pending' },
        challenged: { userId: friend.userId, displayName: friend.displayName, status: 'pending' },
        groupId: payload.groupId || null,
        expiresAt: new Date(Date.now() + 1000 * 60 * Number(payload.expiresMins || 30)).toISOString(),
      })
      toast.success('Challenge sent!')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Delete this challenge?')) return
    try {
      await deleteChallenge(challengeId)
      toast.success('Challenge deleted')
    } catch { toast.error('Failed to delete challenge.') }
  }

  const medalColors = ['text-yellow-400', 'text-zinc-300', 'text-amber-600']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Challenges</h1>
        <Button onClick={() => setOpen(true)} disabled={!friendOptions.length}>
          Send Challenge
        </Button>
      </div>

      {!friendOptions.length && (
        <Card>
          <p className="text-sm text-zinc-400">Join a group with friends first, then you can challenge them here.</p>
        </Card>
      )}

      {/* ── Live Leaderboard ── */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h2 className="font-semibold text-zinc-100">Live Leaderboard</h2>
          <span className="ml-auto text-xs text-zinc-500">{completed.length} match{completed.length !== 1 ? 'es' : ''} played</span>
        </div>
        {!leaderboard.length ? (
          <p className="text-sm text-zinc-400">No completed matches yet. Be the first to win!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((player, idx) => (
              <div
                key={player.name}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  idx === 0 ? 'bg-yellow-400/10 border border-yellow-400/20' : 'bg-zinc-900/60 border border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {idx < 3 ? (
                    <Medal className={`w-4 h-4 ${medalColors[idx]}`} />
                  ) : (
                    <span className="w-4 text-center text-zinc-500 font-mono text-xs">{idx + 1}</span>
                  )}
                  <span className={idx === 0 ? 'font-semibold text-yellow-300' : 'text-zinc-200'}>
                    {player.name}
                    {player.name === (currentUser?.displayName || currentUser?.email) && (
                      <span className="ml-1 text-xs text-indigo-400">(you)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400 font-semibold">{player.wins}W</span>
                  <span className="text-red-400">{player.losses}L</span>
                  <span className="text-zinc-500">{player.draws}D</span>
                  <span className="text-indigo-400 font-bold">{player.points}pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Active Challenges">
        <div className="space-y-2">
          {active.length === 0 && <p className="text-sm text-zinc-400">No active challenges.</p>}
          {active.map((c) => (
            <ChallengeCard key={c.id} challenge={c} onSolve={setActiveSolveChallenge} onDelete={handleDeleteChallenge} />
          ))}
        </div>
      </Card>

      <Card title="Completed Challenges">
        <div className="space-y-2">
          {completed.length === 0 && <p className="text-sm text-zinc-400">No completed challenges yet.</p>}
          {completed.map((c) => (
            <ChallengeCard key={c.id} challenge={c} onDelete={handleDeleteChallenge} />
          ))}
        </div>
      </Card>

      <Card title="My Head-to-Head Record">
        {!headToHead.length ? (
          <p className="text-sm text-zinc-400">No completed matches yet.</p>
        ) : (
          <div className="space-y-2">
            {headToHead.map((record) => (
              <div key={record.name} className="rounded-lg border border-zinc-800 px-3 py-2 text-sm flex justify-between">
                <p className="text-zinc-200">{record.name}</p>
                <p className="text-xs text-zinc-400">
                  <span className="text-emerald-400">W {record.wins}</span> • <span className="text-red-400">L {record.losses}</span> • D {record.draws}
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
