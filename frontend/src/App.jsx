import Grid from './components/Grid'
import HintPanel from './components/HintPanel'
import './App.css'

function App() {
  return (
    <div className="App">
      <header style={{ textAlign: 'center', margin: '20px 0' }}>
        <h1>WordNest Crossword</h1>
      </header>
      <main className="layout">
        <section className="layout-grid"><Grid /></section>
        <aside className="layout-hints"><HintPanel /></aside>
      </main>
    </div>
  )
}
export default App