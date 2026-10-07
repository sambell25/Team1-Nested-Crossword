# Nested-Clue Crossword Generator & Solver

CMSC 447 team project for creating and solving crossword puzzles with nested clues.

## Frontend Setup

```sh
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. Press Ctrl+C to stop the development server.

## Production Build

```sh
cd frontend
npm run build
```

## Frontend Tests and CI

```sh
cd frontend
npm test
npm run test:coverage
npm run lint
npm run build
```

GitHub Actions runs frontend lint, unit tests with coverage, and the production build for frontend changes. See [the Team C testing guide](frontend/TESTING.md) for watch mode, coverage reports, and planned crossword UI tests.
