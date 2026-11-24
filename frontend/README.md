# WordNest Crossword frontend

From the `frontend` directory, install dependencies and start Vite.

```sh
npm ci
npm run dev
```

The frontend uses the deployed Render backend by default. To point it at another
backend, create `frontend/.env.local` and restart Vite.

```dotenv
VITE_API_URL=https://crossword-project-backend-9q0w.onrender.com
```

Set the same variable in the frontend build environment when deploying against a
different backend. The backend must allow the frontend's origin for cross-origin
GET and POST requests.

Choose a difficulty and puzzle to start playing. Filled entries are checked
automatically. Correct nested words turn green, and correct full entries turn
blue. Confirmed letters are locked. The **Actions** dropdown shows disabled
placeholders.

Run `npm test`, `npm run lint`, and `npm run build` to verify the frontend.
