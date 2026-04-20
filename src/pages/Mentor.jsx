import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import MentorChat from '../components/mentor/MentorChat'
import MentorInsights from '../components/mentor/MentorInsights'
import WeeklyReport from '../components/mentor/WeeklyReport'
import PlanGenerationForm from '../components/mentor/PlanGenerationForm'
import StudyPlanModal from '../components/mentor/StudyPlanModal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useQuestions } from '../context/QuestionContext'
import { useAuth } from '../context/AuthContext'
import { useAIMentor } from '../hooks/useAIMentor'
import { saveStudyPlan } from '../services/firestore'

export default function Mentor() {
  const { questions } = useQuestions()
  const { currentUser } = useAuth()
  const { loading, analysis, history, runAnalysis, askMentor, makePlan } = useAIMentor()

  const [showPlanForm, setShowPlanForm] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [isSavingPlan, setIsSavingPlan] = useState(false)

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

  const handleGeneratePlan = async (formData) => {
    try {
      const payload = {
        ...contextPayload,
        placementGoal: formData.placementGoal,
        targetDate: formData.targetDate,
        daysPerWeekToStudy: formData.daysPerWeek,
      }
      const result = await makePlan(payload)
      setGeneratedPlan(result)
      setShowPlanForm(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSavePlan = async () => {
    if (!currentUser || !generatedPlan) return
    setIsSavingPlan(true)
    try {
      await saveStudyPlan(currentUser.uid, generatedPlan)
      toast.success('Study plan saved to Dashboard!')
      setGeneratedPlan(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSavingPlan(false)
    }
  }

  return (
    <div className="space-y-4">
      {showPlanForm && (
        <PlanGenerationForm 
          onGenerate={handleGeneratePlan} 
          loading={loading} 
          onClose={() => setShowPlanForm(false)} 
        />
      )}

      {generatedPlan && (
        <StudyPlanModal 
          plan={generatedPlan} 
          onSave={handleSavePlan} 
          onDiscard={() => setGeneratedPlan(null)} 
          isSaving={isSavingPlan} 
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">AI Mentor</h1>
        <div className="flex gap-2">
          <Button onClick={generate} disabled={loading}>Generate analysis</Button>
          <Button variant="ghost" onClick={() => setShowPlanForm(true)} disabled={loading}>Make me a plan</Button>
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
