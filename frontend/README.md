# WordNest Crossword frontend

From the `frontend` directory, install dependencies and start Vite.

```sh
npm ci
npm run dev
```

Local development uses the deployed Render backend by default. To point it at
another backend, create `frontend/.env.local` and restart Vite.

```dotenv
VITE_API_URL=https://crossword-project-backend-9q0w.onrender.com
```

Netlify builds use same-origin `/api` requests by default. Vite copies
`public/_redirects` into `dist`, and Netlify forwards puzzle and word requests
to Render. Leave `VITE_API_URL` unset on Netlify, or set it to `/api`, and
redeploy after changing it. `npm run preview` also forwards `/api` to Render.

For a different deployment setup, set `VITE_API_URL` at build time to the API
base URL. If it is on a different origin, the backend must allow the frontend's
origin for GET and POST requests.

Choose a difficulty and puzzle to start playing. Filled entries are checked
automatically. Correct nested words turn green, and correct full entries turn
blue. Confirmed letters are locked. The **Actions** dropdown shows disabled
placeholders.

Run `npm test`, `npm run lint`, and `npm run build` to verify the frontend.
