import { useState, useRef, useEffect } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function MentorChat({ history, onSend, loading }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const submit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input)
    setInput('')
  }

  return (
    <Card title="Mentor Chat">
      <div className="mb-3 h-64 space-y-2 overflow-auto rounded-lg border border-zinc-800 p-3 text-sm">
        {history.map((msg, idx) => (
          <p key={`${msg.role}-${idx}`} className={msg.role === 'user' ? 'text-zinc-200' : 'text-indigo-300'}>
            <span className="mr-2 font-semibold">{msg.role === 'user' ? 'You' : 'Mentor'}:</span>
            {msg.content}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" placeholder="Ask about your prep strategy" />
        <Button type="submit" disabled={loading}>{loading ? '...' : 'Send'}</Button>
      </form>
    </Card>
  )
}
