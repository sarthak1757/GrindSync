import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { verifyCodeSolution } from '../../services/aiMentor'
import { submitChallengeSolution } from '../../services/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Play } from 'lucide-react'

export default function ChallengeEditorModal({ open, onClose, challenge }) {
  const { currentUser } = useAuth()
  const [code, setCode] = useState('// Paste your solution here...\n')
  const [loading, setLoading] = useState(false)
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const startedAtRef = useRef(null)

  // Timer starts the moment the user opens the editor — not when challenge was created
  useEffect(() => {
    if (!open || !challenge) return

    startedAtRef.current = Date.now()
    setElapsedSecs(0)
    setCode('// Paste your solution here...\n')

    const interval = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [open, challenge])

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
        <div className="flex items-center justify-between rounded-lg bg-zinc-900 p-3">
          <div>
            <h3 className="font-semibold text-indigo-400">
              <a href={challenge.questionUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {challenge.questionTitle} ↗
              </a>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">{challenge.difficulty}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Your Timer</span>
            <p className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">{displayTime}</p>
          </div>
        </div>

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
