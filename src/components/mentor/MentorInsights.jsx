import { useState } from 'react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { ChevronDown, ChevronUp, CheckSquare, Square, Target } from 'lucide-react'

const ProgressRing = ({ percentage, colorClass, strokeClass }) => {
  const safePercentage = Math.min(100, Math.max(0, Number(percentage) || 0))
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle
          className="text-zinc-800"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="24"
          cy="24"
        />
        <circle
          className={strokeClass}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="24"
          cy="24"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <span className={`absolute text-[10px] font-bold ${colorClass}`}>{safePercentage}%</span>
    </div>
  )
}

const getTopicId = (topic) => topic.topic || topic.name || 'Topic'

const getTopicMastery = (topic) => {
  if (topic.masteryScore !== undefined) return Math.round(Number(topic.masteryScore) || 0)
  if (topic.score !== undefined) return Math.round(Number(topic.score) || 0)
  if (topic.urgency === 'high') return 35
  if (topic.urgency === 'medium') return 55
  return 75
}

const getRecommendations = (topic) => {
  if (Array.isArray(topic.recommendations) && topic.recommendations.length) {
    return topic.recommendations
  }

  const fallback = topic.recommendation || topic.reason || 'Solve 3 focused problems, write down the pattern, and revisit mistakes tomorrow'
  return fallback
    .split(/\.\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function MentorInsights({ analysis }) {
  const [expandedTopic, setExpandedTopic] = useState(null)
  const [checkedRecs, setCheckedRecs] = useState({})

  const toggleCheck = (e, topicId, idx) => {
    e.stopPropagation() // Prevent accordion toggle if clicking checkbox row
    setCheckedRecs(prev => ({
      ...prev,
      [`${topicId}-${idx}`]: !prev[`${topicId}-${idx}`]
    }))
  }

  return (
    <Card title="Weakness Analysis & Coaching" className="flex flex-col h-full bg-zinc-900/60 border-zinc-800">
      {!analysis?.weakTopics?.length ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Target className="w-12 h-12 text-zinc-700 mb-4" />
          <p className="text-sm font-medium text-zinc-300">No analysis available yet.</p>
          <p className="text-xs text-zinc-500 mt-2 max-w-xs">Click "Generate analysis" to let your AI coach review your performance and create a targeted action plan.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          {analysis.weakTopics.map((topic) => {
            const topicId = getTopicId(topic)
            const isExpanded = expandedTopic === topicId
            const mastery = getTopicMastery(topic)
            const colorClass = topic.urgency === 'high' ? 'text-rose-400' : topic.urgency === 'medium' ? 'text-amber-400' : 'text-emerald-400'
            const strokeClass = topic.urgency === 'high' ? 'text-rose-500' : topic.urgency === 'medium' ? 'text-amber-500' : 'text-emerald-500'
            const tasks = getRecommendations(topic)

            return (
              <div key={topicId} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800/80 hover:border-zinc-700'}`}>
                <button 
                  onClick={() => setExpandedTopic(isExpanded ? null : topicId)}
                  className="w-full flex items-center justify-between p-4 focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-4">
                    <ProgressRing percentage={mastery} colorClass={colorClass} strokeClass={strokeClass} />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-zinc-100 text-base">{topicId}</p>
                        <Badge tone={topic.urgency === 'high' ? 'danger' : topic.urgency === 'medium' ? 'warning' : 'success'}>
                          {topic.urgency || 'low'} urgency
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-[250px]">{topic.reason || topic.recommendation}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-zinc-500 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 animate-fade-in bg-zinc-950/30">
                    <div className="h-px w-full bg-zinc-800/80 mb-4" />
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-3">Coach's Action Plan</p>
                    <div className="space-y-2">
                      {tasks.map((task, i) => {
                        const isChecked = !!checkedRecs[`${topicId}-${i}`]
                        return (
                          <div 
                            key={i} 
                            onClick={(e) => toggleCheck(e, topicId, i)}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all group ${
                              isChecked ? 'bg-zinc-900/50 border-zinc-800/50' : 'bg-zinc-900 border-zinc-700/50 hover:border-indigo-500/30 hover:bg-indigo-500/5'
                            }`}
                          >
                            <span className={`mt-0.5 shrink-0 transition-colors ${isChecked ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-indigo-400'}`}>
                              {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </span>
                            <p className={`text-sm leading-relaxed transition-colors ${isChecked ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                              {task.trim()}{!task.endsWith('.') && !task.endsWith('!') && !task.endsWith('?') ? '.' : ''}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
