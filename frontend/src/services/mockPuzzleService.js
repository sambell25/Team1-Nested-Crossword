import mockPuzzle from '../data/mockPuzzle.json'

export function getPuzzle() {
  return mockPuzzle
}

export function getPuzzleById(id) {
  return String(mockPuzzle.id) === String(id) ? mockPuzzle : null
}

export function getPuzzleEntries() {
  return mockPuzzle.answers
}

export function getAnswerById(answerId) {
  return (
    mockPuzzle.answers.find((answer) => answer.answer_id === answerId) ?? null
  )
}

export function getClue(answerId) {
  return getAnswerById(answerId)?.clue ?? null
}

export function getHints(answerId) {
  return getAnswerById(answerId)?.hints ?? []
}

export function getHint(answerId, level = 1) {
  if (!Number.isInteger(level) || level < 1) {
    return null
  }

  return getHints(answerId)[level - 1] ?? null
}

export function getAnswerCells(entry) {
  if (
    !entry ||
    typeof entry.answer !== 'string' ||
    !Number.isInteger(entry.row) ||
    !Number.isInteger(entry.col) ||
    !['across', 'down'].includes(entry.direction)
  ) {
    return []
  }

  return [...entry.answer.toUpperCase()].map((letter, index) => ({
    row: entry.row + (entry.direction === 'down' ? index : 0),
    col: entry.col + (entry.direction === 'across' ? index : 0),
    letter,
    answer_id: entry.answer_id,
  }))
}

export function validatePuzzle(puzzle = mockPuzzle) {
  const errors = []

  if (
    !puzzle ||
    !Number.isInteger(puzzle.width) ||
    puzzle.width < 1 ||
    !Number.isInteger(puzzle.height) ||
    puzzle.height < 1
  ) {
    errors.push('Puzzle must have a valid width and height.')
    return { valid: false, errors }
  }

  if (!Array.isArray(puzzle.answers)) {
    return {
      valid: false,
      errors: ['Puzzle answers must be an array.'],
    }
  }

  const answerIds = new Set()
  const placements = new Set()
  const cells = new Map()

  for (const entry of puzzle.answers) {
    if (!entry || typeof entry.answer !== 'string') {
      errors.push('Every answer must contain an answer string.')
      continue
    }

    if (
      !Number.isInteger(entry.row) ||
      !Number.isInteger(entry.col) ||
      entry.row < 0 ||
      entry.col < 0
    ) {
      errors.push(`Invalid coordinates for ${entry.answer_id}.`)
      continue
    }

    if (!['across', 'down'].includes(entry.direction)) {
      errors.push(`Invalid direction for ${entry.answer_id}.`)
      continue
    }

    const answer = entry.answer.toUpperCase()

    if (!/^[A-Z]+$/.test(answer)) {
      errors.push(`Answer ${entry.answer_id} must contain letters only.`)
      continue
    }

    if (entry.length !== answer.length) {
      errors.push(`Incorrect length for ${entry.answer_id}.`)
    }

    if (
      (entry.direction === 'across' &&
        entry.col + answer.length > puzzle.width) ||
      (entry.direction === 'down' && entry.row + answer.length > puzzle.height)
    ) {
      errors.push(`${entry.answer_id} extends beyond the grid.`)
    }

    if (entry.answer_id == null || String(entry.answer_id).trim() === '') {
      errors.push('Every answer must have an answer_id.')
    } else if (answerIds.has(String(entry.answer_id))) {
      errors.push(`Duplicate answer ID: ${entry.answer_id}.`)
    } else {
      answerIds.add(String(entry.answer_id))
    }

    const placement = `${answer}:${entry.row}:${entry.col}:${entry.direction}`

    if (placements.has(placement)) {
      errors.push(`Duplicate placement: ${entry.answer_id}.`)
    } else {
      placements.add(placement)
    }

    for (const cell of getAnswerCells(entry)) {
      const key = `${cell.row},${cell.col}`
      const existingLetter = cells.get(key)

      if (existingLetter && existingLetter !== cell.letter) {
        errors.push(
          `Conflicting letters at row ${cell.row}, column ${cell.col}.`,
        )
      } else {
        cells.set(key, cell.letter)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function getNestedWords(answerId) {
  const answer = getAnswerById(answerId)

  return Array.isArray(answer?.nested_words) ? answer.nested_words : []
}
