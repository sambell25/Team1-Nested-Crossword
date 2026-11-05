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
  // The active cell and which direction we're typing in.
  const [active, setActive] = useState(null) // { row, col } | null
  const [direction, setDirection] = useState('across') // 'across' | 'down'

  const matches = useCallback(
    (cells) => cells.every((cell) => values[keyOf(cell)] === cell.letter),
    [values],
  )

  // Map every non-black cell to the across/down answers that cover it, so we
  // can find the word a clicked cell belongs to and know when a cell is shared.
  const cellIndex = useMemo(() => {
    const index = new Map()
    for (const entry of puzzle.answers) {
      for (const cell of getAnswerCells(entry)) {
        const key = keyOf(cell)
        const existing = index.get(key) ?? {}
        existing[entry.direction] = entry
        index.set(key, existing)
      }
    }
    return index
  }, [puzzle])

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

  // The answer the active cell belongs to in the current direction (falling
  // back to the other direction if this cell only has one).
  const activeEntry = useMemo(() => {
    if (!active) return null
    const at = cellIndex.get(keyOf(active))
    if (!at) return null
    return at[direction] ?? at.across ?? at.down ?? null
  }, [active, direction, cellIndex])

  // The set of cells to highlight as the active word.
  const activeWordCells = useMemo(() => {
    if (!activeEntry) return new Set()
    return new Set(getAnswerCells(activeEntry).map(keyOf))
  }, [activeEntry])

  const activeKey = active ? keyOf(active) : null

  // Click a cell. Clicking the already-active cell flips direction when that
  // cell has both an across and a down answer.
  const selectCell = useCallback(
    (row, col) => {
      const key = `${row},${col}`
      const at = cellIndex.get(key)
      if (!at) return

      const hasBoth = at.across && at.down
      const sameCell = active && keyOf(active) === key

      if (sameCell && hasBoth) {
        setDirection((d) => (d === 'across' ? 'down' : 'across'))
      } else if (!hasBoth) {
        setDirection(at.across ? 'across' : 'down')
      }
      setActive({ row, col })
    },
    [cellIndex, active],
  )

  // Advance the active cell one step along the current word (no wrap).
  const advance = useCallback(
    (step) => {
      if (!activeEntry || !active) return
      const cells = getAnswerCells(activeEntry)
      const i = cells.findIndex((c) => keyOf(c) === keyOf(active))
      const next = cells[i + step]
      if (next) setActive({ row: next.row, col: next.col })
    },
    [activeEntry, active],
  )

  const setCell = (row, col, letter) => {
    const key = `${row},${col}`
    if (derived.lockedCells.has(key)) return
    setValues((current) => ({ ...current, [key]: letter }))
  }

  // Type a letter into the active cell and step forward.
  const typeLetter = useCallback(
    (letter) => {
      if (!active) return
      const key = keyOf(active)
      if (derived.lockedCells.has(key)) return
      setValues((current) => ({ ...current, [key]: letter }))
      advance(1)
    },
    [active, derived.lockedCells, advance],
  )

  // Backspace: clear current cell, or if it's already empty, step back and
  // clear the previous cell.
  const backspace = useCallback(() => {
    if (!active || !activeEntry) return
    const key = keyOf(active)
    if (derived.lockedCells.has(key)) return

    if (values[key]) {
      setValues((current) => ({ ...current, [key]: '' }))
      return
    }

    // Current cell empty -> move to previous cell in the word and clear it.
    const cells = getAnswerCells(activeEntry)
    const i = cells.findIndex((c) => keyOf(c) === key)
    const prev = cells[i - 1]
    if (!prev) return
    const prevKey = keyOf(prev)
    setActive({ row: prev.row, col: prev.col })
    if (!derived.lockedCells.has(prevKey)) {
      setValues((current) => ({ ...current, [prevKey]: '' }))
    }
  }, [active, activeEntry, values, derived.lockedCells])

  // Arrow-key movement. Left/right force across, up/down force down.
  const move = useCallback(
    (dRow, dCol) => {
      if (!active) return
      const nextDir = dRow !== 0 ? 'down' : 'across'
      setDirection(nextDir)
      let r = active.row + dRow
      let c = active.col + dCol
      // Skip over black cells until we hit a real one or leave the grid.
      while (r >= 0 && r < grid.rows && c >= 0 && c < grid.cols) {
        if (cellIndex.has(`${r},${c}`)) {
          setActive({ row: r, col: c })
          return
        }
        r += dRow
        c += dCol
      }
    },
    [active, grid.rows, grid.cols, cellIndex],
  )

  const revealHint = (answerId) =>
    setHintCounts((current) => ({
      ...current,
      [answerId]: (current[answerId] ?? 0) + 1,
    }))

  return {
    puzzle,
    grid,
    values,
    setCell,
    hintCounts,
    revealHint,
    // active-cell / navigation
    activeKey,
    activeWordCells,
    direction,
    selectCell,
    typeLetter,
    backspace,
    move,
    ...derived,
  }
}
