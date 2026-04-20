/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { addQuestionForUser, subscribeToQuestions, subscribeToRevisionQueue } from '../services/firestore'

const QuestionContext = createContext(null)

export function QuestionProvider({ children }) {
  const { currentUser } = useAuth()
  const [questions, setQuestions] = useState([])
  const [revisionQueue, setRevisionQueue] = useState([])

  useEffect(() => {
    if (!currentUser) return undefined
    const unsubQuestions = subscribeToQuestions(currentUser.uid, setQuestions)
    const unsubQueue = subscribeToRevisionQueue(currentUser.uid, setRevisionQueue)

    return () => {
      unsubQuestions?.()
      unsubQueue?.()
    }
  }, [currentUser])

  const addQuestion = useCallback(async (payload) => {
    if (!currentUser) return
    await addQuestionForUser(currentUser.uid, payload)
  }, [currentUser])

  const value = useMemo(
    () => ({ questions, revisionQueue, addQuestion }),
    [questions, revisionQueue, addQuestion],
  )

  return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>
}

export const useQuestions = () => useContext(QuestionContext)
