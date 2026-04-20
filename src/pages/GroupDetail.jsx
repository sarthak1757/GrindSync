import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Leaderboard from '../components/groups/Leaderboard'
import MemberRow from '../components/groups/MemberRow'
import ChallengeCard from '../components/challenges/ChallengeCard'
import Card from '../components/ui/Card'
import { useGroups } from '../context/GroupContext'
import { useLeaderboard } from '../hooks/useLeaderboard'

export default function GroupDetail() {
  const { groupId } = useParams()
  const { groups, challenges } = useGroups()
  const group = useMemo(() => groups.find((item) => item.id === groupId), [groupId, groups])
  const leaderboard = useLeaderboard(group?.members || [])
  const groupChallenges = useMemo(() => challenges.filter((challenge) => challenge.groupId === groupId), [challenges, groupId])
  const goalProgress = useMemo(() => {
    const members = group?.members || []
    const solved = members.reduce((sum, member) => sum + Number(member.weeklyStats?.questionsSolved || 0), 0)
    const target = Number(group?.weeklyGoal?.questionsPerMember || 0) * (members.length || 1)
    if (!target) return 0
    return Math.min(100, Math.round((solved / target) * 100))
  }, [group])

  if (!group) return <Card><p className="text-sm text-zinc-400">Group not found.</p></Card>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{group.name}</h1>
      <Leaderboard rows={leaderboard} />
      <Card title="Members">
        <div className="space-y-2">{group.members?.map((member) => <MemberRow key={member.userId} member={member} />)}</div>
      </Card>
      <Card title="Group Goal Progress">
        <div className="h-3 w-full rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${goalProgress}%` }} />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          {goalProgress}% complete toward weekly question goal.
        </p>
      </Card>
      <Card title="Challenges">
        <div className="space-y-2">{groupChallenges.map((item) => <ChallengeCard key={item.id} challenge={item} />)}</div>
      </Card>
    </div>
  )
}
