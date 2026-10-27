import { formatTime, useStopwatch } from '../hooks/useStopwatch'
import './Timer.css'

export default function Timer() {
  const { seconds, isRunning, toggle } = useStopwatch()

  return (
    <div className="timer" role="group" aria-label="Puzzle timer">
      <span className="timer-display" role="timer">
        {formatTime(seconds)}
      </span>
      <button type="button" className="timer-toggle" onClick={toggle}>
        {isRunning ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}
