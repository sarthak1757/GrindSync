/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { createGroup, joinGroupWithInviteCode, subscribeToChallenges, subscribeToGroups } from '../services/firestore'

const GroupContext = createContext(null)

export function GroupProvider({ children }) {
  const { currentUser } = useAuth()
  const [groups, setGroups] = useState([])
  const [challenges, setChallenges] = useState([])

  useEffect(() => {
    if (!currentUser) return undefined
    const unsubGroups = subscribeToGroups(currentUser.uid, setGroups)
    const unsubChallenges = subscribeToChallenges(currentUser.uid, setChallenges)

    return () => {
      unsubGroups?.()
      unsubChallenges?.()
    }
  }, [currentUser])

  const createNewGroup = useCallback(async (payload) => {
    if (!currentUser) return
    await createGroup(currentUser, payload)
  }, [currentUser])

  const joinGroup = useCallback(async (inviteCode) => {
    if (!currentUser) return
    await joinGroupWithInviteCode(currentUser, inviteCode)
  }, [currentUser])

  const value = useMemo(
    () => ({ groups, challenges, createNewGroup, joinGroup }),
    [groups, challenges, createNewGroup, joinGroup],
  )

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}

export const useGroups = () => useContext(GroupContext)
