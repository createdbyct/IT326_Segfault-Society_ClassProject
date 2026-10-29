import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/rmc/index.jsx';
import { USE_MOCK } from '../api/index.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useTitle } from '../lib/useApi.js';

export default function SignIn() {
  useTitle('Sign in');
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/favorites';
  const [f, setF] = useState({ email: USE_MOCK ? 'ctaylor@midstate.edu' : '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try { await signIn(f); nav(next.startsWith('/') ? next : '/favorites', { replace: true }); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <main id="main" className="page page-narrow rmc-fade" style={{ maxWidth: 560 }}>
      <div className="rmc-label eyebrow">Welcome back</div>
      <h1 className="h-xl">Sign in</h1>
      <form className="panel rmc-guides stack" style={{ marginTop: 28, padding: 28, gap: 18 }} onSubmit={submit}>
        {error ? <p className="err" role="alert" style={{ margin: 0 }}>{error}</p> : null}
        <label className="field"><span className="rmc-label">School email</span>
          <input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" placeholder="you@midstate.edu" /></label>
        <label className="field"><span className="rmc-label">Password</span>
          <input type="password" required={!USE_MOCK} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" />
          {USE_MOCK ? <span className="hint">Sample data: any password works for this email.</span> : null}</label>
        <Button size="lg" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        <p style={{ margin: 0, textAlign: 'center', font: '700 12px var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-2)' }}>NEW HERE? <Link to="/signup">CREATE AN ACCOUNT</Link></p>
      </form>
    </main>
  );
}
