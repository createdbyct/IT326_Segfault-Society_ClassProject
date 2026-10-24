// A fake backend that answers the same endpoints as src/api/index.js, so the whole site works
// before the real backend exists. Data is generated from ./seed.js and saved in localStorage
// (clear the "rmc.mockdb" key, or call window.rmcResetMock(), to start over).
import { CLASSES, TAGS, TERMS, YEARS, LINES, SCHOOL, DEMO_USER, DEMO_FAVORITES, DEMO_TO_SCORE } from './seed.js';
import { ApiError } from '../client.js';

const STORE_KEY = 'rmc.mockdb';
const VERSION = 3;
const MIN_SCORES = 5;
const MIN_RANKED = 20;
const LATENCY = 180;

// ---------- deterministic generator ----------
function rng(seed) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const slug = (code) => code.toLowerCase().replace(/\s+/g, '-');

/** n integers in 1..5 whose sum is round(target * total) - fixedSum, spread out a little. */
function spread(n, target, total, fixedSum, rand) {
  if (n <= 0) return [];
  let want = Math.round(target * total) - fixedSum;
  want = Math.max(n, Math.min(5 * n, want));
  const base = Math.floor(want / n);
  const vals = Array.from({ length: n }, (_, i) => base + (i < want - base * n ? 1 : 0));
  for (let k = 0; k < n * 2; k++) {
    const a = Math.floor(rand() * n), b = Math.floor(rand() * n);
    if (a !== b && vals[a] < 5 && vals[b] > 1) { vals[a]++; vals[b]--; }
  }
  for (let i = vals.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [vals[i], vals[j]] = [vals[j], vals[i]]; }
  return vals;
}

function pickWeighted(list, rand) {
  const total = list.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of list) { r -= w; if (r <= 0) return v; }
  return list[0][0];
}

function buildDb() {
  const classes = [];
  const reviews = [];
  let rid = 1;
  for (const [code, title, department, credits, t, instructors, tagW, extra = {}] of CLASSES) {
    const id = slug(code);
    const rand = rng(code);
    classes.push({ id, code, title, department, credits, prereqs: extra.prereqs || [], terms: extra.terms || ['Fall', 'Spring'], sections: extra.sections || 1,
      hoursPerWeek: extra.hoursPerWeek ?? null, description: extra.description || '', quote: extra.quote || null, highlight: extra.highlight || null, tip: extra.tip || null,
      instructorList: instructors.map(([n]) => n), createdAt: '2024-08-01', status: 'approved' });
    const featured = extra.featured || [];
    const n = Math.max(t.n - featured.length, 0);
    const fx = (k) => featured.reduce((s, f) => s + (f[k] ?? Math.round(t[k] ?? t.score)), 0);
    const scores = spread(n, t.score, t.n, featured.reduce((s, f) => s + f.score, 0), rand);
    const work = spread(n, t.workload, t.n, fx('workload'), rand);
    const diff = spread(n, t.difficulty, t.n, fx('difficulty'), rand);
    const lect = spread(n, t.lecture, t.n, fx('lecture'), rand);
    const yesCount = Math.round((t.retake / 100) * t.n) - featured.filter((f) => (f.retake || (f.score >= 4 ? 'Yes' : 'Maybe')) === 'Yes').length;
    featured.forEach((f, i) => reviews.push({
      id: `r${rid++}`, classId: id, score: f.score, workload: f.workload ?? Math.round(t.workload), difficulty: f.difficulty ?? Math.round(t.difficulty),
      lecture: f.lecture ?? Math.round(t.lecture), retake: f.retake || (f.score >= 4 ? 'Yes' : 'Maybe'), text: f.text, highlight: f.highlight || '', tags: f.tags || [],
      instructor: f.instructor, term: f.term, year: f.year, grade: '', helpful: f.helpful || 0, helpfulBy: [], authorId: f.mine ? DEMO_USER.id : `anon${i}`,
      createdAt: termDate(f.term, 3 + i),
    }));
    for (let i = 0; i < n; i++) {
      const s = scores[i];
      const pool = s >= 4 ? LINES.high : s === 3 ? LINES.mid : LINES.low;
      const a = pool[Math.floor(rand() * pool.length)];
      let b = pool[Math.floor(rand() * pool.length)];
      if (b === a) b = '';
      const tags = Object.entries(tagW).filter(([, w]) => rand() < w * 0.8).map(([l]) => l).slice(0, 3);
      const term = TERMS[Math.floor(rand() * TERMS.length)];
      reviews.push({
        id: `r${rid++}`, classId: id, score: s, workload: work[i], difficulty: diff[i], lecture: lect[i],
        retake: i < yesCount ? 'Yes' : rand() < 0.5 ? 'Maybe' : 'No', text: [a, b].filter(Boolean).join(' '), highlight: '', tags,
        instructor: pickWeighted(instructors, rand), term, year: YEARS[Math.floor(rand() * YEARS.length)], grade: '', helpful: Math.floor(rand() * 9), helpfulBy: [],
        authorId: `anon-${id}-${i}`, createdAt: termDate(term, Math.floor(rand() * 60)),
      });
    }
  }
  const users = [{ ...DEMO_USER, password: 'password' }];
  return {
    version: VERSION, classes, reviews, users, reports: [],
    sessionUserId: DEMO_USER.id,
    favorites: { [DEMO_USER.id]: DEMO_FAVORITES.map(([classId, savedAt]) => ({ classId, savedAt })) },
    toScore: { [DEMO_USER.id]: DEMO_TO_SCORE },
    nextId: rid,
  };
}

