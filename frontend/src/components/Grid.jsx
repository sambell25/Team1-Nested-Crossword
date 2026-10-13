import React, { useState, useEffect } from 'react'
import mockGridData from '../data/mockGrid.json'
import './Grid.css'

export default function Grid() {
  const [gridData, setGridData] = useState({ rows: 15, cols: 15, cells: [] })

  useEffect(() => {
    const rows = mockGridData.rows || 15
    const cols = mockGridData.cols || 15

    // Fill all 225 grid slots
    const fullCells = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        fullCells.push({
          row: r,
          col: c,
          isBlack: false,
          value: '',
          number: null,
        })
      }
    }

    // Overlay mock black squares and cell numbers
    if (mockGridData.cells) {
      mockGridData.cells.forEach((mockCell) => {
        const index = mockCell.row * cols + mockCell.col
        if (index >= 0 && index < fullCells.length) {
          fullCells[index] = { ...fullCells[index], ...mockCell }
        }
      })
    }

    setGridData({ rows, cols, cells: fullCells })
  }, [])

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
