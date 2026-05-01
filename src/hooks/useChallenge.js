import { useEffect, useRef, useState } from 'react'

export function useChallenge(expiresAt) {
  const timerRef = useRef(null)
  const [timeLeftMs, setTimeLeftMs] = useState(0)

  useEffect(() => {
    if (!expiresAt) return undefined
    
    // Handle both regular Date objects/strings and Firestore Timestamps
    const dateObj = typeof expiresAt.toDate === 'function' ? expiresAt.toDate() : new Date(expiresAt)
    const end = dateObj.getTime()
    
    // Set initial state immediately to avoid 1s delay
    setTimeLeftMs(Math.max(0, end - Date.now()))

    timerRef.current = window.setInterval(() => {
      setTimeLeftMs(Math.max(0, end - Date.now()))
    }, 1000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [expiresAt])

  return { timeLeftMs }
}