function termDate(term, dayOffset) {
  const [season, year] = term.split(' ');
  const d = new Date(Date.UTC(Number(year), season === 'Fall' ? 11 : 4, 1 + (dayOffset % 25)));
  return d.toISOString();
}

// ---------- persistence ----------
let db;
function load() {
  if (db) return db;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.version === VERSION) db = parsed;
  } catch { /* storage blocked or corrupt */ }
  if (!db) { db = buildDb(); save(); }
  return db;
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch { /* storage full or blocked: keep in memory */ } }
if (typeof window !== 'undefined') window.rmcResetMock = () => { try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ } db = null; location.reload(); };

// ---------- aggregates ----------
const avg = (arr, k) => (arr.length ? arr.reduce((s, r) => s + r[k], 0) / arr.length : null);
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

function summarize(c, userId) {
  const rs = db.reviews.filter((r) => r.classId === c.id);
  const enough = rs.length >= MIN_SCORES;
  const byInstructor = {};
  rs.forEach((r) => { byInstructor[r.instructor] = (byInstructor[r.instructor] || 0) + 1; });
  const topInstructor = Object.entries(byInstructor).sort((a, b) => b[1] - a[1])[0]?.[0] || c.instructorList[0] || '';
  const best = [...rs].sort((a, b) => b.helpful - a.helpful)[0];
  return {
    id: c.id, code: c.code, title: c.title, department: c.department, credits: c.credits,
    score: enough ? round1(avg(rs, 'score')) : null,
    reviewCount: rs.length,
    workload: enough ? round1(avg(rs, 'workload')) : null,
    difficulty: enough ? round1(avg(rs, 'difficulty')) : null,
    lecture: enough ? round1(avg(rs, 'lecture')) : null,
    retakePct: enough ? Math.round((rs.filter((r) => r.retake === 'Yes').length / rs.length) * 100) : null,
    topInstructor,
    hoursPerWeek: c.hoursPerWeek ?? null,
    quote: c.quote || (best ? best.text.split(/(?<=\.)\s/)[0] : null),
    highlight: c.quote ? c.highlight : null,
    isFavorite: !!userId && (db.favorites[userId] || []).some((f) => f.classId === c.id),
  };
}

