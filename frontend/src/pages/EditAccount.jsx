import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { me } from '../api/index.js';
import { Button } from '../components/rmc/index.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../lib/toast.jsx';
import { useTitle } from '../lib/useApi.js';

const YEARS = ['2027', '2028', '2029', '2030', 'Grad student'];
const SECTIONS = [['profile', 'PROFILE'], ['login', 'EMAIL & PASSWORD'], ['notify', 'NOTIFICATIONS'], ['privacy', 'PRIVACY'], ['delete', 'DELETE ACCOUNT']];

export default function EditAccount() {
  useTitle('Edit account');
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ displayName: user.displayName, major: user.major || '', classYear: user.classYear, prefs: { ...user.prefs } });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState('profile');

  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const setPref = (k, v) => setF((x) => ({ ...x, prefs: { ...x.prefs, [k]: v } }));
  const setPwField = (k, v) => { setPw((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const save = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.displayName.trim()) errs.displayName = 'Display name cannot be empty.';
    const changingPw = pw.current || pw.next || pw.confirm;
    if (changingPw) {
      if (!pw.current) errs.current = 'Enter your current password.';
      if (pw.next.length < 10) errs.next = 'Use at least 10 characters.';
      if (pw.next !== pw.confirm) errs.confirm = "Passwords don't match.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const updated = await me.update(f);
      if (changingPw) await me.changePassword({ current: pw.current, next: pw.next });
      setUser(updated);
      toast(changingPw ? 'Saved. Password changed.' : 'Account saved');
      nav('/account');
    } catch (err) {
      if (err.details?.field) setErrors({ [err.details.field]: err.message }); else toast(err.message);
    } finally { setBusy(false); }
  };

  const download = async () => {
    try {
      const data = await me.exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: 'rate-my-classes-data.json' });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { toast(err.message); }
  };

  const destroy = async () => {
    const typed = window.prompt('Type DELETE to permanently delete your account.');
    if (typed !== 'DELETE') return;
    try { await me.remove(); setUser(null); nav('/'); toast('Your account was deleted.'); } catch (err) { toast(err.message); }
  };

  const Err = ({ k }) => (errors[k] ? <span className="err" role="alert">{errors[k]}</span> : null);

  return (
    <main id="main" className="page rmc-fade">
      <div className="rmc-label crumbs"><Link to="/account">Account</Link> / <span className="here">Edit</span></div>
      <h1 className="h-xl">Edit account</h1>

      <div className="split-nav" style={{ marginTop: 32 }}>
        <nav aria-label="Account sections" className="side-nav">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setActive(id)} className={[active === id ? 'active' : '', id === 'delete' ? 'danger' : ''].join(' ')}>{label}</a>
          ))}
        </nav>

        <form className="stack" style={{ gap: 20 }} onSubmit={save} noValidate>
          <section id="profile" className="panel rmc-guides stack">
            <h2 className="h-panel">Profile</h2>
            <div className="grid cols-2">
              <label className="field"><span className="rmc-label">Display name</span>
                <input value={f.displayName} onChange={(e) => set('displayName', e.target.value)} aria-invalid={!!errors.displayName} />
                {errors.displayName ? <Err k="displayName" /> : <span className="hint">Shown only on your account page, never on reviews.</span>}</label>
              <label className="field"><span className="rmc-label">School</span>
                <input value={user.school} readOnly /><span className="hint">Tied to your verified school email.</span></label>
              <label className="field"><span className="rmc-label">Major</span>
                <input value={f.major} onChange={(e) => set('major', e.target.value)} /></label>
              <label className="field"><span className="rmc-label">Class year</span>
                <select value={f.classYear} onChange={(e) => set('classYear', e.target.value)}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></label>
            </div>
          </section>

          <section id="login" className="panel stack">
            <h2 className="h-panel">Email &amp; password</h2>
            <label className="field"><span className="rmc-label">School email{user.verified ? ' · verified' : ''}</span><input value={user.email} readOnly /></label>
            <div className="grid cols-3">
              <label className="field"><span className="rmc-label">Current password</span>
                <input type="password" value={pw.current} onChange={(e) => setPwField('current', e.target.value)} autoComplete="current-password" aria-invalid={!!errors.current} /><Err k="current" /></label>
              <label className="field"><span className="rmc-label">New password</span>
                <input type="password" value={pw.next} onChange={(e) => setPwField('next', e.target.value)} placeholder="At least 10 characters" autoComplete="new-password" aria-invalid={!!errors.next} /><Err k="next" /></label>
              <label className="field"><span className="rmc-label">Confirm new</span>
                <input type="password" value={pw.confirm} onChange={(e) => setPwField('confirm', e.target.value)} autoComplete="new-password" aria-invalid={!!errors.confirm} /><Err k="confirm" /></label>
            </div>
            <span className="hint">Leave these blank to keep your current password.</span>
          </section>

          <section id="notify" className="panel">
            <h2 className="h-panel" style={{ marginBottom: 8 }}>Notifications</h2>
            <Pref checked={f.prefs.notifyFavorites} onChange={(v) => setPref('notifyFavorites', v)} title="New reviews on my favorites" hint="A weekly digest, never more than once a week." />
            <Pref checked={f.prefs.notifyRemind} onChange={(v) => setPref('notifyRemind', v)} title="Reminder to score my classes" hint="Once at the end of each term." />
            <Pref checked={f.prefs.notifyHelpful} onChange={(v) => setPref('notifyHelpful', v)} title="When someone finds my review helpful" />
          </section>

          <section id="privacy" className="panel">
            <h2 className="h-panel" style={{ marginBottom: 8 }}>Privacy</h2>
            <Pref checked={f.prefs.showYear} onChange={(v) => setPref('showYear', v)} title="Show my class year on reviews" hint='e.g. "Sophomore". Your name is never shown.' />
            <div className="divider-top" style={{ paddingTop: 12 }}><Button variant="text" size="sm" onClick={download}>Download my data</Button></div>
          </section>

          <section id="delete" className="danger-zone">
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--blade-text)' }}>Delete account</h2>
              <p className="hint" style={{ margin: '6px 0 0', maxWidth: 520 }}>Your reviews stay up anonymously unless you delete them first. This can't be undone.</p>
            </div>
            <button type="button" className="btn-danger" onClick={destroy}>Delete account</button>
          </section>

          <div className="sticky-bar">
            <Button variant="outline" to="/account">Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Pref({ checked, onChange, title, hint }) {
  return (
    <label className="chk">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span><strong>{title}</strong>{hint ? <><br /><span className="hint">{hint}</span></> : null}</span>
    </label>
  );
}
