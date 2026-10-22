import { useState } from 'react'
import { getPuzzleEntries } from '../services/mockPuzzleService'

export default function HintPanel() {
  const entries = getPuzzleEntries()
  const [revealed, setRevealed] = useState({})

  const reveal = (id) =>
    setRevealed((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }))

  const renderGroup = (direction) => (
    <>
      <h2>{direction === 'across' ? 'Across' : 'Down'}</h2>
      {entries.filter((e) => e.direction === direction).map((e) => {
        const shown = revealed[e.answerid] ?? 0
        return (
          <div key={e.answerid} className="clue">
            <p><strong>{e.cluenumber}.</strong> {e.clue}</p>
            <ul>
              {e.hints.slice(0, shown).map((h, i) => <li key={i}>{h}</li>)}
            </ul>
            <button
              type="button"
              disabled={shown >= e.hints.length}
              onClick={() => reveal(e.answerid)}
            >
              { `Nested Word Hint`}
            </button>
          </div>
        )
      })}
    </>
  )

  return <div className="hint-panel">{renderGroup('across')}{renderGroup('down')}</div>
}