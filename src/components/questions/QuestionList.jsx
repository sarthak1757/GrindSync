import QuestionCard from './QuestionCard'

export default function QuestionList({ questions, onView }) {
  if (!questions.length) return <p className="glass-card p-4 text-sm text-zinc-400">No questions yet. Add your first solved problem.</p>

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {questions.map((question) => <QuestionCard key={question.id} question={question} onView={onView} />)}
    </div>
  )
}
