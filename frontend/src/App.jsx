import Grid from './components/Grid'
import './App.css'

function App() {
  return (
    <div className="App">
      <header style={{ textAlign: 'center', margin: '20px 0' }}>
        <h1>Crossword Grid</h1>
        <p style={{ color: '#666' }}>Sample Grid Layout (sprint 1)</p>
      </header>
      <main>
          <Grid />
	  <button type="button">Hint1</button>
	  <button type="button">Hint2</button>
	  <button type="button">Hint3</button>
      </main>
    </div>
  )
}

export default App
