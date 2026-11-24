import { useEffect, useMemo, useRef, useState } from 'react'
import { checkPuzzle, findWordId } from '../services/puzzleApi'
import { getAnswerCells, getNestedWordCells } from '../services/puzzleGrid'

const keyOf = ({ row, col }) => `${row},${col}`
const guessKey = (id, guess) => `${id}:${guess}`

export default function useAnswerChecks(puzzle, values, hintCounts) {
  const [answerChecks, setAnswerChecks] = useState({})
  const [wordIds, setWordIds] = useState({})
  const requests = useRef(null)

  const entries = useMemo(() => {
    const read = (cells) => {
      const letters = cells.map((cell) => values[keyOf(cell)])
      return letters.length && letters.every(Boolean) ? letters.join('') : ''
    }
    return puzzle.answers.map((entry) => {
      const cells = getAnswerCells(entry)
      return {
        id: entry.answer_id,
        cells,
        guess: read(cells),
        nested: (entry.nested_words ?? []).map((nested) => {
          const cells = getNestedWordCells(entry, nested)
          return { id: nested.id, cells, guess: read(cells) }
        }),
      }
    })
  }, [puzzle, values])

  useEffect(() => {
    const controller = new AbortController()
    requests.current = {
      signal: controller.signal,
      answers: new Set(),
      words: new Set(),
    }
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const {
      signal,
      answers: requestedAnswers,
      words: requestedWords,
    } = requests.current
    const answers = []
    const words = new Set()
    for (const entry of entries) {
      const key = guessKey(entry.id, entry.guess)
      if (entry.guess && !requestedAnswers.has(key)) {
        requestedAnswers.add(key)
        answers.push({ answer_id: entry.id, guess: entry.guess })
      }
      if (answerChecks[key]) continue
      for (const { id, guess } of entry.nested) {
        if (id != null && guess && !requestedWords.has(guess)) {
          requestedWords.add(guess)
          words.add(guess)
        }
      }
    }

    if (answers.length) {
      checkPuzzle(puzzle.puzzle_id, answers, signal)
        .then(({ answers: results }) => {
          if (signal.aborted) return
          const byId = new Map(
            results.map(({ answer_id, correct }) => [answer_id, correct]),
          )
          const checked = {}
          for (const { answer_id, guess } of answers) {
            const key = guessKey(answer_id, guess)
            if (byId.has(answer_id)) {
              checked[key] = byId.get(answer_id)
            } else {
              requestedAnswers.delete(key)
            }
          }
          if (Object.keys(checked).length) {
            setAnswerChecks((current) => ({ ...current, ...checked }))
          }
        })
        .catch(() => {
          for (const { answer_id, guess } of answers) {
            requestedAnswers.delete(guessKey(answer_id, guess))
          }
        })
    }

    for (const guess of words) {
      findWordId(guess, signal)
        .then((id) => {
          if (!signal.aborted)
            setWordIds((current) => ({ ...current, [guess]: id }))
        })
        .catch(() => requestedWords.delete(guess))
    }
  }, [entries, puzzle.puzzle_id, answerChecks])

  return useMemo(() => {
    const completeAnswers = new Set()
    const completeCells = new Set()
    const nestedDoneCells = new Set()
    const hintedCells = new Set()
    const nestedDone = {}

    for (const entry of entries) {
      const complete = answerChecks[guessKey(entry.id, entry.guess)] === true
      if (complete) {
        completeAnswers.add(entry.id)
        entry.cells.forEach((cell) => completeCells.add(keyOf(cell)))
      }
      nestedDone[entry.id] = entry.nested.map(({ id, cells, guess }, index) => {
        const correct = complete || (id != null && wordIds[guess] === id)
        if (correct) {
          cells.forEach((cell) => nestedDoneCells.add(keyOf(cell)))
        } else if (index < (hintCounts[entry.id] ?? 0)) {
          cells.forEach((cell) => hintedCells.add(keyOf(cell)))
        }
        return correct
      })
    }

    return {
      lockedCells: new Set([...completeCells, ...nestedDoneCells]),
      completeAnswers,
      completeCells,
      nestedDoneCells,
      hintedCells,
      nestedDone,
    }
  }, [entries, hintCounts, answerChecks, wordIds])
}
