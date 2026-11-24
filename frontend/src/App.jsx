import { useEffect, useState } from 'react'
import ActionsMenu from './components/ActionsMenu'
import Grid from './components/Grid'
import HintPanel from './components/HintPanel'
import ActionsMenu from './components/ActionsMenu'
import usePuzzleState from './hooks/usePuzzleState'
import { listPuzzles, loadPuzzle } from './services/puzzleApi'
import './App.css'

function PuzzleGame({ puzzle }) {
  const puzzleState = usePuzzleState(puzzle)

  return (
    <main className="layout">
      <section className="layout-grid">
        <Grid puzzleState={puzzleState} />
      </section>
      <aside className="layout-hints">
        <HintPanel puzzleState={puzzleState} />
      </aside>
    </main>
  )
}

function App() {
  const [difficulty, setDifficulty] = useState('')
  const [offset, setOffset] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [list, setList] = useState({})
  const [detail, setDetail] = useState({})
  const [listAttempt, setListAttempt] = useState(0)
  const [detailAttempt, setDetailAttempt] = useState(0)
  const listKey = JSON.stringify([difficulty, offset, listAttempt])
  const detailKey = JSON.stringify([selectedId, detailAttempt])

  useEffect(() => {
    const controller = new AbortController()
    listPuzzles({ difficulty, offset, signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setList({ key: listKey, data })
      },
      (error) => {
        if (!controller.signal.aborted)
          setList({ key: listKey, error: error.message })
      },
    )
    return () => controller.abort()
  }, [difficulty, offset, listKey])

  useEffect(() => {
    if (!selectedId) return
    const controller = new AbortController()
    loadPuzzle(selectedId, controller.signal).then(
      (puzzle) => {
        if (!controller.signal.aborted) setDetail({ key: detailKey, puzzle })
      },
      (error) => {
        if (!controller.signal.aborted)
          setDetail({ key: detailKey, error: error.message })
      },
    )
    return () => controller.abort()
  }, [selectedId, detailKey])

  const currentList = list.key === listKey ? list : {}
  const currentDetail = detail.key === detailKey ? detail : {}

  function changePage(nextOffset) {
    setOffset(nextOffset)
    selectPuzzle('')
  }

  function selectPuzzle(id) {
    setSelectedId(id)
    setDetailAttempt((attempt) => attempt + 1)
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>WordNest Crossword</h1>
        <ActionsMenu />
      </header>
      <section className="puzzle-picker" aria-label="Puzzle picker">
        <label>
          Difficulty{' '}
          <select
            value={difficulty}
            onChange={(event) => {
              setDifficulty(event.target.value)
              changePage(0)
            }}
          >
            <option value="">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        {currentList.error && (
          <>
            <p role="alert">{currentList.error}</p>
            <button
              type="button"
              onClick={() => setListAttempt((attempt) => attempt + 1)}
            >
              Retry puzzle list
            </button>
          </>
        )}
        {!currentList.data && !currentList.error && (
          <p role="status">Loading puzzles…</p>
        )}
        {currentList.data?.items.length === 0 && (
          <p role="status">No puzzles found.</p>
        )}
        {currentList.data?.items.length > 0 && (
          <label>
            Puzzle{' '}
            <select
              value={selectedId}
              onChange={(event) => selectPuzzle(event.target.value)}
            >
              <option value="">Choose a puzzle</option>
              {currentList.data.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        )}
        {currentList.data && (
          <>
            {offset > 0 && (
              <button
                type="button"
                onClick={() =>
                  changePage(Math.max(0, offset - currentList.data.limit))
                }
              >
                Previous puzzles
              </button>
            )}
            {offset + currentList.data.items.length < currentList.data.total &&
              currentList.data.items.length > 0 && (
                <button
                  type="button"
                  onClick={() => changePage(offset + currentList.data.limit)}
                >
                  Next puzzles
                </button>
              )}
          </>
        )}
      </section>
      {selectedId && !currentDetail.puzzle && !currentDetail.error && (
        <p role="status">Loading puzzle…</p>
      )}
      {currentDetail.error && (
        <>
          <p role="alert">{currentDetail.error}</p>
          <button type="button" onClick={() => selectPuzzle(selectedId)}>
            Retry puzzle
          </button>
        </>
      )}
      {currentDetail.puzzle && (
        <PuzzleGame key={detailKey} puzzle={currentDetail.puzzle} />
      )}
    </div>
  )
}
export default App
