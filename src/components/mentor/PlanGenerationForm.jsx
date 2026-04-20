import { useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function PlanGenerationForm({ onGenerate, loading, onClose }) {
  const [goal, setGoal] = useState('Google Internship')
  const [targetDate, setTargetDate] = useState('')
  const [studyDays, setStudyDays] = useState(5)

  const submit = (e) => {
    e.preventDefault()
    onGenerate({ placementGoal: goal, targetDate, daysPerWeek: studyDays })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card title="Tailor Your AI Study Plan">
          <p className="mb-4 text-sm text-zinc-400">
            Tell the Mentor about your specific placement goals so it can design the perfect 4-week roadmap.
          </p>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Target Company / Goal</label>
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                placeholder="e.g. Meta E3, Amazon SDE1, General Placements"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Target Date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                value={targetDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Days to study per week ({studyDays})</label>
              <input
                type="range"
                min="1"
                max="7"
                className="w-full"
                value={studyDays}
                onChange={(e) => setStudyDays(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Generating 4-week Plan...' : 'Generate Plan'}</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
