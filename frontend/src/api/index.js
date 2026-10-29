// Every endpoint the frontend uses. Implement these on your backend (paths are relative to VITE_API_URL).
// Response shapes are in ./types.js. Scores are 0–5 with one decimal; a class with fewer than
// 5 scores returns `score: null` and the UI shows "Not enough scores yet".
import { get, post, patch, put, del, token } from './client.js';

export const classes = {
  /** GET /classes?q&instructor&department&minScore&maxWorkload&tags&sort&page&pageSize → SearchResult
   *  sort: "score" | "reviews" | "workload"; tags: comma-separated labels */
  search: (params) => get('/classes', params),
  /** GET /classes/:id → ClassDetail */
  get: (id) => get(`/classes/${encodeURIComponent(id)}`),
  /** GET /classes/:id/reviews?instructor&term&sort&offset&limit → { items: Review[], total }
   *  sort: "helpful" | "newest" | "lowest" */
  reviews: (id, params) => get(`/classes/${encodeURIComponent(id)}/reviews`, params),
  /** GET /classes/similar?code=CS+351&title=… → ClassSummary[] (for "Is it already here?") */
  similar: (params) => get('/classes/similar', params),
  /** POST /classes  body: NewClass → ClassDetail */
  create: (body) => post('/classes', body),
};

export const rankings = {
  /** GET /rankings/top?department&limit=10 → RankedClass[] (only classes with ≥ 20 scores) */
  top: (params) => get('/rankings/top', params),
  /** GET /rankings/bottom?department&limit=10 → RankedClass[] (lowest first, ≥ 20 scores) */
  bottom: (params) => get('/rankings/bottom', params),
};

export const meta = {
  /** GET /departments → string[] */
  departments: () => get('/departments'),
  /** GET /stats → { classes, reviews, departments, reviewsThisTerm }  (home page numbers) */
  stats: () => get('/stats'),
  /** GET /tags → string[]  (the checkboxes students can pick on a review) */
  tags: () => get('/tags'),
};

export const reviews = {
  /** GET /reviews/recent?limit=3 → Review[] with classCode/classTitle (home page feed) */
  recent: (params) => get('/reviews/recent', params),
  /** GET /reviews/:id → Review (used to edit your own review) */
  get: (id) => get(`/reviews/${encodeURIComponent(id)}`),
  /** POST /classes/:id/reviews  body: NewReview → Review */
  create: (classId, body) => post(`/classes/${encodeURIComponent(classId)}/reviews`, body),
  /** PATCH /reviews/:id  body: Partial<NewReview> → Review */
  update: (id, body) => patch(`/reviews/${encodeURIComponent(id)}`, body),
  /** DELETE /reviews/:id → 204 */
  remove: (id) => del(`/reviews/${encodeURIComponent(id)}`),
  /** POST /reviews/:id/helpful → { helpful: number, helpfulByMe: boolean }  (toggles) */
  helpful: (id) => post(`/reviews/${encodeURIComponent(id)}/helpful`),
  /** POST /reviews/:id/report  body: { reason } → 204 */
  report: (id, reason) => post(`/reviews/${encodeURIComponent(id)}/report`, { reason }),
};

export const auth = {
  /** POST /auth/signup  body: { displayName, email, password, major, classYear, school } → { user: User, token? } */
  async signUp(body) { const r = await post('/auth/signup', body); if (r?.token) token.set(r.token); return r.user; },
  /** POST /auth/signin  body: { email, password } → { user: User, token? } */
  async signIn(body) { const r = await post('/auth/signin', body); if (r?.token) token.set(r.token); return r.user; },
  /** POST /auth/signout → 204 */
  async signOut() { try { await post('/auth/signout'); } finally { token.set(null); } },
  /** GET /me → User   (401 when signed out) */
  me: () => get('/me'),
};

export const me = {
  /** PATCH /me  body: { displayName, major, classYear, prefs } → User */
  update: (body) => patch('/me', body),
  /** POST /me/password  body: { current, next } → 204 */
  changePassword: (body) => post('/me/password', body),
  /** DELETE /me → 204 */
  remove: () => del('/me'),
  /** GET /me/export → any JSON (offered as a download) */
  exportData: () => get('/me/export'),
  /** GET /me/reviews → Review[] (with classCode/classTitle filled in) */
  reviews: () => get('/me/reviews'),
  /** GET /me/to-score → ClassSummary[] (classes they took but haven't scored; can be empty) */
  toScore: () => get('/me/to-score'),
  /** GET /me/favorites → Favorite[] */
  favorites: () => get('/me/favorites'),
  /** PUT /me/favorites/:classId → Favorite */
  addFavorite: (classId) => put(`/me/favorites/${encodeURIComponent(classId)}`),
  /** DELETE /me/favorites/:classId → 204 */
  removeFavorite: (classId) => del(`/me/favorites/${encodeURIComponent(classId)}`),
};

export { ApiError, USE_MOCK } from './client.js';
