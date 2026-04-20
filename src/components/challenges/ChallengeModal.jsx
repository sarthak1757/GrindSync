import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

const initial = {
  questionTitle: '',
  questionUrl: '',
  difficulty: 'easy',
  groupId: '',
  challengedUserId: '',
  expiresHours: 24,
}

export default function ChallengeModal({
  open,
  onClose,
  onSubmit,
  questionOptions = [],
  friendOptions = [],
  groupOptions = [],
}) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(form)
      setForm(initial)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Send Coding Challenge">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          value={form.questionTitle}
          onChange={(e) => setForm((p) => ({ ...p, questionTitle: e.target.value }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="Problem Title (e.g. Two Sum)"
          required
        />
        
        <input
          type="url"
          value={form.questionUrl}
          onChange={(e) => setForm((p) => ({ ...p, questionUrl: e.target.value }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="Problem URL (e.g. https://leetcode.com/...)"
          required
        />

        <select
          value={form.difficulty}
          onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={form.challengedUserId}
          onChange={(e) => setForm((p) => ({ ...p, challengedUserId: e.target.value }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          required
        >
          <option value="">Select friend</option>
          {friendOptions.map((friend) => (
            <option key={friend.userId} value={friend.userId}>
              {friend.displayName}
            </option>
          ))}
        </select>

        <select
          value={form.groupId}
          onChange={(e) => setForm((p) => ({ ...p, groupId: e.target.value }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        >
          <option value="">No group (direct challenge)</option>
          {groupOptions.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        <input
          value={form.expiresHours}
          type="number"
          min={1}
          max={168}
          onChange={(e) => setForm((p) => ({ ...p, expiresHours: Number(e.target.value || 24) }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="Expires in hours"
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </Modal>
  )
}
