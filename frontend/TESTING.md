# Frontend testing (Team C)

Run commands from `frontend/` with Node.js 22.17.0 or a newer compatible Node.js release:

```sh
npm ci
npm test
npm run test:watch
npm run test:coverage
npm run lint
npm run build
```

Vitest runs React component tests in jsdom. React Testing Library and user-event test the UI through accessible labels, roles, and real user interactions. Tests live beside their components as `*.test.jsx`; pure frontend utilities use `*.test.js`. Shared setup cleans up rendered components and browser storage after each test. Tests should create their own fixtures and mocks; do not call real dictionary or puzzle services.

The current application is the Vite starter. Its two tests verify rendering and state changes through repeated clicks. Replace these starter tests when the crossword UI replaces the starter. Crossword behavior is planned coverage, not implemented or claimed as tested yet.

## Crossword coverage to add as features arrive

| Team C feature | Unit/component test expectations |
| --- | --- |
| Crossword grid and partial fill | Render playable and blocked cells; accept and normalize letters; clear entries; keyboard navigation; reflect an edited intersection in both clues; show partial progress. |
| Clue display and selection | Display across/down primary clues; selecting a clue focuses its cells; selecting a cell chooses the correct answer context. |
| Progressive nested hints | Reveal one eligible hint at a time; associate it with its answer ID and substring range; highlight the correct cells for across/down answers; count each revealed hint once; handle exhausted hints. |
| Solve sessions and history | Restore typed letters and revealed hints; isolate different puzzle/session IDs; handle missing or malformed stored state; show and reopen saved history. |
| Construction and service integration | Submit options to a mocked puzzle service; show loading, empty, success, invalid-puzzle, and error states; allow retry after service failure. |
| Usability | Query by accessible roles/labels; exercise keyboard interactions and focus; expose useful status/error messages. |

## Mock contracts

Agree on the actual contracts with Teams A and B before implementing fixtures. Record coordinate origin, direction values, answer IDs, blocked-cell representation, nested hint offsets (including end-exclusive versus length), hint IDs/order, validation errors, and solve-session fields. Include crossing answers and multiple nested hints in mock puzzles. Exercise the example SCREWDRIVER with SCREW, CREW, and DRIVE in its correct answer context.

Mock the frontend service boundary and assert rendered outcomes and user actions. Team C tests consume puzzle validation results; dictionary algorithms, clue generation, crossword CSP generation, and backend/API implementation tests belong to Teams A/B. Browser end-to-end checks for actual layout and full integration are separate from these jsdom unit tests.

## CI

`.github/workflows/frontend-ci.yml` runs for pushes and pull requests affecting the frontend or this workflow, and supports manual runs. It installs from the lockfile, runs lint, unit tests with V8 coverage, and builds the frontend. Coverage HTML and LCOV reports are uploaded as `frontend-coverage`; locally open `coverage/index.html`. Coverage includes future production source files, not just modules imported by existing tests. No percentage gate is set while the prototype is being established. No backend setup or live external API calls are required.

Vitest uses thread workers for compatibility with the team's Windows development workspace.
