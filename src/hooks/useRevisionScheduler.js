import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { snoozeRevisionQueueItem, updateQuestionRevision } from '../services/firestore'
import { calculateNextRevision } from '../services/revisionAlgorithm'
import { useAuth } from '../context/AuthContext'

export function useRevisionScheduler() {
  const { currentUser } = useAuth()

  const markRevised = useCallback(
    async (question, feelingAfterRevision, timeTakenMins, queueId) => {
      if (!currentUser) return
      const outcome = calculateNextRevision(question, feelingAfterRevision, timeTakenMins)
      await updateQuestionRevision(currentUser.uid, question.id, {
        ...outcome,
        feelingAfterRevision,
        latestTimeTakenMins: Number(timeTakenMins || 0),
        status: 'done',
      }, queueId)
      toast.success('Revision updated')
      return outcome
    },
    [currentUser],
  )

  const snoozeRevision = useCallback(
    async (queueId) => {
      if (!currentUser) return
      await snoozeRevisionQueueItem(currentUser.uid, queueId)
      toast.success('Revision snoozed for 1 day')
    },
    [currentUser],
  )

  return { markRevised, snoozeRevision }
}
