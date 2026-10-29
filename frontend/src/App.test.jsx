import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import App from './App.jsx'
import {
  buildGrid,
  getAnswerCells,
  getNestedWordCells,
  getPuzzleEntries,
  validatePuzzle,
} from './services/mockPuzzleService'

afterEach(cleanup)

it('renders without crashing', () => {
  const { container } = render(<App />)
  expect(container.firstChild).not.toBeNull()
})

it('allows typing a letter into a grid square', () => {
  render(<App />)
  const input = screen.getAllByRole('textbox')[0]

  fireEvent.change(input, { target: { value: 'a' } })

  expect(input.value).toBe('A')
})

it('builds a valid puzzle with black squares where there are no letters', () => {
  expect(validatePuzzle().valid).toBe(true)
  const grid = buildGrid()
  const letters = grid.cells.filter((c) => !c.isBlack)
  expect(grid.cells).toHaveLength(grid.rows * grid.cols)
  expect(letters.length).toBeLessThan(grid.cells.length)
  expect(letters.every((c) => c.solution)).toBe(true)
})

it('highlights a nested word, crosses off its hint, and locks a completed word', () => {
  const { container } = render(<App />)
  const entry = getPuzzleEntries()[0]
  const nested = entry.nested_words[0]
  const inputs = () => [...container.querySelectorAll('.white-cell input')]
  const typeCells = (cells) =>
    cells.forEach(({ row, col, letter }) => {
      const grid = buildGrid()
      const index = grid.cells
        .filter((c) => !c.isBlack)
        .findIndex((c) => c.row === row && c.col === col)
      fireEvent.change(inputs()[index], { target: { value: letter } })
    })

  fireEvent.click(screen.getAllByText('Nested Word Hint')[0])
  expect(container.querySelectorAll('.nested-hint')).toHaveLength(
    nested.word.length,
  )

  typeCells(getNestedWordCells(entry, nested))
  expect(container.querySelectorAll('.nested-done')).toHaveLength(
    nested.word.length,
  )
  expect(container.querySelectorAll('li.crossed-off')).toHaveLength(1)

  typeCells(getAnswerCells(entry))
  expect(container.querySelectorAll('.word-complete').length).toBe(
    entry.length,
  )
  const locked = container.querySelector('.word-complete input')
  expect(locked.readOnly).toBe(true)
})
