import { useState, useRef, useEffect } from 'react'
import Card from '../ui/Card'
import { Bot, Send } from 'lucide-react'

const QUICK_ACTIONS = [
  "Analyze my weak topics",
  "Make me a 2-week plan",
  "Why am I struggling with DP?",
  "Am I ready for interviews?"
]

const LANGUAGE_LABELS = {
  cpp: 'C++',
  cplusplus: 'C++',
  js: 'JavaScript',
  javascript: 'JavaScript',
  python: 'Python',
  py: 'Python',
  java: 'Java',
}

const highlightCode = (code) => {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const tokenPattern = /(\/\/.*|#.*)|(".*?"|'.*?'|`.*?`)|\b(const|let|var|function|return|if|else|for|while|class|new|import|from|export|def|range|in|public|private|static|void|int|long|bool|true|false|null|None|vector|string|map|set|queue|stack)\b/g

  return escaped.replace(tokenPattern, (match, comment, stringLiteral, keyword) => {
    if (comment) return `<span class="text-zinc-500">${comment}</span>`
    if (stringLiteral) return `<span class="text-emerald-300">${stringLiteral}</span>`
    if (keyword) return `<span class="text-indigo-300">${keyword}</span>`
    return match
  })
}

function MessageContent({ content }) {
  const parts = String(content).split(/```(\w+)?\n?([\s\S]*?)```/g)

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (index % 3 === 1) return null

        const isCode = index % 3 === 2
        const language = isCode ? parts[index - 1]?.toLowerCase() || 'text' : ''

        if (isCode) {
          return (
            <div key={index} className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  {LANGUAGE_LABELS[language] || language}
                </span>
              </div>
              <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-zinc-100">
                <code dangerouslySetInnerHTML={{ __html: highlightCode(part.trim()) }} />
              </pre>
            </div>
          )
        }

        if (!part) return null
        return <p key={index} className="whitespace-pre-wrap">{part}</p>
      })}
    </div>
  )
}

export default function MentorChat({ history, onSend, loading }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  const submit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    onSend(input)
    setInput('')
  }

  const handleQuickAction = (action) => {
    if (loading) return
    onSend(action)
  }

  return (
    <Card title="Mentor Chat" className="flex flex-col h-[600px] bg-zinc-900/60 border-zinc-800">
      <div className="flex-1 overflow-y-auto space-y-5 p-4 scroll-smooth">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 animate-count-up">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
              <Bot className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="font-semibold text-zinc-300 mb-1">I'm your AI Coach! 👋</p>
            <p className="text-sm max-w-xs">Ask me anything about your prep strategy, tricky concepts, or study plans.</p>
          </div>
        )}
        
        {history.map((msg, idx) => {
          const isUser = msg.role === 'user'
          return (
            <div key={`${msg.role}-${idx}`} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {!isUser && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 flex items-center justify-center shrink-0 border border-indigo-400/30 shadow-sm">
                  <Bot className="w-5 h-5 text-indigo-200" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isUser 
                  ? 'bg-indigo-600 text-white rounded-br-sm shadow-[0_0_15px_rgba(79,70,229,0.28)]' 
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700 shadow-lg'
              }`}>
                <MessageContent content={msg.content} />
              </div>
            </div>
          )
        })}
        
        {loading && (
          <div className="flex gap-3 justify-start animate-count-up">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 flex items-center justify-center shrink-0 border border-indigo-400/30">
              <Bot className="w-5 h-5 text-indigo-200" />
            </div>
            <div className="bg-zinc-800 rounded-2xl rounded-bl-sm border border-zinc-700 px-5 py-4 flex items-center gap-1.5 w-max">
              <span className="mr-2 text-xs text-zinc-400 italic">Mentor is thinking...</span>
              <span className="mentor-dot" />
              <span className="mentor-dot delay-150" />
              <span className="mentor-dot delay-300" />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      <div className="pt-3 border-t border-zinc-800/80 mt-2">
        {/* Quick Actions */}
        <div className="flex overflow-x-auto gap-2 pb-3 no-scrollbar mb-1 px-1">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              disabled={loading}
              className="shrink-0 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-all whitespace-nowrap disabled:opacity-50 disabled:hover:bg-indigo-500/10 hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]"
            >
              {action}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex gap-2 relative">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 pl-4 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-shadow disabled:opacity-50 text-white placeholder-zinc-500" 
            placeholder="Ask your coach anything..." 
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </Card>
  )
}
