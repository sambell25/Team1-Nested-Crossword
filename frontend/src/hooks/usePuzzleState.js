import { useCallback, useMemo, useState } from 'react'
import {
  buildGrid,
  getAnswerCells,
  getNestedWordCells,
  getPuzzle,
} from '../services/mockPuzzleService'

const keyOf = (cell) => `${cell.row},${cell.col}`

export default function usePuzzleState() {
  const puzzle = useMemo(() => getPuzzle(), [])
  const grid = useMemo(() => buildGrid(puzzle), [puzzle])
  const [values, setValues] = useState({})
  const [hintCounts, setHintCounts] = useState({})

  const matches = useCallback(
    (cells) => cells.every((cell) => values[keyOf(cell)] === cell.letter),
    [values],
  )

  const derived = useMemo(() => {
    const completeAnswers = new Set()
    const hintedCells = new Set()
    const nestedDoneCells = new Set()
    const lockedCells = new Set()
    const nestedDone = {}

    for (const entry of puzzle.answers) {
      const cells = getAnswerCells(entry)
      const complete = matches(cells)

      if (complete) {
        completeAnswers.add(entry.answer_id)
        cells.forEach((cell) => lockedCells.add(keyOf(cell)))
      }

      const revealed = (entry.nested_words ?? []).slice(
        0,
        hintCounts[entry.answer_id] ?? 0,
      )

      nestedDone[entry.answer_id] = revealed.map((nested) => {
        const nestedCells = getNestedWordCells(entry, nested)
        const done = complete || matches(nestedCells)
        nestedCells.forEach((cell) =>
          (done ? nestedDoneCells : hintedCells).add(keyOf(cell)),
        )
        return done
      })
    }

    return {
      completeAnswers,
      hintedCells,
      nestedDoneCells,
      lockedCells,
      nestedDone,
    }
  }, [puzzle, matches, hintCounts])

  const setCell = (row, col, letter) => {
    const key = `${row},${col}`
    if (derived.lockedCells.has(key)) return
    setValues((current) => ({ ...current, [key]: letter }))
  }

  const revealHint = (answerId) =>
    setHintCounts((current) => ({
      ...current,
      [answerId]: (current[answerId] ?? 0) + 1,
    }))

  return { puzzle, grid, values, setCell, hintCounts, revealHint, ...derived }
}
