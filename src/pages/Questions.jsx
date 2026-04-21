import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AddQuestionModal from '../components/questions/AddQuestionModal'
import QuestionDetailsModal from '../components/questions/QuestionDetailsModal'
import QuestionList from '../components/questions/QuestionList'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Zap } from 'lucide-react'
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Questions</h1>
        <Button onClick={() => setOpen(true)}>Add Question</Button>
      </div>

      {/* EXTENSION PROMO BANNER */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex-1 text-center sm:text-left z-10">
          <h3 className="text-sm font-semibold text-indigo-300">Automate your tracking!</h3>
          <p className="text-xs text-indigo-200/70 mt-0.5">
            Use the GrindSync Chrome Extension to easily log your solved questions directly from LeetCode and Codeforces without leaving the page.
          </p>
        </div>
        <a 
          href="https://github.com/sarthak1757/GrindSync-Extension" 
          target="_blank" 
          rel="noopener noreferrer"
          className="z-10 shrink-0 px-4 py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          Get Extension
        </a>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Search title/topic/platform"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic === 'all' ? 'All topics' : topic}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="all">All platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
          </select>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All difficulty levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </Card>
      <QuestionList questions={filtered} onView={setSelectedQuestion} />
      <AddQuestionModal open={open} onClose={() => setOpen(false)} onSubmit={handleCreateQuestion} />
      <QuestionDetailsModal
        open={Boolean(selectedQuestion)}
        onClose={() => setSelectedQuestion(null)}
        question={selectedQuestion}
      />
    </div>
  )
}
