import React from 'react';
import Grid from './components/Grid';
import './App.css';

function App() {
  return (
    <div className="App">
      <header style={{ textAlign: 'center', margin: '20px 0' }}>
        <h1>Crossword Grid</h1>
        <p style={{ color: '#666' }}>Sample Grid Layout (sprint 1)</p>
      </header>
      <main>
        <Grid />
      </main>
    </div>
  );
}

export default App;