function tagCounts(rs) {
  const counts = {};
  rs.forEach((r) => r.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
}

function detail(c, userId) {
  const rs = db.reviews.filter((r) => r.classId === c.id);
  const instructors = c.instructorList.map((name) => {
    const ir = rs.filter((r) => r.instructor === name);
    return { name, reviewCount: ir.length, score: ir.length >= MIN_SCORES ? round1(avg(ir, 'score')) : null };
  }).sort((a, b) => b.reviewCount - a.reviewCount);
  const reviewTerms = [...new Set(rs.map((r) => r.term))].sort((a, b) => termKey(b) - termKey(a));
  return { ...summarize(c, userId), prereqs: c.prereqs, terms: c.terms, sections: c.sections, hoursPerWeek: c.hoursPerWeek, description: c.description,
    instructors, tags: tagCounts(rs), reviewTerms, myReviewId: (userId && rs.find((r) => r.authorId === userId)?.id) || null };
}
const termKey = (t) => { const [s, y] = t.split(' '); return Number(y) * 10 + (s === 'Fall' ? 2 : 1); };

function publicReview(r, userId) {
  const author = db.users.find((u) => u.id === r.authorId);
  const c = db.classes.find((x) => x.id === r.classId);
  return {
    id: r.id, classId: r.classId, classCode: c?.code, classTitle: c?.title, score: r.score, workload: r.workload, difficulty: r.difficulty, lecture: r.lecture,
    retake: r.retake, text: r.text, highlight: r.highlight, tags: r.tags, instructor: r.instructor, term: r.term,
    year: author && !author.prefs.showYear ? undefined : r.year, grade: r.authorId === userId ? r.grade : undefined,
    helpful: r.helpful, helpfulByMe: !!userId && r.helpfulBy.includes(userId), mine: !!userId && r.authorId === userId, createdAt: r.createdAt,
  };
}

function publicUser(u) {
  const { password, classesAdded = 0, ...rest } = u;
  const mine = db.reviews.filter((r) => r.authorId === u.id);
  return { ...rest, stats: { reviews: mine.length, helpful: mine.reduce((s, r) => s + r.helpful, 0), favorites: (db.favorites[u.id] || []).length, classesAdded } };
}

// ---------- routing ----------
const routes = [];
const on = (method, pattern, fn) => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ method, re, keys, fn });
};

export async function handle(method, path, query, body) {
  load();
  await new Promise((r) => setTimeout(r, LATENCY));
  const clean = path.split('?')[0];
  for (const route of routes) {
    if (route.method !== method) continue;
    const m = clean.match(route.re);
    if (!m) continue;
    const params = {};
    route.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
    const out = route.fn({ params, query, body: body || {}, userId: db.sessionUserId });
    return out === undefined ? null : JSON.parse(JSON.stringify(out));
  }
  throw new ApiError(404, `Mock server has no route for ${method} ${clean}`);
}

const requireUser = (userId) => {
  const u = db.users.find((x) => x.id === userId);
  if (!u) throw new ApiError(401, 'Please sign in first.');
  return u;
};
const findClass = (id) => {
  const c = db.classes.find((x) => x.id === id);
  if (!c) throw new ApiError(404, 'We could not find that class.');
  return c;
};
const fieldError = (field, message) => new ApiError(422, message, { field, message });

// Classes
on('GET', '/classes', ({ query, userId }) => {
  const q = (query.q || '').trim().toLowerCase();
  const tags = query.tags ? String(query.tags).split(',').filter(Boolean) : [];
  let list = db.classes.filter((c) => c.status === 'approved' || c.status === 'pending');
  if (q) list = list.filter((c) => `${c.code} ${c.code.replace(' ', '')} ${c.title}`.toLowerCase().includes(q) || q.split(/\s+/).every((w) => `${c.code} ${c.title}`.toLowerCase().includes(w)));
  if (query.department) list = list.filter((c) => c.department === query.department);
  if (query.instructor) { const iq = String(query.instructor).toLowerCase(); list = list.filter((c) => c.instructorList.some((n) => n.toLowerCase().includes(iq))); }
  const matched = list;
  let items = list.map((c) => summarize(c, userId));
  if (query.minScore) items = items.filter((c) => c.score != null && c.score >= Number(query.minScore));
  if (query.maxWorkload) items = items.filter((c) => c.workload == null || c.workload <= Number(query.maxWorkload));
  if (tags.length) items = items.filter((c) => { const tc = tagCounts(db.reviews.filter((r) => r.classId === c.id)); return tags.every((t) => tc.some((x) => x.label === t && x.count >= 2)); });
  const sort = query.sort || 'score';
  items.sort((a, b) => sort === 'reviews' ? b.reviewCount - a.reviewCount
    : sort === 'workload' ? (a.workload ?? 9) - (b.workload ?? 9)
    : (b.score ?? -1) - (a.score ?? -1) || b.reviewCount - a.reviewCount);
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Number(query.pageSize) || 10);
  const ids = new Set(matched.map((c) => c.id));
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize,
    tagCounts: tagCounts(db.reviews.filter((r) => ids.has(r.classId))).slice(0, 8) };
});

