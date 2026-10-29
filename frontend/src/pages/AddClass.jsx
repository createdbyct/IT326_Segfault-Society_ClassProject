import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { classes, meta } from '../api/index.js';
import { Button, ScoreRuler, Tag } from '../components/rmc/index.jsx';
import { useToast } from '../lib/toast.jsx';
import { useApi, useTitle } from '../lib/useApi.js';

const TERMS = ['Fall', 'Spring', 'Summer', 'Online'];

export default function AddClass() {
  useTitle('Add a class');
  const nav = useNavigate();
  const toast = useToast();
  const depts = useApi(() => meta.departments(), []);
  const [f, setF] = useState({ department: '', prefix: '', number: '', title: '', credits: '3', prereqs: '', instructors: [], terms: ['Fall', 'Spring'], description: '', catalogUrl: '' });
  const [instructor, setInstructor] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [similar, setSimilar] = useState([]);

  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const code = `${f.prefix.trim().toUpperCase()} ${f.number.trim()}`.trim();

  useEffect(() => {
    if (!f.prefix || !f.number) { setSimilar([]); return undefined; }
    const t = setTimeout(() => { classes.similar({ code, title: f.title }).then(setSimilar).catch(() => setSimilar([])); }, 300);
    return () => clearTimeout(t);
  }, [code, f.prefix, f.number, f.title]);

  const addInstructor = () => {
    const n = instructor.trim();
    if (n && !f.instructors.includes(n)) set('instructors', [...f.instructors, n]);
    setInstructor('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.department) errs.department = 'Pick a department.';
    if (!f.prefix.trim()) errs.prefix = 'Add the prefix.';
    if (!/^\d{2,4}[A-Za-z]?$/.test(f.number.trim())) errs.number = 'Use the catalog number, like 351.';
    if (!f.title.trim()) errs.title = 'Add the course title.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const created = await classes.create({ ...f, prefix: f.prefix.trim().toUpperCase(), number: f.number.trim(), title: f.title.trim(), credits: Number(f.credits),
        prereqs: f.prereqs.split(',').map((s) => s.trim()).filter(Boolean), instructors: instructor.trim() ? [...f.instructors, instructor.trim()] : f.instructors });
      toast(`${created.code} added. Score it while it's fresh.`);
      nav(`/classes/${created.id}`);
    } catch (err) {
      if (err.details?.field) setErrors({ [err.details.field]: err.message }); else toast(err.message);
    } finally { setBusy(false); }
  };

  const Err = ({ k }) => (errors[k] ? <span className="err" role="alert">{errors[k]}</span> : null);

  return (
    <main id="main" className="page rmc-fade">
      <div className="rmc-label eyebrow">Contribute · Midstate University</div>
      <h1 className="h-xl">Add a class</h1>
      <p className="lede">Can't find your class? Add it once and every student after you can score it.</p>

      <div className="split-aside" style={{ marginTop: 32, gap: 32 }}>
        <form className="panel rmc-guides stack" style={{ padding: 28, gap: 22 }} onSubmit={submit} noValidate>
          <div className="grid" style={{ gridTemplateColumns: '1.4fr 0.8fr 1fr' }} data-collapse>
            <label className="field"><span className="rmc-label">Department</span>
              <select value={f.department} onChange={(e) => set('department', e.target.value)} aria-invalid={!!errors.department}>
                <option value="">Choose…</option>{(depts.data || []).map((d) => <option key={d}>{d}</option>)}
              </select><Err k="department" /></label>
            <label className="field"><span className="rmc-label">Prefix</span>
              <input value={f.prefix} onChange={(e) => set('prefix', e.target.value)} placeholder="CS" aria-invalid={!!errors.prefix} autoCapitalize="characters" /><Err k="prefix" /></label>
            <label className="field"><span className="rmc-label">Course number</span>
              <input value={f.number} onChange={(e) => set('number', e.target.value)} placeholder="351" inputMode="numeric" aria-invalid={!!errors.number} /><Err k="number" /></label>
          </div>
          <label className="field"><span className="rmc-label">Course title</span>
            <input value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Computer Networks" aria-invalid={!!errors.title} />
            {errors.title ? <Err k="title" /> : <span className="hint">Use the title from the course catalog.</span>}</label>
          <div className="grid" style={{ gridTemplateColumns: '0.6fr 1.4fr' }} data-collapse>
            <label className="field"><span className="rmc-label">Credits</span>
              <select value={f.credits} onChange={(e) => set('credits', e.target.value)}>{['1', '2', '3', '4', '5'].map((n) => <option key={n}>{n}</option>)}</select></label>
            <label className="field"><span className="rmc-label">Prerequisites (optional)</span>
              <input value={f.prereqs} onChange={(e) => set('prereqs', e.target.value)} placeholder="e.g. CS 240, MATH 145" /></label>
          </div>
          <div className="field">
            <span className="rmc-label">Instructors</span>
            <div className="row-wrap" style={{ gap: 8 }}>
              {f.instructors.map((n) => <Tag key={n} selected onToggle={() => set('instructors', f.instructors.filter((x) => x !== n))}>{n} ×</Tag>)}
              <label className="field" style={{ flex: 1, minWidth: 220 }}><span className="sr-only">Add an instructor</span>
                <input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Add an instructor (Last, F.) and press Enter"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInstructor(); } }} onBlur={addInstructor} /></label>
            </div>
          </div>
          <div className="field">
            <span className="rmc-label">Terms offered</span>
            <div className="row-wrap">
              {TERMS.map((t) => <Tag key={t} selected={f.terms.includes(t)} onToggle={(on) => set('terms', on ? [...f.terms, t] : f.terms.filter((x) => x !== t))}>{t}</Tag>)}
            </div>
          </div>
          <label className="field"><span className="rmc-label">Short description (optional)</span>
            <textarea value={f.description} onChange={(e) => set('description', e.target.value)} style={{ minHeight: 130 }} placeholder="What the class covers, in a sentence or two." /></label>
          <label className="field"><span className="rmc-label">Catalog link (optional)</span>
            <input type="url" value={f.catalogUrl} onChange={(e) => set('catalogUrl', e.target.value)} placeholder="https://catalog.midstate.edu/…" /></label>
          <div className="form-actions">
            <span className="hint" style={{ maxWidth: 360 }}>New classes are checked by a moderator, usually within 24 hours. You can score it right away.</span>
            <div className="row-wrap" style={{ gap: 12 }}>
              <Button variant="outline" to="/search">Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add class'}</Button>
            </div>
          </div>
        </form>

        <aside className="stack">
          {similar.length ? (
            <div className="panel panel-tight" style={{ borderColor: 'var(--ruler)' }}>
              <div className="rmc-label eyebrow" style={{ marginBottom: 10 }}>Is it already here?</div>
              <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px' }}>These look similar to <strong>{code}</strong>:</p>
              {similar.map((s) => (
                <Link key={s.id} to={`/classes/${s.id}`} className="divider-top" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', color: 'var(--text)', textDecoration: 'none' }}>
                  <span style={{ fontWeight: 700 }}>{s.code}</span><span style={{ font: '500 13px var(--font-mono)', color: 'var(--text-2)', textAlign: 'right' }}>{s.title}</span>
                </Link>
              ))}
            </div>
          ) : null}
          <div className="panel panel-tight">
            <div className="rmc-label" style={{ marginBottom: 10 }}>Before you add</div>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: '23px', color: 'var(--text-2)' }}>
              <li>Search first. Cross-listed classes share one page.</li>
              <li>Use the official course number and title.</li>
              <li>Add instructors as Last, First initial.</li>
            </ol>
          </div>
          <div className="panel panel-tight rmc-guides">
            <div className="rmc-label" style={{ marginBottom: 12 }}>Preview</div>
            <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-0.04em', lineHeight: 1 }}>{code || 'CS 000'}</div>
            <div style={{ fontSize: 16, color: 'var(--text-2)', margin: '4px 0 14px' }}>{f.title || 'Course title'}</div>
            <ScoreRuler score={null} size="sm" />
          </div>
        </aside>
      </div>
    </main>
  );
}
