import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/rmc/index.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useTitle } from '../lib/useApi.js';

const YEARS = ['2027', '2028', '2029', '2030', 'Grad student'];
const POINTS = [
  ['Anonymous reviews.', 'Your name never appears next to a score.'],
  ['Verified students.', 'A school email keeps scores honest.'],
  ['Favorites.', 'Save classes and compare them when you register.'],
];

export default function SignUp() {
  useTitle('Create an account');
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ displayName: '', email: '', password: '', major: '', classYear: '2028', school: 'Midstate University', agree: false });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined, form: undefined })); };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.displayName.trim()) errs.displayName = 'Pick a display name.';
    if (!/^[^@\s]+@[^@\s]+\.edu$/i.test(f.email.trim())) errs.email = 'Use your school email (it must end in .edu).';
    if (f.password.length < 10) errs.password = 'Use at least 10 characters.';
    if (!f.agree) errs.agree = 'Please agree to the review guidelines.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const { agree, ...body } = f;
      await signUp(body);
      nav('/account');
    } catch (err) {
      setErrors(err.details?.field ? { [err.details.field]: err.message } : { form: err.message });
    } finally { setBusy(false); }
  };

  const Err = ({ k }) => (errors[k] ? <span className="err" role="alert">{errors[k]}</span> : null);

  return (
    <main id="main" className="page rmc-fade split-aside" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 520px)', gap: 64, paddingTop: 56 }}>
      <div>
        <div className="rmc-label eyebrow">Create an account · free</div>
        <h1 className="h-xxl" style={{ fontSize: 'clamp(48px, 7vw, 84px)' }}>JOIN RATE MY CLASSES</h1>
        <p className="lede" style={{ maxWidth: 480, marginTop: 18 }}>Score the classes you've taken, save the ones you're eyeing, and see what's worth your next semester.</p>
        <ol style={{ listStyle: 'none', margin: '32px 0 0', padding: 0, maxWidth: 480 }} className="stack-sm">
          {POINTS.map(([a, b], i) => (
            <li key={a} className="panel" style={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr)', gap: 12, alignItems: 'baseline', padding: 16 }}>
              <span style={{ font: '700 18px var(--font-mono)', color: 'var(--ruler)' }}>0{i + 1}</span>
              <span><strong>{a}</strong> <span style={{ color: 'var(--text-2)' }}>{b}</span></span>
            </li>
          ))}
        </ol>
      </div>

      <form className="panel rmc-guides stack" style={{ padding: 28, gap: 18 }} onSubmit={submit} noValidate>
        <h2 className="h-panel" style={{ fontSize: 28 }}>Create your account</h2>
        {errors.form ? <p className="err" role="alert" style={{ margin: 0 }}>{errors.form}</p> : null}
        <label className="field"><span className="rmc-label">Display name</span>
          <input value={f.displayName} onChange={(e) => set('displayName', e.target.value)} autoComplete="nickname" aria-invalid={!!errors.displayName} />
          {errors.displayName ? <Err k="displayName" /> : <span className="hint">Shown only on your account page.</span>}</label>
        <label className="field"><span className="rmc-label">School email</span>
          <input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="you@midstate.edu" autoComplete="email" aria-invalid={!!errors.email} />
          {errors.email ? <Err k="email" /> : <span className="hint">We'll send a 6-digit code. Must end in .edu.</span>}</label>
        <label className="field"><span className="rmc-label">Password</span>
          <input type="password" value={f.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" aria-invalid={!!errors.password} />
          {errors.password ? <Err k="password" /> : <span className="hint">At least 10 characters.</span>}</label>
        <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 14 }} data-collapse>
          <label className="field"><span className="rmc-label">Major (optional)</span>
            <input value={f.major} onChange={(e) => set('major', e.target.value)} placeholder="Computer Science" /></label>
          <label className="field"><span className="rmc-label">Class year</span>
            <select value={f.classYear} onChange={(e) => set('classYear', e.target.value)}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></label>
        </div>
        <label className="field"><span className="rmc-label">School</span>
          <select value={f.school} onChange={(e) => set('school', e.target.value)}><option>Midstate University</option></select></label>
        <label className="chk-inline" style={{ alignItems: 'flex-start', fontSize: 14, lineHeight: '20px', color: 'var(--text-2)' }}>
          <input type="checkbox" checked={f.agree} onChange={(e) => set('agree', e.target.checked)} />
          <span>I agree to score classes fairly and follow the <a href="#guidelines">review guidelines</a> and <a href="#privacy">privacy policy</a>.</span>
        </label>
        <Err k="agree" />
        <Button size="lg" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
        <p style={{ margin: 0, textAlign: 'center', font: '700 12px var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-2)' }}>HAVE AN ACCOUNT? <Link to="/signin">SIGN IN</Link></p>
      </form>
    </main>
  );
}