on('GET', '/classes/similar', ({ query, userId }) => {
  const code = String(query.code || '').toUpperCase().trim();
  const [prefix, num] = code.split(/\s+/);
  if (!prefix) return [];
  return db.classes.filter((c) => {
    const [p, n] = c.code.split(' ');
    return c.code === code || (num && Math.abs(Number(n) - Number(num)) <= 2 && (p === prefix || ['CS', 'IT'].includes(p) === ['CS', 'IT'].includes(prefix)));
  }).slice(0, 4).map((c) => summarize(c, userId));
});

on('GET', '/classes/:id', ({ params, userId }) => detail(findClass(params.id), userId));

on('GET', '/classes/:id/reviews', ({ params, query, userId }) => {
  findClass(params.id);
  let rs = db.reviews.filter((r) => r.classId === params.id);
  if (query.instructor) rs = rs.filter((r) => r.instructor === query.instructor);
  if (query.term) rs = rs.filter((r) => r.term === query.term);
  const sort = query.sort || 'helpful';
  rs.sort((a, b) => sort === 'newest' ? b.createdAt.localeCompare(a.createdAt) : sort === 'lowest' ? a.score - b.score || b.helpful - a.helpful : b.helpful - a.helpful);
  const offset = Number(query.offset) || 0;
  const limit = Math.min(50, Number(query.limit) || 5);
  return { items: rs.slice(offset, offset + limit).map((r) => publicReview(r, userId)), total: rs.length };
});

on('POST', '/classes', ({ body, userId }) => {
  const u = requireUser(userId);
  const prefix = String(body.prefix || '').trim().toUpperCase();
  const number = String(body.number || '').trim();
  if (!prefix) throw fieldError('prefix', 'Add the course prefix, like CS.');
  if (!/^\d{2,4}[A-Z]?$/i.test(number)) throw fieldError('number', 'Use the course number from the catalog, like 351.');
  if (!String(body.title || '').trim()) throw fieldError('title', 'Add the course title.');
  const code = `${prefix} ${number}`;
  if (db.classes.some((c) => c.code === code)) throw fieldError('number', `${code} is already on Rate My Classes.`);
  const c = { id: slug(code), code, title: body.title.trim(), department: body.department, credits: Number(body.credits) || 3, prereqs: body.prereqs || [],
    terms: body.terms || [], sections: 1, hoursPerWeek: null, description: body.description || '', quote: null, highlight: null, tip: null,
    instructorList: body.instructors || [], createdAt: new Date().toISOString(), status: 'pending', addedBy: u.id };
  db.classes.push(c);
  u.classesAdded = (u.classesAdded || 0) + 1;
  save();
  return detail(c, userId);
});

// Rankings
function ranked(dir, { query, userId }) {
  let list = db.classes.map((c) => summarize(c, userId)).filter((c) => c.reviewCount >= MIN_RANKED && c.score != null);
  if (query.department) list = list.filter((c) => c.department === query.department);
  list.sort((a, b) => (dir === 'top' ? b.score - a.score : a.score - b.score) || b.reviewCount - a.reviewCount);
  return list.slice(0, Number(query.limit) || 10).map((c, i) => ({ ...c, rank: i + 1, tip: db.classes.find((x) => x.id === c.id).tip }));
}
on('GET', '/rankings/top', (ctx) => ranked('top', ctx));
on('GET', '/rankings/bottom', (ctx) => ranked('bottom', ctx));

// Meta
on('GET', '/departments', () => [...new Set(db.classes.map((c) => c.department))].sort());
on('GET', '/tags', () => TAGS);
on('GET', '/stats', () => ({
  classes: db.classes.length,
  reviews: db.reviews.length,
  departments: new Set(db.classes.map((c) => c.department)).size,
  reviewsThisTerm: db.reviews.filter((r) => r.term === 'Fall 2026').length,
}));
on('GET', '/reviews/recent', ({ query, userId }) => [...db.reviews]
  .filter((r) => r.text.length > 60)
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.helpful - a.helpful)
  .slice(0, Math.min(12, Number(query.limit) || 3)).map((r) => publicReview(r, userId)));
routes.unshift(routes.pop()); // keep /reviews/recent ahead of /reviews/:id

