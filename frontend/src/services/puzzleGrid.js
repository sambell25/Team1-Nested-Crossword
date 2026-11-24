export function getAnswerCells(entry) {
  const length = entry?.answer?.length ?? entry?.length
  if (
    !entry ||
    !Number.isInteger(length) ||
    !Number.isInteger(entry.row) ||
    !Number.isInteger(entry.col) ||
    !['across', 'down'].includes(entry.direction)
  ) {
    return []
  }

  return Array.from({ length }, (_, index) => ({
    row: entry.row + (entry.direction === 'down' ? index : 0),
    col: entry.col + (entry.direction === 'across' ? index : 0),
    letter: entry.answer?.[index]?.toUpperCase() ?? '',
    answer_id: entry.answer_id,
  }))
}

// Cells covered by a nested word, in reading order.
export function getNestedWordCells(entry, nested) {
  return getAnswerCells(entry).slice(
    nested.start,
    nested.start + (nested.length ?? nested.word.length),
  )
}

// Builds the full grid. Any square not covered by an answer is black.
export function buildGrid(puzzle) {
  const { width, height } = puzzle
  const cells = []

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      cells.push({
        row,
        col,
        isBlack: true,
        solution: '',
        number: null,
        answer_ids: [],
      })
    }
  }

  for (const entry of puzzle.answers) {
    getAnswerCells(entry).forEach((cell, index) => {
      const target = cells[cell.row * width + cell.col]
      target.isBlack = false
      target.solution = cell.letter
      target.answer_ids.push(entry.answer_id)
      if (index === 0) {
        const existing = target.number ? String(target.number).split(',') : []
        const n = String(entry.clue_number)
        if (!existing.includes(n)) {
          existing.push(n)
          target.number = existing
            .map(Number)
            .sort((a, b) => a - b)
            .join(',')
        }
      }
    })
  }

  return { rows: height, cols: width, cells }
}
