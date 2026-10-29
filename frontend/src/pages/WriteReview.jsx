import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { classes, meta, reviews } from '../api/index.js';
import { Button, ScoreRuler, Tag, TickMeter } from '../components/rmc/index.jsx';
import { ErrorState, Loading } from '../components/States.jsx';
import { useToast } from '../lib/toast.jsx';
import { useApi, useTitle } from '../lib/useApi.js';

const TERMS = ['Fall 2026', 'Summer 2026', 'Spring 2026', 'Fall 2025', 'Spring 2025', 'Fall 2024'];
const GRADES = ['A', 'B', 'C', 'D', 'F', 'Pass', 'Withdrew'];
const MAX = 1000;
const DRAFT_KEY = (id) => `rmc.draft.${id}`;

/** /review (pick a class first), /classes/:id/review (new), /classes/:id/review?edit=<reviewId> (edit). */
export default function WriteReview() {
  const { id } = useParams();
  if (!id) return <PickClass />;
  return <ReviewForm classId={id} />;
}

function PickClass() {
  useTitle('Rate a class');
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const res = useApi(() => classes.search({ q, sort: 'reviews', pageSize: 8 }), [q]);
  return (
    <main id="main" className="page page-narrow rmc-fade">
      <div className="rmc-label eyebrow">Rate a class · anonymous · about 2 minutes</div>
      <h1 className="h-xl">Which class?</h1>
      <label className="field on-mat" style={{ marginTop: 28 }}><span className="rmc-label">Course no. or title</span>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="CS 240, Intro to Psych…" /></label>
      <div className="stack-sm" style={{ marginTop: 20 }}>
        {(res.data?.items || []).map((c) => (
          <button key={c.id} type="button" className="rowcard" onClick={() => nav(`/classes/${c.id}/review`)}
            style={{ gridTemplateColumns: 'minmax(0,1fr) auto', cursor: 'pointer', textAlign: 'left', color: 'var(--text)', font: 'inherit' }}>
            <span><span className="rowcard-code" style={{ marginTop: 0, fontSize: 26 }}>{c.code}</span><span className="rowcard-title">{c.title}</span></span>
            <span className="rmc-label eyebrow">Score it →</span>
          </button>
        ))}
        {res.data && res.data.items.length === 0 ? <p className="hint">No match. <Link to="/classes/new">Add the class</Link> first, then score it.</p> : null}
      </div>
    </main>
  );
}

