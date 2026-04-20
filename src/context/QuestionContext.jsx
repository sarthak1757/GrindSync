/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { addQuestionForUser, subscribeToQuestions, subscribeToRevisionQueue, subscribeToUserDoc } from '../services/firestore'

const QuestionContext = createContext(null)

export function QuestionProvider({ children }) {
  const { currentUser } = useAuth()
  const [questions, setQuestions] = useState([])
  const [revisionQueue, setRevisionQueue] = useState([])
  const [userDoc, setUserDoc] = useState(null)

  useEffect(() => {
    if (!currentUser) return undefined
    const unsubQuestions = subscribeToQuestions(currentUser.uid, setQuestions)
    const unsubQueue = subscribeToRevisionQueue(currentUser.uid, setRevisionQueue)
    const unsubUser = subscribeToUserDoc(currentUser.uid, setUserDoc)

    return () => {
      unsubQuestions?.()
      unsubQueue?.()
      unsubUser?.()
    }
  }, [currentUser])

  const addQuestion = useCallback(async (payload) => {
    if (!currentUser) return
    await addQuestionForUser(currentUser.uid, payload)
  }, [currentUser])

  const value = useMemo(
    () => ({ questions, revisionQueue, userDoc, addQuestion }),
    [questions, revisionQueue, userDoc, addQuestion],
  )

  return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>
}

export const useQuestions = () => useContext(QuestionContext)
