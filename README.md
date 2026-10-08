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

## Tech Stack

**Frontend**
- React 19 with JavaScript (JSX)
- Vite 8 as the dev server and build tool, which also proxies `/api` calls to the backend
- oxlint for linting

**Backend**
- Python 3.14, managed with [uv](https://docs.astral.sh/uv/) (installs Python and all packages from a lockfile)
- FastAPI for the REST API (auto-generated docs at `/docs`)
- SQLModel for database models and queries (built on SQLAlchemy and Pydantic)
- Uvicorn as the server
- python-dotenv to load the database connection from `.env`

**Database**
- PostgreSQL hosted on Neon (cloud), connected through psycopg2
- Each developer works on their own Neon branch, so testing and resets don't affect anyone else
- A GitHub Actions workflow creates a temporary Neon branch for each pull request and deletes it when the PR closes

## Prerequisites (install once)

| Tool | Get it |
|---|---|
| **uv** | macOS: `brew install uv` · Windows: `winget install astral-sh.uv` · [other options](https://docs.astral.sh/uv/getting-started/installation/) |
| Node.js 20+ | [nodejs.org](https://nodejs.org) |
| Git | [git-scm.com](https://git-scm.com) |

You don't need to install Python yourself. uv downloads Python 3.14 automatically.

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

Setup asks you to paste your Neon `DATABASE_URL`. Get it from the Neon console: open the project, click **Connect**, and copy the connection string for your branch. Setup saves it to `backend/.env` and creates the tables. Press Enter to skip if you don't have it yet, and re-run setup later.

To change it later: `./setup.sh --reset-db` (Windows: `.\setup.ps1 --reset-db`).

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
  pyproject.toml    Python dependencies (edit with `uv add`, not by hand)
  uv.lock           exact package versions everyone installs (commit this)
  .python-version   Python version uv uses (3.14)
  run.py            starts the API (port 2626)
  init_db.py        creates database tables from the models
  reset_db.py       drops and recreates all tables
  .env.example      template for backend/.env
  src/
    main.py         routes
    database.py     database connection
    models/         SQLModel tables (user.py, ...)
frontend/
  src/              React code
  vite.config.js    dev server + /api proxy
```

## Backend commands

Run these from `backend/`. `uv run` uses the project's Python and packages automatically, with no venv to activate:

| Task | Command |
|---|---|
| Start the API only | `uv run python run.py` |
| Create missing tables | `uv run python init_db.py` |
| Drop + recreate all tables (deletes data on your branch) | `uv run python reset_db.py` |
| Add a package | `uv add <package>` |
| Remove a package | `uv remove <package>` |
| Install after pulling changes | `uv sync` |

`uv add` updates `pyproject.toml` and `uv.lock`. Commit both so everyone gets the same versions.

## Adding a new table

1. Create the model in `backend/src/models/` (copy `user.py` as a starting point).
2. Import it in `backend/init_db.py` and `backend/reset_db.py`.
3. Run `uv run python init_db.py` from `backend/`.

`init_db.py` only creates tables that don't exist yet. To change an existing table's columns, use `reset_db.py` on your own Neon branch.

## Frontend packages

`cd frontend && npm install <package>` (updates `package.json` automatically). Commit `package.json` and `package-lock.json`.

## Troubleshooting

- **`uv: command not found`:** install uv (see Prerequisites), then open a new terminal.
- **`Missing DATABASE_URL`:** `backend/.env` is missing or empty. Run `./setup.sh --reset-db`.
- **A teammate added a package:** run `uv sync` in `backend/` (or just `./dev.sh`, since `uv run` syncs automatically).
- **Something's broken after moving the folder:** delete `backend/.venv` and re-run setup.
- **Port already in use:** something from a previous run is still going. Close old terminals or restart.
