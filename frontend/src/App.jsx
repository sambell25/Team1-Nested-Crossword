import Grid from './components/Grid'
import HintPanel from './components/HintPanel'
import usePuzzleState from './hooks/usePuzzleState'
import './App.css'

function App() {
  const puzzleState = usePuzzleState()

  return (
    <div className="App">
      <header style={{ textAlign: 'center', margin: '20px 0' }}>
        <h1>WordNest Crossword</h1>
      </header>
      <main className="layout">
        <section className="layout-grid">
          <Grid puzzleState={puzzleState} />
        </section>
        <aside className="layout-hints">
          <HintPanel puzzleState={puzzleState} />
        </aside>
      </main>
    </div>
  )
}
export default App
