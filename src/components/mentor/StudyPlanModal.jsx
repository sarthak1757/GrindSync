import Button from '../ui/Button'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { Sparkles, Check, CheckCircle2, Trophy, Clock, X } from 'lucide-react'

export default function StudyPlanModal({ plan, onSave, onDiscard, isSaving }) {
  if (!plan || !plan.weeks) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-6 w-6" /> Your 4-Week AI Study Plan
            </h2>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl">{plan.overview}</p>
          </div>
          <button onClick={onDiscard} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {plan.weeks.map((week) => (
              <div key={week.weekNumber} className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm transition-colors hover:border-zinc-700 hover:bg-zinc-900/60">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs text-indigo-400">
                        {week.weekNumber}
                      </span>
                      {week.theme}
                    </h3>
                    <Badge tone="info">Goal: {week.dailyGoal} Qs/day</Badge>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {week.topics.map((topic, i) => (
                    <span key={i} className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="mb-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Focus Questions</p>
                  <ul className="space-y-2">
                    {week.specificQuestions.map((q, i) => (
                      <li key={i} className="rounded border border-zinc-800/50 bg-black/20 p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-zinc-300">{q.title}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${q.difficulty.toLowerCase() === 'hard' ? 'bg-rose-500/10 text-rose-400' : q.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">{q.why}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex items-start gap-2 rounded-lg bg-indigo-500/10 p-3">
                  <Trophy className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-400">Milestone</p>
                    <p className="text-xs text-indigo-300/80">{week.milestone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 className="mb-3 font-semibold text-amber-500 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Mentor Tips
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {plan.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 bg-zinc-900/80 p-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={onDiscard}>Discard</Button>
          <Button onClick={onSave} disabled={isSaving} className="gap-2">
            <Check className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Plan to Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  )
}
