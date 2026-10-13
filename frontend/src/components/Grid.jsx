import { useState } from 'react'
import mockGridData from '../data/mockGrid.json'
import './Grid.css'

function createGridData() {
  const rows = mockGridData.rows || 15
  const cols = mockGridData.cols || 15

  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        row: r,
        col: c,
        isBlack: false,
        value: '',
        number: null,
      })
    }
  }

  if (mockGridData.cells) {
    mockGridData.cells.forEach((mockCell) => {
      const index = mockCell.row * cols + mockCell.col
      if (index >= 0 && index < cells.length) {
        cells[index] = { ...cells[index], ...mockCell }
      }
    })
  }

  return { rows, cols, cells }
}

export default function Grid() {
  const [gridData, setGridData] = useState(createGridData)

  const handleInputChange = (index, event) => {
    const newValue = event.target.value.slice(-1).toUpperCase()
    const updatedCells = [...gridData.cells]
    updatedCells[index].value = newValue

    setGridData({
      ...gridData,
      cells: updatedCells,
    })
  }

  return (
    <div className="crossword-container">
      <div
        className="grid-board"
        style={{
          gridTemplateColumns: `repeat(${gridData.cols}, 35px)`,
          gridTemplateRows: `repeat(${gridData.rows}, 35px)`,
        }}
      >
        {gridData.cells.map((cell, index) => (
          <div
            key={index}
            className={`cell ${cell.isBlack ? 'black-cell' : 'white-cell'}`}
          >
            {cell.number && <span className="cell-number">{cell.number}</span>}
            {!cell.isBlack && (
              <input
                type="text"
                maxLength="1"
                value={cell.value}
                onChange={(e) => handleInputChange(index, e)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
