import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../api/index.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try { setUser(await auth.me()); } catch { setUser(null); } finally { setReady(true); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(() => ({
    user, ready, setUser, refresh,
    signIn: async (body) => { const u = await auth.signIn(body); setUser(u); return u; },
    signUp: async (body) => { const u = await auth.signUp(body); setUser(u); return u; },
    signOut: async () => { await auth.signOut(); setUser(null); },
  }), [user, ready, refresh]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

/** Wrap a page that needs a signed-in user. Sends visitors to /signin and back afterwards. */
export function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="page"><div className="skeleton" /></div>;
  if (!user) return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return children;
}
