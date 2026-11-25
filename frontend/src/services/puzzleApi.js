const apiUrl = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? '/api'
    : 'https://crossword-project-backend-9q0w.onrender.com')
).replace(/\/+$/, '')

async function request(path, options, allowNotFound = false) {
  let response
  try {
    response = await fetch(`${apiUrl}${path}`, options)
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Could not reach the puzzle server. Please try again.', {
      cause: error,
    })
  }
  if (allowNotFound && response.status === 404) return null
  if (!response.ok) {
    throw new Error(
      `Puzzle server returned HTTP ${response.status}. Please try again.`,
    )
  }
  return response.json()
}

export function listPuzzles({ difficulty, offset, signal }) {
  const params = new URLSearchParams({ limit: '50', offset: String(offset) })
  if (difficulty) params.set('difficulty', difficulty)
  return request(`/puzzles?${params}`, { signal })
}

export async function loadPuzzle(id, signal) {
  const puzzle = await request(`/puzzles/${encodeURIComponent(id)}`, { signal })
  return {
    ...puzzle,
    answers: puzzle.answers.map((entry) => ({
      ...entry,
      clue_number: entry.number,
      length: entry.answer_length,
      clue: entry.clue?.clue_text?.trim() || 'Clue unavailable',
      nested_words: (entry.hints ?? []).map((hint) => ({
        id: hint.sub_word_id,
        start: hint.start_offset,
        length: hint.answer_length,
        hint: hint.clue?.clue_text?.trim() || 'Hint text unavailable',
      })),
    })),
  }
}

export function checkPuzzle(id, answers, signal) {
  return request(`/puzzles/${encodeURIComponent(id)}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
    signal,
  })
}

export async function findWordId(guess, signal) {
  const word = await request(
    `/words/${encodeURIComponent(guess)}`,
    { signal },
    true,
  )
  return word?.id ?? null
}
