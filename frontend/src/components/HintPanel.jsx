export default function HintPanel({ puzzleState }) {
  const { puzzle, hintCounts, revealHint, completeAnswers, nestedDone } =
    puzzleState

  const renderGroup = (direction) => (
    <>
      <h2>{direction === 'across' ? 'Across' : 'Down'}</h2>
      {puzzle.answers
        .filter((e) => e.direction === direction)
        .map((e) => {
          const nestedWords = e.nested_words ?? []
          const shown = hintCounts[e.answer_id] ?? 0
          const complete = completeAnswers.has(e.answer_id)

          return (
            <div key={e.answer_id} className="clue">
              <p className={complete ? 'crossed-off' : undefined}>
                <strong>{e.clue_number}.</strong> {e.clue} ({e.length})
              </p>
              <ul>
                {nestedWords.slice(0, shown).map((nested, i) => (
                  <li
                    key={nested.word}
                    className={
                      nestedDone[e.answer_id]?.[i] ? 'crossed-off' : undefined
                    }
                  >
                    {nested.hint} ({nested.word.length})
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={complete || shown >= nestedWords.length}
                onClick={() => revealHint(e.answer_id)}
              >
                Nested Word Hint
              </button>
            </div>
          )
        })}
    </>
  )

  return (
    <div className="hint-panel">
      {renderGroup('across')}
      {renderGroup('down')}
    </div>
  )
}
