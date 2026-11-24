import { useLayoutEffect, useRef } from 'react'
import Timer from './Timer'
import './Grid.css'

export default function Grid({ puzzleState }) {
  const {
    grid,
    values,
    hintedCells,
    completeCells,
    nestedDoneCells,
    lockedCells,
    activeKey,
    activeWordCells,
    selectCell,
    typeLetter,
    backspace,
    move,
  } = puzzleState
  const activeInput = useRef(null)

  useLayoutEffect(() => {
    if (activeKey) activeInput.current?.focus()
  }, [activeKey])

  const stateClass = (key) => {
    if (completeCells.has(key)) return 'word-complete'
    if (nestedDoneCells.has(key)) return 'nested-done'
    if (hintedCells.has(key)) return 'nested-hint'
    return ''
  }

  const handleKeyDown = (event) => {
    const { key } = event
    if (/^[a-zA-Z]$/.test(key)) {
      event.preventDefault()
      typeLetter(key.toUpperCase())
    } else if (key === 'Backspace') {
      event.preventDefault()
      backspace()
    } else if (key === 'ArrowLeft') {
      event.preventDefault()
      move(0, -1)
    } else if (key === 'ArrowRight') {
      event.preventDefault()
      move(0, 1)
    } else if (key === 'ArrowUp') {
      event.preventDefault()
      move(-1, 0)
    } else if (key === 'ArrowDown') {
      event.preventDefault()
      move(1, 0)
    }
  }

  return (
    <div className="crossword-container">
      <Timer />
      <div
        className="grid-board"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 35px)`,
          gridTemplateRows: `repeat(${grid.rows}, 35px)`,
        }}
      >
        {grid.cells.map((cell) => {
          const key = `${cell.row},${cell.col}`
          const inWord = activeWordCells.has(key)
          const isActive = activeKey === key
          return (
            <div
              key={key}
              className={`cell ${
                cell.isBlack
                  ? 'black-cell'
                  : `white-cell ${stateClass(key)} ${
                      inWord ? 'active-word' : ''
                    } ${isActive ? 'active-cell' : ''}`
              }`}
            >
              {cell.number && (
                <span className="cell-number">{cell.number}</span>
              )}
              {!cell.isBlack && (
                <input
                  ref={isActive ? activeInput : null}
                  type="text"
                  maxLength="1"
                  value={values[key] ?? ''}
                  readOnly={lockedCells.has(key)}
                  onMouseDown={() => selectCell(cell.row, cell.col)}
                  onFocus={() => {
                    if (!isActive) selectCell(cell.row, cell.col)
                  }}
                  onKeyDown={handleKeyDown}
                  onChange={() => {}}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
