import { useEffect, useRef, useState } from 'react'

export function useChallenge(expiresAt) {
  const timerRef = useRef(null)
  const [timeLeftMs, setTimeLeftMs] = useState(0)

  useEffect(() => {
    if (!expiresAt) return undefined
    const end = new Date(expiresAt).getTime()
    timerRef.current = window.setInterval(() => {
      setTimeLeftMs(Math.max(0, end - Date.now()))
    }, 1000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [expiresAt])

  return { timeLeftMs }
}
