import { useMemo } from 'react'
import toast from 'react-hot-toast'
import MentorChat from '../components/mentor/MentorChat'
import MentorInsights from '../components/mentor/MentorInsights'
import WeeklyReport from '../components/mentor/WeeklyReport'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useQuestions } from '../context/QuestionContext'
import { useAIMentor } from '../hooks/useAIMentor'

export default function Mentor() {
  const { questions } = useQuestions()
  const { loading, analysis, history, runAnalysis, askMentor, makePlan } = useAIMentor()

  const contextPayload = useMemo(() => {
    const topicBreakdown = questions.reduce((acc, question) => {
      const key = (question.topic || 'unknown').toLowerCase()
      const history = question.solveHistory || []
      const totalTime = history.reduce((sum, item) => sum + Number(item.timeTakenMins || 0), 0)
      const avgTime = history.length ? totalTime / history.length : question.revision?.averageTimeMins || 0
      const previous = acc[key] || { count: 0, avgTime: 0, masteryAvg: 0 }
      acc[key] = {
        count: previous.count + 1,
        avgTime: Number(((previous.avgTime * previous.count + avgTime) / (previous.count + 1)).toFixed(1)),
        masteryAvg: Number(
          (
            (previous.masteryAvg * previous.count + Number(question.revision?.masteryScore || 0)) /
            (previous.count + 1)
          ).toFixed(1),
        ),
      }
      return acc
    }, {})

    const revisionCompletionRate =
      questions.length === 0
        ? 0
        : Math.round(
            (questions.filter((q) => Number(q.revision?.masteryScore || 0) >= 70).length / questions.length) *
              100,
          )

    return {
      totalSolved: questions.length,
      topicBreakdown,
      recentQuestions: questions.slice(0, 20),
      goal: { type: 'placement', targetDate: '2026-12-31T00:00:00.000Z' },
      streak: 0,
      revisionCompletionRate,
    }
  }, [questions])

  const generate = async () => {
    try {
      await runAnalysis(contextPayload)
      toast.success('Mentor analysis ready')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const plan = async () => {
    try {
      const result = await makePlan(contextPayload)
      toast.success(result.mentorMessage || 'Plan generated')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">AI Mentor</h1>
        <div className="flex gap-2">
          <Button onClick={generate} disabled={loading}>Generate analysis</Button>
          <Button variant="ghost" onClick={plan} disabled={loading}>Make me a plan</Button>
        </div>
      </div>
      <section className="grid gap-4 xl:grid-cols-2">
        <MentorInsights analysis={analysis} />
        <WeeklyReport report={analysis} />
      </section>
      <Card title="Placement Readiness">
        <p className="text-3xl font-bold text-indigo-300">{analysis?.readinessScore ?? 0}/100</p>
      </Card>
      <MentorChat
        history={history}
        onSend={(msg) => askMentor(msg, contextPayload)}
        loading={loading}
      />
    </div>
  )
}
