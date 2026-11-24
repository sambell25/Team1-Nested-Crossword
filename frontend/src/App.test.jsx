import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App.jsx'
import {
  buildGrid,
  getPuzzleEntries,
  validatePuzzle,
} from './services/mockPuzzleService'

const fetchPuzzle = vi.fn()
const puzzleId = 16
let puzzleEntries
const entries = getPuzzleEntries().map((entry, index) => ({
  answer_id: index + 500,
  row: entry.row,
  col: entry.col,
  direction: entry.direction,
  number: entry.clue_number,
  answer_length: entry.length,
  clue: { clue_text: entry.clue },
  hints: entry.nested_words.map((nested, index) => ({
    sub_word_id: index + 1,
    start_offset: nested.start,
    answer_length: nested.word.length,
    clue: { clue_text: nested.hint },
  })),
}))

beforeEach(() => {
  puzzleEntries = entries
  vi.stubGlobal('fetch', fetchPuzzle)
  fetchPuzzle.mockImplementation(async (url, options) => {
    const { pathname } = new URL(url)
    let payload
    if (pathname === '/puzzles') {
      payload = {
        items: [{ id: puzzleId, title: 'Test puzzle' }],
        total: 1,
        limit: 50,
      }
    } else if (pathname === `/puzzles/${puzzleId}`) {
      const { rows, cols } = buildGrid()
      payload = {
        puzzle_id: puzzleId,
        title: 'Test puzzle',
        height: rows,
        width: cols,
        answers: puzzleEntries,
      }
    } else if (pathname === `/puzzles/${puzzleId}/check`) {
      const { answers } = JSON.parse(options.body)
      payload = {
        answers: entries.map(({ answer_id }, index) => ({
          answer_id,
          correct: answers.some(
            (answer) =>
              answer.answer_id === answer_id &&
              answer.guess === getPuzzleEntries()[index].answer,
          ),
        })),
      }
    } else if (pathname.startsWith('/words/')) {
      const guess = pathname.split('/').at(-1)
      const nestedIndex = getPuzzleEntries()[0].nested_words.findIndex(
        (nested) => nested.word === guess,
      )
      if (nestedIndex === -1) return { ok: false, status: 404 }
      payload = { id: entries[0].hints[nestedIndex].sub_word_id }
    } else {
      throw new Error(`Unexpected request: ${url}`)
    }
    return { ok: true, json: async () => payload }
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  fetchPuzzle.mockReset()
})

async function openPuzzle() {
  const app = render(<App />)
  const picker = await screen.findByLabelText('Puzzle')
  fireEvent.change(picker, { target: { value: String(puzzleId) } })
  await screen.findAllByRole('textbox')
  return app
}

it('lists puzzles from the API and applies the difficulty filter', async () => {
  render(<App />)
  await screen.findByLabelText('Puzzle')
  fireEvent.change(screen.getByLabelText('Difficulty'), {
    target: { value: 'hard' },
  })
  await screen.findByLabelText('Puzzle')
  expect(fetchPuzzle).toHaveBeenLastCalledWith(
    expect.stringContaining('/puzzles?limit=50&offset=0&difficulty=hard'),
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  )
})

it('keeps keyboard focus on the highlighted square while typing and navigating', async () => {
  await openPuzzle()
  const [first, second, third] = screen.getAllByRole('textbox')

  fireEvent.mouseDown(first)
  expect(document.activeElement).toBe(first)
  fireEvent.keyDown(document.activeElement, { key: 'a' })
  expect(first.value).toBe('A')
  expect(document.activeElement).toBe(second)
  expect(second.closest('.active-cell')).toBeTruthy()

  fireEvent.keyDown(document.activeElement, { key: 'b' })
  expect(second.value).toBe('B')
  expect(document.activeElement).toBe(third)
  expect(third.closest('.active-cell')).toBeTruthy()

  fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' })
  expect(document.activeElement).toBe(second)
  expect(second.closest('.active-cell')).toBeTruthy()

  act(() => first.focus())
  expect(first.closest('.active-cell')).toBeTruthy()
})

it('opens a puzzle when an entry and its nested hint have null clues', async () => {
  const [entry, ...rest] = entries
  puzzleEntries = [
    {
      ...entry,
      clue: null,
      hints: [{ ...entry.hints[0], clue: null }],
    },
    ...rest,
  ]

  await openPuzzle()
  expect(screen.getByText(/Clue unavailable/)).toBeTruthy()
  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0)
  fireEvent.click(screen.getAllByText('Nested Word Hint')[0])
  expect(screen.getByText(/Hint text unavailable/)).toBeTruthy()
})

it('builds a valid puzzle with black squares where there are no letters', () => {
  expect(validatePuzzle().valid).toBe(true)
  const grid = buildGrid()
  const letters = grid.cells.filter((c) => !c.isBlack)
  expect(grid.cells).toHaveLength(grid.rows * grid.cols)
  expect(letters.length).toBeLessThan(grid.cells.length)
  expect(letters.every((c) => c.solution)).toBe(true)
})

it('highlights cells when a nested hint is revealed', async () => {
  const { container } = await openPuzzle()
  const nested = getPuzzleEntries()[0].nested_words[0]

  fireEvent.click(screen.getAllByText('Nested Word Hint')[0])
  expect(container.querySelectorAll('.nested-hint')).toHaveLength(
    nested.word.length,
  )
})

it('locks confirmed nested and full words without waiting for an unrelated lookup', async () => {
  const { container } = await openPuzzle()
  const entry = getPuzzleEntries()[0]
  const [nested] = entry.nested_words
  const slowWord = entry.nested_words[1].word
  const respond = fetchPuzzle.getMockImplementation()
  let finishLookup
  fetchPuzzle.mockImplementation((url, options) => {
    if (url.endsWith(`/words/${slowWord}`)) {
      return new Promise((resolve) => {
        finishLookup = () => resolve(respond(url, options))
      })
    }
    return respond(url, options)
  })
  const inputs = screen.getAllByRole('textbox')
  const cells = buildGrid().cells.filter((cell) => !cell.isBlack)
  fireEvent.click(screen.getAllByText('Nested Word Hint')[0])
  function typeAt(index, letter) {
    const input =
      inputs[
        cells.findIndex(
          (cell) => cell.row === entry.row && cell.col === entry.col + index,
        )
      ]
    fireEvent.mouseDown(input)
    fireEvent.keyDown(input, { key: letter })
    return input
  }

  Array.from(nested.word).forEach((letter, index) =>
    typeAt(nested.start + index, letter),
  )
  await waitFor(() =>
    expect(container.querySelectorAll('.nested-done')).toHaveLength(
      nested.word.length,
    ),
  )
  expect(fetchPuzzle.mock.calls.some(([url]) => url.endsWith('/check'))).toBe(
    false,
  )
  const nestedInput = typeAt(nested.start, 'X')
  expect(container.querySelectorAll('li.crossed-off')).toHaveLength(1)
  expect(nestedInput.readOnly).toBe(true)
  expect(nestedInput.value).toBe(nested.word[0])
  typeAt(nested.start, 'Backspace')
  expect(nestedInput.value).toBe(nested.word[0])

  Array.from(entry.answer)
    .slice(nested.word.length)
    .forEach((letter, index) => typeAt(nested.word.length + index, letter))
  await waitFor(() =>
    expect(container.querySelectorAll('.word-complete')).toHaveLength(
      entry.length,
    ),
  )
  expect(fetchPuzzle).toHaveBeenCalledWith(
    expect.stringContaining(`/puzzles/${puzzleId}/check`),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        answers: [{ answer_id: 500, guess: entry.answer }],
      }),
    }),
  )

  expect(finishLookup).toBeTypeOf('function')
  const fullInput = typeAt(entry.length - 1, 'X')
  expect(fullInput.readOnly).toBe(true)
  expect(fullInput.value).toBe(entry.answer.at(-1))
  typeAt(entry.length - 1, 'Backspace')
  expect(fullInput.value).toBe(entry.answer.at(-1))
  expect(container.querySelectorAll('.word-complete')).toHaveLength(
    entry.length,
  )
  expect(container.querySelectorAll('p.crossed-off')).toHaveLength(1)
  await act(async () => finishLookup())
})

it('shows the original Actions controls without triggering a puzzle action', async () => {
  await openPuzzle()
  const input = screen.getAllByRole('textbox')[0]
  fireEvent.mouseDown(input)
  fireEvent.keyDown(input, { key: 'a' })
  const requestCount = fetchPuzzle.mock.calls.length

  const toggle = screen.getByRole('button', { name: 'Actions' })
  expect(screen.queryByRole('button', { name: 'Check Puzzle' })).toBeNull()
  fireEvent.click(toggle)

  for (const name of [
    'Check Square',
    'Check Word',
    'Check Puzzle',
    'Reveal Square',
    'Reveal Word',
    'Reveal Puzzle',
    'Reset Puzzle',
  ]) {
    const button = screen.getByRole('button', { name })
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
  }

  expect(input.value).toBe('A')
  expect(fetchPuzzle).toHaveBeenCalledTimes(requestCount)
  fireEvent.click(toggle)
  expect(screen.queryByRole('button', { name: 'Check Puzzle' })).toBeNull()
})
