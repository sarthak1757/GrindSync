import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { verifyCodeSolution } from '../../services/aiMentor'
import { submitChallengeSolution } from '../../services/firestore'
import { useAuth } from '../../context/AuthContext'
import { useChallenge } from '../../hooks/useChallenge'
import toast from 'react-hot-toast'
import { Play } from 'lucide-react'

export default function ChallengeEditorModal({ open, onClose, challenge, startedAt }) {
  const { currentUser } = useAuth()
  const [code, setCode] = useState('// Paste your solution here...\n')
  const [loading, setLoading] = useState(false)
  const [elapsedSecs, setElapsedSecs] = useState(0)

  // Challenge time left (global expiry countdown)
  const { timeLeftMs } = useChallenge(challenge?.expiresAt)
  const tlTotalSecs = Math.floor(timeLeftMs / 1000)
  const tlMins = Math.floor(tlTotalSecs / 60)
  const tlSecs = tlTotalSecs % 60
  const timeLeftDisplay = timeLeftMs <= 0
    ? 'Expired!'
    : `${tlMins}m ${String(tlSecs).padStart(2, '0')}s`
  const timeLeftUrgent = timeLeftMs > 0 && timeLeftMs <= 60000

  // Personal solve timer — starts from when URL was clicked, persists across modal close
  useEffect(() => {
    if (!open || !challenge || !startedAt) return

    setElapsedSecs(Math.floor((Date.now() - startedAt) / 1000))
    const interval = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [open, challenge, startedAt])

  if (!challenge) return null

  const mins = Math.floor(elapsedSecs / 60)
  const secs = elapsedSecs % 60
  const displayTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const handleSubmit = async () => {
    if (code.trim() === '' || code.includes('// Paste your solution here...')) {
      toast.error('Please paste a valid solution before submitting.')
      return
    }
    setLoading(true)
    try {
      const result = await verifyCodeSolution(challenge.questionTitle, challenge.questionUrl, code)
      if (result.isCorrect) {
        toast.success('Solution Accepted! Awesome job.')
        const timeTakenMins = Math.max(1, Math.ceil(elapsedSecs / 60))
        await submitChallengeSolution(challenge.id, currentUser.uid, code, { timeTakenMins })
        onClose()
      } else {
        toast.error(`Solution rejected: ${result.feedback}`, { duration: 5000 })
      }
    } catch (err) {
      toast.error(err.message || 'Failed to verify code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Solve Challenge">
      <div className="space-y-4">

        {/* Info bar with problem title + both timers */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-900 p-3 gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-indigo-400 truncate">
              <a href={challenge.questionUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {challenge.questionTitle} ↗
              </a>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">{challenge.difficulty}</p>
          </div>

          <div className="flex gap-5 shrink-0 divide-x divide-zinc-700">
            {/* Personal solve timer */}
            <div className="text-center pr-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Your Timer</p>
              <p className="text-xl font-mono font-bold text-emerald-400 tabular-nums">{displayTime}</p>
            </div>

            {/* Challenge deadline */}
            <div className="text-center pl-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Time Left</p>
              <p className={`text-xl font-mono font-bold tabular-nums ${timeLeftUrgent ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                {timeLeftDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* Code editor */}
        <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-1">
          <textarea
            className="w-full h-64 bg-transparent p-3 text-sm font-mono text-emerald-400 placeholder:text-zinc-600 focus:outline-none resize-y"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Evaluating...' : 'Submit & Run Code against AI'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
