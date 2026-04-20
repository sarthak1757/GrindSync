import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const initial = {
  title: '',
  url: '',
  platform: 'leetcode',
  topic: '',
  difficulty: 'easy',
  timeTakenMins: 30,
  solvedAt: new Date().toISOString().slice(0, 10),
  felt: 'okay',
  notes: '',
}

export default function AddQuestionModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        ...form,
        solvedAt: new Date(form.solvedAt).toISOString(),
      })
      setForm(initial)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add solved question">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Question title"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          required
        />

        <input
          value={form.url}
          onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
          placeholder="Question URL"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          type="url"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            value={form.platform}
            onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
          </select>

          <input
            value={form.topic}
            onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
            placeholder="Topic (e.g. arrays)"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={form.difficulty}
            onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}
            placeholder={form.platform === 'codeforces' ? 'Rating (e.g. 1450)' : 'easy/medium/hard'}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            required
          />

          <input
            value={form.timeTakenMins}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, timeTakenMins: Number(e.target.value || 0) }))
            }
            placeholder="Time taken (mins)"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            type="number"
            min={1}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={form.solvedAt}
            onChange={(e) => setForm((prev) => ({ ...prev, solvedAt: e.target.value }))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            type="date"
            required
          />
          <select
            value={form.felt}
            onChange={(e) => setForm((prev) => ({ ...prev, felt: e.target.value }))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="easy">Felt easy</option>
            <option value="okay">Felt okay</option>
            <option value="hard">Felt hard</option>
          </select>
        </div>

        <textarea
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          className="h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="What did you learn? Edge cases? Pattern used?"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Question'}
        </Button>
      </form>
    </Modal>
  )
}