// Reviews
function validateReview(b) {
  if (!(b.score >= 1 && b.score <= 5)) throw fieldError('score', 'Pick a score from 1 to 5.');
  ['workload', 'difficulty', 'lecture'].forEach((k) => { if (!(b[k] >= 1 && b[k] <= 5)) throw fieldError(k, `Set the ${k} meter.`); });
  if (!b.instructor) throw fieldError('instructor', 'Pick the instructor you had.');
  if (!b.term) throw fieldError('term', 'Pick the term you took it.');
  if (String(b.text || '').trim().length < 20) throw fieldError('text', 'Write at least a sentence or two (20+ characters).');
  if (String(b.text).length > 1000) throw fieldError('text', 'Keep it under 1,000 characters.');
  if (b.highlight && !String(b.text).includes(b.highlight)) throw fieldError('highlight', 'The highlight has to be a phrase from your review.');
  if ((b.tags || []).length > 5) throw fieldError('tags', 'Pick up to 5.');
}
on('GET', '/reviews/:id', ({ params, userId }) => {
  const r = db.reviews.find((x) => x.id === params.id);
  if (!r) throw new ApiError(404, 'Review not found.');
  return publicReview(r, userId);
});
on('POST', '/classes/:id/reviews', ({ params, body, userId }) => {
  const u = requireUser(userId);
  findClass(params.id);
  if (db.reviews.some((r) => r.classId === params.id && r.authorId === u.id)) throw new ApiError(409, 'You already scored this class. Edit your review from your account page.');
  validateReview(body);
  const r = { id: `r${db.nextId++}`, classId: params.id, score: body.score, workload: body.workload, difficulty: body.difficulty, lecture: body.lecture,
    retake: body.retake || 'Maybe', text: body.text.trim(), highlight: body.highlight || '', tags: body.tags || [], instructor: body.instructor, term: body.term,
    year: yearFromClass(u.classYear), grade: body.grade || '', helpful: 0, helpfulBy: [], authorId: u.id, createdAt: new Date().toISOString() };
  db.reviews.push(r);
  db.toScore[u.id] = (db.toScore[u.id] || []).filter((id) => id !== params.id);
  save();
  return publicReview(r, userId);
});
on('PATCH', '/reviews/:id', ({ params, body, userId }) => {
  requireUser(userId);
  const r = db.reviews.find((x) => x.id === params.id && x.authorId === userId);
  if (!r) throw new ApiError(404, 'Review not found.');
  const next = { ...r, ...body };
  validateReview(next);
  Object.assign(r, { score: next.score, workload: next.workload, difficulty: next.difficulty, lecture: next.lecture, retake: next.retake, text: next.text.trim(),
    highlight: next.highlight || '', tags: next.tags || [], instructor: next.instructor, term: next.term, grade: next.grade || '' });
  save();
  return publicReview(r, userId);
});
on('DELETE', '/reviews/:id', ({ params, userId }) => {
  requireUser(userId);
  const i = db.reviews.findIndex((x) => x.id === params.id && x.authorId === userId);
  if (i < 0) throw new ApiError(404, 'Review not found.');
  db.reviews.splice(i, 1);
  save();
});
on('POST', '/reviews/:id/helpful', ({ params, userId }) => {
  requireUser(userId);
  const r = db.reviews.find((x) => x.id === params.id);
  if (!r) throw new ApiError(404, 'Review not found.');
  if (r.helpfulBy.includes(userId)) { r.helpfulBy = r.helpfulBy.filter((x) => x !== userId); r.helpful--; } else { r.helpfulBy.push(userId); r.helpful++; }
  save();
  return { helpful: r.helpful, helpfulByMe: r.helpfulBy.includes(userId) };
});
on('POST', '/reviews/:id/report', ({ params, body }) => { db.reports.push({ reviewId: params.id, reason: body.reason || '' }); save(); });

function yearFromClass(classYear) {
  const left = Number(classYear) - 2026;
  return ['Senior', 'Senior', 'Junior', 'Sophomore', 'Freshman'][Math.max(0, Math.min(4, left))];
}

