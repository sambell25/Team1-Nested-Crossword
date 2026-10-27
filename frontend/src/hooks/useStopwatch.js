import { useEffect, useRef, useState } from 'react'

const TICK_MS = 250

// 65 -> "01:05", 3661 -> "1:01:01"
export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n) => String(n).padStart(2, '0')

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`
}

// Counts up from zero. Elapsed time is measured with Date.now() instead of by
// counting interval ticks, so it stays accurate when the browser throttles
// timers (e.g. in a background tab).
export function useStopwatch() {
  const [isRunning, setIsRunning] = useState(true)
  const [seconds, setSeconds] = useState(0)
  // Time accumulated by earlier runs, i.e. before the most recent pause.
  const bankedMs = useRef(0)

  useEffect(() => {
    if (!isRunning) return

    const startedAt = Date.now()
    const id = setInterval(() => {
      const elapsedMs = bankedMs.current + (Date.now() - startedAt)
      setSeconds(Math.floor(elapsedMs / 1000))
    }, TICK_MS)

    return () => {
      clearInterval(id)
      bankedMs.current += Date.now() - startedAt
    }
  }, [isRunning])

  const toggle = () => setIsRunning((running) => !running)

  return { seconds, isRunning, toggle }
}
