import Timer from './Timer'
import './Grid.css'

export default function Grid({ puzzleState }) {
  const { grid, values, setCell, hintedCells, nestedDoneCells, lockedCells } =
    puzzleState

  const handleInputChange = (cell, event) => {
    const letter = event.target.value
      .slice(-1)
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
    setCell(cell.row, cell.col, letter)
  }

  const stateClass = (key) => {
    if (lockedCells.has(key)) return 'word-complete'
    if (nestedDoneCells.has(key)) return 'nested-done'
    if (hintedCells.has(key)) return 'nested-hint'
    return ''
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
          return (
            <div
              key={key}
              className={`cell ${cell.isBlack ? 'black-cell' : `white-cell ${stateClass(key)}`}`}
            >
              {cell.number && (
                <span className="cell-number">{cell.number}</span>
              )}
              {!cell.isBlack && (
                <input
                  type="text"
                  maxLength="1"
                  value={values[key] ?? ''}
                  readOnly={lockedCells.has(key)}
                  onChange={(e) => handleInputChange(cell, e)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
