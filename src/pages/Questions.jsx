import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AddQuestionModal from '../components/questions/AddQuestionModal'
import QuestionDetailsModal from '../components/questions/QuestionDetailsModal'
import QuestionList from '../components/questions/QuestionList'
import Button from '../components/ui/Button'
import { Zap, Search, Tag, Globe, BarChart2, X } from 'lucide-react'
import { useQuestions } from '../context/QuestionContext'

export default function Questions() {
  const { questions, addQuestion } = useQuestions()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const topics = useMemo(
    () => ['all', ...new Set(questions.map((q) => (q.topic || '').toLowerCase()).filter(Boolean))],
    [questions],
  )

  const filtered = useMemo(() => {
    const searchTerm = search.toLowerCase().trim()
    return questions.filter((q) => {
      const matchesSearch =
        !searchTerm ||
        q.title?.toLowerCase().includes(searchTerm) ||
        q.topic?.toLowerCase().includes(searchTerm) ||
        q.platform?.toLowerCase().includes(searchTerm)
      const matchesTopic =
        topicFilter === 'all' || q.topic?.toLowerCase() === topicFilter.toLowerCase()
      const matchesPlatform =
        platformFilter === 'all' || q.platform?.toLowerCase() === platformFilter.toLowerCase()
      const matchesDifficulty =
        difficultyFilter === 'all' || q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
      return matchesSearch && matchesTopic && matchesPlatform && matchesDifficulty
    })
  }, [difficultyFilter, platformFilter, questions, search, topicFilter])

  const handleCreateQuestion = async (payload) => {
    try {
      await addQuestion(payload)
      toast.success('Question added successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to add question')
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-white">Questions</h1>
        <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-500">
          Add Question
        </Button>
      </div>

      {/* EXTENSION PROMO BANNER */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
          <Zap className="w-6 h-6" />
        </div>
        <div className="flex-1 text-center sm:text-left z-10">
          <h3 className="text-base font-semibold text-indigo-300">Automate your tracking!</h3>
          <p className="text-sm text-indigo-200/70 mt-1 max-w-2xl">
            Use the GrindSync Chrome Extension to easily log your solved questions directly from LeetCode and Codeforces without leaving the page.
          </p>
        </div>
        <a 
          href="https://github.com/sarthak1757/GrindSync-Extension" 
          target="_blank" 
          rel="noopener noreferrer"
          className="z-10 shrink-0 px-5 py-2.5 text-sm font-bold bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] whitespace-nowrap"
        >
          Get Extension
        </a>
      </div>

      {/* FILTER BAR - Sticky */}
      <div className="sticky top-[60px] z-20 -mx-4 px-4 py-3 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow placeholder:text-zinc-500"
              placeholder="Search title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <select
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === 'all' ? 'All topics' : topic.charAt(0).toUpperCase() + topic.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <select
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="all">All platforms</option>
              <option value="leetcode">LeetCode</option>
              <option value="codeforces">Codeforces</option>
            </select>
          </div>

          <div className="relative">
            <BarChart2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <select
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(topicFilter !== 'all' || platformFilter !== 'all' || difficultyFilter !== 'all') && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-zinc-500 mr-1">Active Filters:</span>
            
            {topicFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                <Tag className="h-3 w-3" />
                {topicFilter}
                <button onClick={() => setTopicFilter('all')} className="ml-1 hover:text-indigo-100"><X className="h-3 w-3" /></button>
              </span>
            )}
            
            {platformFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30">
                <Globe className="h-3 w-3" />
                {platformFilter}
                <button onClick={() => setPlatformFilter('all')} className="ml-1 hover:text-emerald-100"><X className="h-3 w-3" /></button>
              </span>
            )}
            
            {difficultyFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300 border border-amber-500/30">
                <BarChart2 className="h-3 w-3" />
                {difficultyFilter}
                <button onClick={() => setDifficultyFilter('all')} className="ml-1 hover:text-amber-100"><X className="h-3 w-3" /></button>
              </span>
            )}

            <button 
              onClick={() => { setTopicFilter('all'); setPlatformFilter('all'); setDifficultyFilter('all'); }}
              className="text-xs text-zinc-500 hover:text-zinc-300 ml-2 underline underline-offset-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <QuestionList questions={filtered} onView={setSelectedQuestion} onAdd={() => setOpen(true)} />
      
      <AddQuestionModal open={open} onClose={() => setOpen(false)} onSubmit={handleCreateQuestion} />
      
      <QuestionDetailsModal
        open={Boolean(selectedQuestion)}
        onClose={() => setSelectedQuestion(null)}
        question={selectedQuestion}
      />
    </div>
  )
}
