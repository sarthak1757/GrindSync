import { useState } from 'react'
import { generateMentorAnalysis, generateStudyPlan, sendMentorChat } from '../services/aiMentor'

export function useAIMentor() {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [history, setHistory] = useState([])

  const runAnalysis = async (payload) => {
    setLoading(true)
    try {
      const result = await generateMentorAnalysis(payload)
      setAnalysis(result)
      return result
    } finally {
      setLoading(false)
    }
  }

  const askMentor = async (message, context) => {
    const nextHistory = [...history, { role: 'user', content: message }]
    setHistory(nextHistory)
    setLoading(true)
    try {
      const result = await sendMentorChat(nextHistory, context)
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', content: result.mentorMessage || 'My apologies, I could not generate a response.' },
      ])
      return result
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection to AI Mentor dropped. Please try again.' },
      ])
      throw err
    } finally {
      setLoading(false)
    }
  }

  const makePlan = async (payload) => {
    setLoading(true)
    try {
      const result = await generateStudyPlan(payload)
      return result
    } finally {
      setLoading(false)
    }
  }

  return { loading, analysis, history, runAnalysis, askMentor, makePlan }
}