function ReviewForm({ classId }) {
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const nav = useNavigate();
  const toast = useToast();
  const cls = useApi(() => classes.get(classId), [classId]);
  const tagList = useApi(() => meta.tags(), []);
  const existing = useApi(() => (editId ? reviews.get(editId) : null), [editId]);
  useTitle(cls.data ? `Score ${cls.data.code}` : 'Rate a class');

  // Already scored this class? Edit that review instead of starting a duplicate.
  useEffect(() => {
    if (!editId && cls.data?.myReviewId) nav(`/classes/${classId}/review?edit=${cls.data.myReviewId}`, { replace: true });
  }, [editId, cls.data, classId, nav]);

  const [f, setF] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Initial form: the review being edited, a saved draft, or blanks.
  useEffect(() => {
    if (!cls.data || (editId && existing.loading)) return;
    const blank = { score: null, workload: 0, difficulty: 0, lecture: 0, retake: '', tags: [], text: '', highlight: '', instructor: cls.data.instructors[0]?.name || '', term: TERMS[0], grade: '' };
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY(classId)) || 'null'); } catch { /* ignore */ }
    setF(existing.data ? { ...blank, ...existing.data, grade: existing.data.grade || '' } : { ...blank, ...(draft || {}) });
  }, [cls.data, existing.data, existing.loading, editId, classId]);

  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
  const toggleTag = (t, on) => set('tags', on ? (f.tags.length >= 5 ? f.tags : [...f.tags, t]) : f.tags.filter((x) => x !== t));
  const instructors = useMemo(() => cls.data?.instructors.map((i) => i.name) || [], [cls.data]);

  if (cls.error) return <main id="main" className="page page-narrow rmc-fade"><ErrorState error={cls.error} onRetry={cls.reload} /></main>;
  if (existing.error) return <main id="main" className="page page-narrow rmc-fade"><ErrorState error={existing.error} /></main>;
  if (!cls.data || !f) return <main id="main" className="page page-narrow rmc-fade"><Loading rows={4} height={160} /></main>;
  const c = cls.data;

  const validate = () => {
    const e = {};
    if (!f.score) e.score = 'Pick a score from 1 to 5.';
    if (!f.workload || !f.difficulty || !f.lecture) e.meters = 'Set all three meters.';
    if (!f.instructor) e.instructor = 'Pick the instructor you had.';
    if (f.text.trim().length < 20) e.text = 'Write at least a sentence or two (20+ characters).';
    if (f.highlight && !f.text.includes(f.highlight)) e.highlight = 'The highlight has to be a phrase from your review.';
    if (!f.retake) e.retake = 'Pick one.';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    setBusy(true);
    const body = { score: f.score, workload: f.workload, difficulty: f.difficulty, lecture: f.lecture, retake: f.retake, tags: f.tags,
      text: f.text.trim(), highlight: f.highlight.trim(), instructor: f.instructor, term: f.term, grade: f.grade };
    try {
      if (editId) await reviews.update(editId, body); else await reviews.create(classId, body);
      try { localStorage.removeItem(DRAFT_KEY(classId)); } catch { /* ignore */ }
      toast(editId ? 'Review updated' : `Thanks — your score for ${c.code} is in.`);
      nav(`/classes/${classId}`);
    } catch (err) {
      if (err.details?.field) setErrors({ [err.details.field === 'workload' || err.details.field === 'difficulty' || err.details.field === 'lecture' ? 'meters' : err.details.field]: err.message });
      else toast(err.message);
    } finally { setBusy(false); }
  };

  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY(classId), JSON.stringify(f)); toast('Draft saved on this device'); } catch { toast('Could not save a draft in this browser'); }
  };

  const Err = ({ k }) => (errors[k] ? <p className="err" role="alert" data-error="true" style={{ margin: '10px 0 0' }}>{errors[k]}</p> : null);

  return (
    <main id="main" className="page page-narrow rmc-fade">
      <div className="rmc-label eyebrow">{editId ? 'Edit your review' : 'Rate a class · anonymous · about 2 minutes'}</div>
      <h1 className="h-xl">Score {c.code}</h1>
      <p style={{ margin: '12px 0 0', fontSize: 20, color: 'var(--text-2)' }}>{c.title} · <Link to="/review">Change class</Link></p>

      <form className="rmc-guides" onSubmit={submit} noValidate style={{ marginTop: 32, background: 'var(--panel)', border: '1.5px solid var(--line)' }}>
        <div className="grid cols-3" style={{ padding: 24, borderBottom: '1.5px solid var(--line)' }}>
          <label className="field"><span className="rmc-label">Instructor</span>
            <select value={f.instructor} onChange={(e) => set('instructor', e.target.value)} aria-invalid={!!errors.instructor}>
              {instructors.map((n) => <option key={n}>{n}</option>)}
              <option value="Other">Someone else</option>
            </select>{errors.instructor ? <span className="err">{errors.instructor}</span> : null}</label>
          <label className="field"><span className="rmc-label">Term taken</span>
            <select value={f.term} onChange={(e) => set('term', e.target.value)}>{TERMS.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className="field"><span className="rmc-label">Your final grade (optional)</span>
            <select value={f.grade} onChange={(e) => set('grade', e.target.value)}><option value="">Prefer not to say</option>{GRADES.map((g) => <option key={g}>{g}</option>)}</select></label>
        </div>

        <div className="q">
          <span className="q-num">01</span>
          <div>
            <h2>Overall, how would you score this class?</h2>
            <p className="q-help">Score the class, not the person teaching it. 1 = avoid it, 5 = take it.</p>
            <ScoreRuler score={f.score} onChange={(v) => set('score', v)} label={`Your score for ${c.code}`} />
            <Err k="score" />
          </div>
        </div>

        <div className="q">
          <span className="q-num">02</span>
          <div className="stack-sm" style={{ gap: 14 }}>
            <h2 style={{ margin: 0 }}>Measure it</h2>
            <TickMeter kind="workload" value={f.workload} onChange={(v) => set('workload', v)} />
            <TickMeter kind="difficulty" value={f.difficulty} onChange={(v) => set('difficulty', v)} />
            <TickMeter kind="lecture" value={f.lecture} onChange={(v) => set('lecture', v)} />
            <Err k="meters" />
          </div>
        </div>

        <div className="q">
          <span className="q-num">03</span>
          <div>
            <h2>Check all that apply</h2>
            <p className="q-help" style={{ marginBottom: 14 }}>Pick up to 5. {f.tags.length}/5 picked.</p>
            <div className="rmc-tags">
              {(tagList.data || []).map((t) => <Tag key={t} selected={f.tags.includes(t)} onToggle={(on) => toggleTag(t, on)}>{t}</Tag>)}
            </div>
          </div>
        </div>

        <div className="q">
          <span className="q-num">04</span>
          <div className="stack-sm" style={{ gap: 14 }}>
            <label className="field">
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Write your review</span>
              <span style={{ color: 'var(--text-2)', fontSize: 15 }}>What do you wish you'd known in week one? No names of students, no personal attacks.</span>
              <textarea value={f.text} maxLength={MAX} onChange={(e) => set('text', e.target.value)} aria-invalid={!!errors.text} placeholder="Start the projects early…" />
            </label>
            <div className="between"><Err k="text" /><span style={{ marginLeft: 'auto', font: '500 12px var(--font-mono)', color: 'var(--text-2)' }}>{f.text.length.toLocaleString()} / {MAX.toLocaleString()}</span></div>
            <label className="field"><span className="rmc-label">Highlight one phrase (optional)</span>
              <input value={f.highlight} onChange={(e) => set('highlight', e.target.value)} placeholder="Copy a short phrase from your review" aria-invalid={!!errors.highlight} />
              {errors.highlight ? <span className="err">{errors.highlight}</span> : <span className="hint">It gets underlined in yellow so skimmers catch it.</span>}</label>
          </div>
        </div>

        <div className="q" style={{ borderBottom: '1.5px solid var(--line)' }}>
          <span className="q-num">05</span>
          <div>
            <h2 style={{ marginBottom: 14 }}>Would you take it again?</h2>
            <div className="row-wrap" style={{ gap: 8 }} role="radiogroup" aria-label="Would you take it again?">
              {['Yes', 'Maybe', 'No'].map((n) => <Tag key={n} selected={f.retake === n} onToggle={() => set('retake', n)}>{n}</Tag>)}
            </div>
            <Err k="retake" />
          </div>
        </div>

        <div className="between" style={{ padding: 24, gap: 20 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: 'var(--text-2)', maxWidth: 440 }}>By submitting you confirm you took this class. Reviews that name or attack people are removed.</p>
          <div className="row-wrap" style={{ gap: 12 }}>
            {!editId ? <Button variant="text" onClick={saveDraft}>Save draft</Button> : <Button variant="text" to={`/classes/${classId}`}>Cancel</Button>}
            <Button size="lg" type="submit" disabled={busy}>{busy ? 'Submitting…' : editId ? 'Save changes' : 'Submit score'}</Button>
          </div>
        </div>
      </form>
    </main>
  );
}
