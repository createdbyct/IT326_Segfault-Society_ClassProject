// The single place the app talks to a server.
//
//   VITE_USE_MOCK=true  → every request is answered by src/api/mock/server.js (sample data, saved in localStorage)
//   VITE_USE_MOCK=false → requests go to `${VITE_API_URL}${path}` with fetch()
//
// Your backend only needs to implement the endpoints listed in src/api/index.js and return the
// shapes documented in src/api/types.js. Nothing else in the app knows where data comes from.

export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

const TOKEN_KEY = 'rmc.token';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message || `Request failed (${status})`);
    this.status = status;
    this.details = details; // e.g. { field: 'email', ... } for form errors
  }
}

/** Auth token (if your backend uses bearer tokens). Cookie sessions work too: requests send credentials. */
export const token = {
  get() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ } },
};

function buildQuery(query) {
  if (!query) return '';
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return;
    qs.set(k, Array.isArray(v) ? v.join(',') : String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

let mockServer;
async function viaMock(method, path, query, body) {
  if (!mockServer) mockServer = await import('./mock/server.js');
  return mockServer.handle(method, path, query || {}, body);
}

export async function request(method, path, { query, body } = {}) {
  if (USE_MOCK) return viaMock(method, path, query, body);

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const t = token.get();
  if (t) headers.Authorization = `Bearer ${t}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}${buildQuery(query)}`, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.message || data.detail || data.error)) || res.statusText;
    throw new ApiError(res.status, typeof msg === 'string' ? msg : 'Something went wrong.', data);
  }
  return data;
}

export const get = (path, query) => request('GET', path, { query });
export const post = (path, body) => request('POST', path, { body });
export const patch = (path, body) => request('PATCH', path, { body });
export const put = (path, body) => request('PUT', path, { body });
export const del = (path) => request('DELETE', path);
