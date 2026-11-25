import { useState } from 'react'
import './ActionsMenu.css'

export default function ActionsMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="actions-menu">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        Actions
      </button>

      {isOpen && (
        <div className="actions-dropdown">
          <button type="button" disabled>
            Check Square
          </button>
          <button type="button" disabled>
            Check Word
          </button>
          <button type="button" disabled>
            Check Puzzle
          </button>
          <button type="button" disabled>
            Reveal Square
          </button>
          <button type="button" disabled>
            Reveal Word
          </button>
          <button type="button" disabled>
            Reveal Puzzle
          </button>
          <button type="button" disabled>
            Reset Puzzle
          </button>
        </div>
      )}
    </div>
  )
}