// Auth
on('POST', '/auth/signup', ({ body }) => {
  const email = String(body.email || '').trim().toLowerCase();
  if (!String(body.displayName || '').trim()) throw fieldError('displayName', 'Pick a display name.');
  if (!/^[^@\s]+@[^@\s]+\.edu$/.test(email)) throw fieldError('email', 'Use your school email (it must end in .edu).');
  if (String(body.password || '').length < 10) throw fieldError('password', 'Use at least 10 characters.');
  if (db.users.some((u) => u.email === email)) throw fieldError('email', 'That email already has an account. Sign in instead.');
  const u = { id: `u${db.nextId++}`, displayName: body.displayName.trim(), email, verified: false, school: body.school || SCHOOL, major: body.major || '',
    classYear: body.classYear || '2028', memberSince: new Date().toISOString(), prefs: { notifyFavorites: true, notifyRemind: true, notifyHelpful: false, showYear: true },
    classesAdded: 0, password: body.password };
  db.users.push(u);
  db.sessionUserId = u.id;
  save();
  return { user: publicUser(u) };
});
on('POST', '/auth/signin', ({ body }) => {
  const email = String(body.email || '').trim().toLowerCase();
  const u = db.users.find((x) => x.email === email);
  // Demo: any password works for the sample account.
  if (!u || (u.id !== DEMO_USER.id && u.password !== body.password)) throw new ApiError(401, 'That email and password do not match.');
  db.sessionUserId = u.id;
  save();
  return { user: publicUser(u) };
});
on('POST', '/auth/signout', () => { db.sessionUserId = null; save(); });
on('GET', '/me', ({ userId }) => publicUser(requireUser(userId)));

// Me
on('PATCH', '/me', ({ body, userId }) => {
  const u = requireUser(userId);
  if (body.displayName !== undefined && !String(body.displayName).trim()) throw fieldError('displayName', 'Display name cannot be empty.');
  ['displayName', 'major', 'classYear'].forEach((k) => { if (body[k] !== undefined) u[k] = String(body[k]).trim(); });
  if (body.prefs) u.prefs = { ...u.prefs, ...body.prefs };
  save();
  return publicUser(u);
});
on('POST', '/me/password', ({ body, userId }) => {
  const u = requireUser(userId);
  if (!body.current) throw fieldError('current', 'Enter your current password.');
  if (u.id !== DEMO_USER.id && body.current !== u.password) throw fieldError('current', 'That is not your current password.');
  if (String(body.next || '').length < 10) throw fieldError('next', 'Use at least 10 characters.');
  u.password = body.next;
  save();
});
on('DELETE', '/me', ({ userId }) => {
  requireUser(userId);
  db.users = db.users.filter((u) => u.id !== userId);
  db.reviews.forEach((r) => { if (r.authorId === userId) r.authorId = 'deleted'; });
  delete db.favorites[userId];
  db.sessionUserId = null;
  save();
});
on('GET', '/me/export', ({ userId }) => {
  const u = requireUser(userId);
  return { user: publicUser(u), reviews: db.reviews.filter((r) => r.authorId === userId).map((r) => publicReview(r, userId)), favorites: db.favorites[userId] || [] };
});
on('GET', '/me/reviews', ({ userId }) => {
  requireUser(userId);
  return db.reviews.filter((r) => r.authorId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((r) => publicReview(r, userId));
});
on('GET', '/me/to-score', ({ userId }) => {
  requireUser(userId);
  return (db.toScore[userId] || []).map((id) => db.classes.find((c) => c.id === id)).filter(Boolean).map((c) => summarize(c, userId));
});
on('GET', '/me/favorites', ({ userId }) => {
  requireUser(userId);
  return (db.favorites[userId] || []).map((f) => { const c = db.classes.find((x) => x.id === f.classId); return c ? { ...summarize(c, userId), savedAt: f.savedAt } : null; }).filter(Boolean);
});
on('PUT', '/me/favorites/:classId', ({ params, userId }) => {
  requireUser(userId);
  const c = findClass(params.classId);
  const list = db.favorites[userId] = db.favorites[userId] || [];
  if (!list.some((f) => f.classId === c.id)) list.unshift({ classId: c.id, savedAt: new Date().toISOString() });
  save();
  return { ...summarize(c, userId), savedAt: list.find((f) => f.classId === c.id).savedAt };
});
on('DELETE', '/me/favorites/:classId', ({ params, userId }) => {
  requireUser(userId);
  db.favorites[userId] = (db.favorites[userId] || []).filter((f) => f.classId !== params.classId);
  save();
});
