# Rate My Classes — web app (Vite + React)

A home page plus all ten pages in the Cutting Mat design: search, class page, top 10, bottom 10, write a review, add a class, sign up (plus sign in), account, edit account and favorites.

The app runs on built-in sample data until you point it at your backend. Only one file talks to the server.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
```

Node 18 or newer.

## Connect your backend

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_USE_MOCK=false`.
3. Set `VITE_API_URL` to your API base: `/api` if it's on the same domain, or a full URL like `https://api.example.com`.
4. Optional, for local development: set `VITE_DEV_PROXY=http://localhost:8000`. `npm run dev` then forwards `/api` to your server, so you avoid CORS.

The pieces:

- **`src/api/client.js`** is the only file that calls `fetch`. It sends JSON with `credentials: 'include'`, so cookie sessions work. If sign-in returns a `token`, it also sends `Authorization: Bearer <token>`.
- **`src/api/index.js`** lists every endpoint the pages call.
- **`src/api/types.js`** documents the JSON each endpoint should return.
- **Errors:** return `{ "message": "...", "field": "email" }` with a 4xx status, and the form shows the message under that field.

### Endpoints

| Method | Path | Used by |
|---|---|---|
| GET | `/stats` · `/reviews/recent?limit` | Home page |
| GET | `/classes?q&instructor&department&minScore&maxWorkload&tags&sort&page&pageSize` | Search |
| GET | `/classes/similar?code` | Add class ("Is it already here?") |
| GET | `/classes/:id` | Class page |
| GET | `/classes/:id/reviews?instructor&term&sort&offset&limit` | Class page |
| POST | `/classes` | Add class |
| GET | `/rankings/top?department&limit` · `/rankings/bottom?…` | Top 10 / Bottom 10 |
| GET | `/departments` · `/tags` | Filters, review form |
| GET · PATCH · DELETE | `/reviews/:id` | Edit / delete your review |
| POST | `/classes/:id/reviews` | Write review |
| POST | `/reviews/:id/helpful` · `/reviews/:id/report` | Review cards |
| POST | `/auth/signup` · `/auth/signin` · `/auth/signout` | Sign up / in / out |
| GET · PATCH · DELETE | `/me` | Account, edit account |
| POST | `/me/password` | Edit account |
| GET | `/me/export` · `/me/reviews` · `/me/to-score` · `/me/favorites` | Account, favorites |
| PUT · DELETE | `/me/favorites/:classId` | Bookmark buttons |

Scoring rules the UI expects:

- Scores are 0–5 with one decimal.
- A class with fewer than 5 scores returns `score: null`, and the page shows "Not enough scores yet".
- The top and bottom 10 only include classes with 20 or more scores.

`src/api/mock/server.js` is a working reference for every endpoint, including validation and how averages are computed.

> Your earlier FastAPI backend (`rate-my-classes/backend`) uses different paths (`/api/courses/...`) and letter grades. Either rename its routes to match the table, or map them inside `src/api/index.js`.

## Home page hero

There are four heroes in `src/components/heroes/`. The site uses the question hero by default. Change `HERO_DEFAULT` in `src/components/heroes/index.js` to switch, or preview any of them by adding a parameter to the home page URL:

- `/?hero=ruler`: the giant draggable ruler
- `/?hero=board`: a split-flap departures board
- `/?hero=question`: a big question with review lines scrolling past
- `/?hero=deck`: swipe class cards to save or skip

## About page

- **About page:** team names, roles and links live in `src/content/about.js`. Edit them there; the page code doesn't need to change.

## Sample data

- Mock mode saves changes in your browser's localStorage.
- To start over, run `rmcResetMock()` in the browser console.
- The sample account is `ctaylor@midstate.edu`, and any password works.
- The yellow "SAMPLE DATA" strip at the top disappears once `VITE_USE_MOCK=false`.

## Deploy

This is a single-page app, so the host must serve `index.html` for every route.

- **Vercel:** works as is (`vercel.json` is included). Build command `npm run build`, output folder `dist`.
- **Netlify / Cloudflare Pages:** `public/_redirects` handles routing. Same build settings.
- **Nginx (e.g. on a Pi):** copy `dist/` over and add `try_files $uri /index.html;` to the location block.
- **Sub-path:** to serve from something like `/rmc/`, add `base: '/rmc/'` to `vite.config.js`.

Set the `VITE_*` variables in your host's dashboard. They're read at build time.

## Where things are

```
src/
  api/            client.js (fetch), index.js (endpoints), types.js (shapes), mock/ (sample backend)
  components/rmc/ design-system components: Button, ScoreRuler, TickMeter, Tag, StatRow, CourseCard, ReviewCard
  components/     Layout (header/footer), States (loading/empty/error), FavoriteButton
  pages/          one file per page (Home.jsx = hero ruler, semester weigh-in, roulette)
  styles/         tokens.css (colours, type), components.css (design system), app.css (page layout)
  auth/           signed-in user + route guard
```

**Brand rules:**

- Text on the green mat sits on a panel or inside `.rmc-fade`.
- Blade Orange (`--blade`) is only for the score marker, never for text.
- Use `--blade-text` for warnings.
