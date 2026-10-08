# Segfault Society IT326 Class Project

## Brief Description of Project

This is the code repository for the IT326 class project building a web application called **Rate My Classes**.

This application is for users to be able to rate and review university-offered classes.

## Project Members

- Brij Kamleshbhai Patel (Grad Student)
- Christian Taylor
- Hayden Pyles
- Karsten Tisdale
- Sam Mate (Project Manager) (Grad Student)

---

## Tech stack

FastAPI + SQLModel backend, PostgreSQL on Neon (cloud), React + Vite frontend.

## Prerequisites (install once)

| Tool | Version | Get it |
|---|---|---|
| Python | **3.14** | macOS: `brew install python@3.14` · Windows: [python.org](https://www.python.org/downloads/) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Git | any | [git-scm.com](https://git-scm.com) |

## First-time setup

```bash
git clone https://github.com/createdbyct/IT326_Segfault-Society_ClassProject.git
cd IT326_Segfault-Society_ClassProject
```

**macOS / Linux**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows (PowerShell)**
```powershell
.\setup.ps1
```
If PowerShell blocks the script, run this once first:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### Database connection (required)

The first setup run creates `backend/.env` from `backend/.env.example`. Open `backend/.env` and paste in the real `DATABASE_URL` and `DATABASE_URL_POOLED` (Get the database url from NEON), then run setup once more to create the tables.

`.env` holds the database password. **Never commit it**; it's already in `.gitignore`.

## Running the app

| | macOS / Linux | Windows |
|---|---|---|
| Start backend + frontend | `./dev.sh` | `.\dev.ps1` |

Then open:

- **App:** http://localhost:5173
- **API docs (try endpoints here):** http://127.0.0.1:2626/docs

Stop with **Ctrl+C**.

## How the frontend talks to the backend

Frontend code calls the backend through `/api/...`. Vite forwards it and strips the `/api`:

```js
// frontend: calls GET /users on the backend
const res = await fetch('/api/users')
```

Backend routes are written **without** `/api` (e.g. `@app.get("/users")`).

## Project layout

```
backend/
  run.py            starts the API (port 2626)
  init_db.py        creates database tables from the models
  requirements.txt  Python dependencies
  .env.example      template for backend/.env
  src/
    main.py         routes
    database.py     database connection
    models/         SQLModel tables (user.py, ...)
frontend/
  src/              React code
  vite.config.js    dev server + /api proxy
```

## Adding a new table

1. Create the model in `backend/src/models/` (copy `user.py` as a starting point).
2. Import it in `backend/init_db.py`.
3. Run `cd backend && ./venv/bin/python init_db.py` (Windows: `.\venv\Scripts\python.exe init_db.py`).

`init_db.py` only creates tables that don't exist yet. It won't change a table that already exists, so tell the team before editing an existing model's columns.

## Adding dependencies

- **Python:** `cd backend && ./venv/bin/pip install <pkg>`, then add it to `requirements.txt`
  (Windows: `.\venv\Scripts\python.exe -m pip install <pkg>`)
- **Frontend:** `cd frontend && npm install <pkg>` (updates `package.json` automatically)

Commit the updated `requirements.txt` / `package.json` so everyone gets it.

## Troubleshooting

- **`Missing DATABASE_URL`:** `backend/.env` is missing or empty. See *Database connection* above.
- **"bad interpreter" or odd import errors after moving the folder or pulling changes:** re-run the setup script. It rebuilds the venv from scratch.
- **Teammate added a package:** re-run setup.
- **Port already in use:** something from a previous run is still going. Close old terminals or restart.
