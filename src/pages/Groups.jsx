import { useState } from 'react'
import toast from 'react-hot-toast'
import GroupCard from '../components/groups/GroupCard'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useGroups } from '../context/GroupContext'

export default function Groups() {
  const { groups, createNewGroup, joinGroup } = useGroups()
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const create = async (e) => {
    e.preventDefault()
    await createNewGroup({
      name,
      description: 'Focused DSA accountability group',
      goal: { type: 'placement', targetDate, description: goal },
      weeklyGoal: { questionsPerMember: 10, revisionsPerMember: 8 },
    })
    toast.success('Group created')
    setName('')
    setGoal('')
    setTargetDate('')
  }

  const join = async (e) => {
    e.preventDefault()
    try {
      await joinGroup(inviteCode)
      toast.success('Joined group')
      setInviteCode('')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Groups</h1>
      <section className="grid gap-4 xl:grid-cols-2">
        <Card title="Create Group">
          <form className="space-y-2" onSubmit={create}>
            <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Goal description" value={goal} onChange={(e) => setGoal(e.target.value)} required />
            <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
            <Button type="submit" className="w-full">Create</Button>
          </form>
        </Card>
        <Card title="Join via Invite Code">
          <form className="space-y-2" onSubmit={join}>
            <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="ABC123" required />
            <Button type="submit" className="w-full">Join Group</Button>
          </form>
        </Card>
      </section>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => <GroupCard key={group.id} group={group} />)}
      </section>
    </div>
  )
}
