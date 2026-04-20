import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

const initial = {
  questionId: '',
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
    <Modal open={open} onClose={onClose} title="Send Challenge">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <select
          value={form.questionId}
          onChange={(e) => setForm((p) => ({ ...p, questionId: e.target.value }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          required
        >
          <option value="">Select question</option>
          {questionOptions.map((question) => (
            <option key={question.id} value={question.id}>
              {question.title}
            </option>
          ))}
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
