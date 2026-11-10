import { useState } from 'react'
import './ActionsMenu.css'



export default function ActionsMenu() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="actions-menu">
        <button
        onClick={() => setIsOpen(!isOpen)}
        >
        Actions
        </button>

        {isOpen && (
            <div className="actions-dropdown">
            <button onClick={() => setIsOpen(false)}>Check Square</button>
            <button onClick={() => setIsOpen(false)}>Check Word</button>
            <button onClick={() => setIsOpen(false)}>Check Puzzle</button>
            <button onClick={() => setIsOpen(false)}>Reveal Square</button>
            <button onClick={() => setIsOpen(false)}>Reveal Word</button>
            <button onClick={() => setIsOpen(false)}>Reveal Puzzle</button>
            <button onClick={() => setIsOpen(false)}>Reset Puzzle</button>
            </div>
        )}
        </div>
    )
}