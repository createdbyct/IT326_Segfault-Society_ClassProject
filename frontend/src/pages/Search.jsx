import { useEffect, useState } from 'react';
import { useDebounced } from '../lib/useApi.js';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { classes, meta } from '../api/index.js';
import { Button, ScoreRuler, Tag, TickMeter } from '../components/rmc/index.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import { Empty, ErrorState, Loading } from '../components/States.jsx';
import { fmt1, pct, upcomingTerm } from '../lib/format.js';
import { useApi, useTitle } from '../lib/useApi.js';

const POPULAR = ['CS 240', 'Calculus', 'Psychology', 'Chemistry', 'Intro', 'Statistics'];
const SORTS = [['score', 'Score'], ['reviews', 'Most reviewed'], ['workload', 'Lightest workload']];

export default function Search() {
  useTitle('Find a class');
  const [params, setParams] = useSearchParams();
  const p = Object.fromEntries(params);
  const tags = p.tags ? p.tags.split(',') : [];
  const page = Number(p.page) || 1;

  const [form, setForm] = useState({ q: p.q || '', instructor: p.instructor || '', department: p.department || '' });
  useEffect(() => { setForm({ q: p.q || '', instructor: p.instructor || '', department: p.department || '' }); }, [p.q, p.instructor, p.department]);

  const nav = useNavigate();
  const active = ['q', 'instructor', 'department', 'tags', 'minScore', 'maxWorkload', 'all'].some((k) => p[k]);
  const depts = useApi(() => meta.departments(), []);
  const res = useApi(() => (active ? classes.search({ ...p, all: undefined, page, pageSize: 8 }) : null), [params.toString()]);

  // Live suggestions while typing (debounced so a real backend isn't hit on every keystroke).
  const [suggOpen, setSuggOpen] = useState(false);
  const typed = useDebounced(form.q.trim(), 220);
  const sugg = useApi(() => (typed.length >= 2 ? classes.search({ q: typed, pageSize: 5, sort: 'reviews' }) : null), [typed]);
  const showSugg = suggOpen && typed.length >= 2 && typed !== (p.q || '') && !!sugg.data?.items?.length;

  const update = (changes) => {
    const next = { ...p, ...changes };
    if (!('page' in changes)) delete next.page;
    Object.keys(next).forEach((k) => { if (next[k] === '' || next[k] == null) delete next[k]; });
    setParams(next);
  };
  const submit = (e) => { e.preventDefault(); setSuggOpen(false); update({ ...form, all: form.q || form.instructor || form.department ? '' : '1' }); };
  const toggleTag = (t) => update({ tags: (tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]).join(',') });

  const data = res.data;
  const from = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.total, data.page * data.pageSize) : 0;

  const goClass = (c) => nav(`/classes/${c.id}`);

  return (
    <main id="main" className="page rmc-fade">
      <div className="rmc-label eyebrow">Midstate University · {upcomingTerm()}</div>
      <h1 className="h-xl">Find a class</h1>

      <form role="search" onSubmit={submit} className="panel rmc-guides search-panel">
        <div className="search-main">
          <label className="field search-q"><span className="rmc-label">Course number or title</span>
            <input value={form.q} autoFocus={!active} autoComplete="off" role="combobox" aria-expanded={showSugg} aria-controls="search-sugg"
              onChange={(e) => { setForm({ ...form, q: e.target.value }); setSuggOpen(true); }}
              onFocus={() => setSuggOpen(true)} onBlur={() => setTimeout(() => setSuggOpen(false), 150)}
              onKeyDown={(e) => { if (e.key === 'Escape') setSuggOpen(false); }}
              placeholder="Try CS 240, Calculus, Intro to Psych…" /></label>
          <Button size="lg" type="submit">Search</Button>
          {showSugg ? (
            <ul id="search-sugg" className="search-sugg" role="listbox">
              {sugg.data.items.map((c) => (
                <li key={c.id} role="option" aria-selected="false">
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => goClass(c)}>
                    <b>{c.code}</b><span>{c.title}</span><em>{c.score != null ? fmt1(c.score) : '—'}</em>
                  </button>
                </li>
              ))}
              <li><button type="submit" className="search-sugg-all" onMouseDown={(e) => e.preventDefault()}>See all results for “{form.q.trim()}” →</button></li>
            </ul>
          ) : null}
        </div>
        <div className="grid cols-2" style={{ marginTop: 14 }}>
          <label className="field"><span className="rmc-label">Instructor (optional)</span>
            <input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="Any instructor" /></label>
          <label className="field"><span className="rmc-label">Department (optional)</span>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">All departments</option>
              {(depts.data || []).map((d) => <option key={d}>{d}</option>)}
            </select></label>
        </div>
      </form>

      {!active ? (
        <div className="search-start">
          <section>
            <div className="rmc-label" style={{ marginBottom: 10 }}>Popular searches</div>
            <div className="row-wrap" style={{ gap: 8 }}>
              {POPULAR.map((q) => <button key={q} type="button" className="search-chip" onClick={() => update({ q })}>{q}</button>)}
            </div>
          </section>
          <section>
            <div className="rmc-label" style={{ marginBottom: 10 }}>Browse by department</div>
            <div className="row-wrap" style={{ gap: 8 }}>
              {(depts.data || []).map((d) => <button key={d} type="button" className="search-chip" onClick={() => update({ department: d })}>{d}</button>)}
            </div>
          </section>
          <div className="row-wrap" style={{ gap: 16 }}>
            <Button variant="outline" onClick={() => update({ all: '1' })}>Browse all classes</Button>
            <Link to="/classes/new" style={{ font: '700 12px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Can't find it? Add a class →</Link>
          </div>
        </div>
      ) : (
      <div className="split-filters" style={{ marginTop: 32 }}>
        <aside aria-label="Filters" className="stack filters" style={{ gap: 24 }}>
          <div className="between"><span className="rmc-label">Filters</span>
            {p.minScore || p.maxWorkload || tags.length ? <Button variant="text" size="sm" onClick={() => update({ minScore: '', maxWorkload: '', tags: '' })}>Clear</Button> : null}</div>
          <div className="stack-sm" style={{ borderTop: '1.5px solid var(--grid-major)', paddingTop: 16 }}>
            <div className="rmc-label">Score at least</div>
            <div className="row-wrap">
              {[1, 2, 3, 4].map((n) => <Tag key={n} selected={p.minScore === String(n)} onToggle={(on) => update({ minScore: on ? String(n) : '' })}>{n}</Tag>)}
            </div>
          </div>
          <div className="stack-sm" style={{ borderTop: '1.5px solid var(--grid-major)', paddingTop: 16 }}>
            <div className="rmc-label">Max workload</div>
            <TickMeter label="WORKLOAD" value={Number(p.maxWorkload) || 0} word={p.maxWorkload ? `≤ ${p.maxWorkload}` : 'ANY'}
              onChange={(v) => update({ maxWorkload: String(v) === p.maxWorkload ? '' : String(v) })} />
          </div>
          <div className="stack-sm" style={{ borderTop: '1.5px solid var(--grid-major)', paddingTop: 16, gap: 6, alignItems: 'flex-start' }}>
            <div className="rmc-label" style={{ marginBottom: 4 }}>Students checked</div>
            {(data?.tagCounts || []).map((t) => <Tag key={t.label} count={t.count} selected={tags.includes(t.label)} onToggle={() => toggleTag(t.label)}>{t.label}</Tag>)}
            {tags.filter((t) => !(data?.tagCounts || []).some((x) => x.label === t)).map((t) => <Tag key={t} selected onToggle={() => toggleTag(t)}>{t}</Tag>)}
          </div>
          <Link to="/classes/new" style={{ font: '700 12px var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Can't find it? Add a class →</Link>
        </aside>

        <section aria-labelledby="results-title" aria-live="polite">
          <div className="between" style={{ alignItems: 'end', marginBottom: 16 }}>
            <h2 id="results-title" className="h-section" style={{ fontSize: 36 }}>
              {data ? `${data.total} ${data.total === 1 ? 'class' : 'classes'}${p.q ? ` for “${p.q}”` : p.department ? ` in ${p.department}` : ''}` : 'Searching…'}
            </h2>
            <div className="row-wrap">
              {SORTS.map(([k, l]) => <Tag key={k} selected={(p.sort || 'score') === k} onToggle={() => update({ sort: k })}>{l}</Tag>)}
            </div>
          </div>

          {res.error ? <ErrorState error={res.error} onRetry={res.reload} /> : !data ? <Loading rows={4} /> : data.items.length === 0 ? (
            <Empty title="No classes match" action={<Button variant="outline" size="sm" to="/classes/new">Add a class</Button>}>Try fewer filters, or add the class so others can score it.</Empty>
          ) : (
            <div className="stack" style={{ opacity: res.loading ? 0.6 : 1 }}>
              {data.items.map((c) => (
                <div key={c.id} className="rowcard">
                  <div style={{ minWidth: 0 }}>
                    <div className="rmc-label">{c.department} · {c.reviewCount} students</div>
                    <Link to={`/classes/${c.id}`} className="rowcard-code">{c.code}</Link>
                    <div className="rowcard-title">{c.title}</div>
                    <div className="mono-meta" style={{ marginTop: 10 }}>{c.topInstructor} · WORKLOAD {fmt1(c.workload)} · RETAKE {pct(c.retakePct)}</div>
                  </div>
                  <ScoreRuler score={c.score} size="sm" />
                  <FavoriteButton classId={c.id} code={c.code} initial={c.isFavorite} />
                </div>
              ))}
            </div>
          )}

          {data && data.total > 0 ? (
            <div className="between" style={{ marginTop: 24, font: '700 12px var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-2)' }}>
              <span>SHOWING {from}–{to} OF {data.total}</span>
              <div className="row-wrap" style={{ gap: 8 }}>
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>← Prev</Button>
                <Button variant="outline" size="sm" disabled={to >= data.total} onClick={() => update({ page: String(page + 1) })}>Next →</Button>
              </div>
              <span>RANKED BY {SORTS.find(([k]) => k === (p.sort || 'score'))[1].toUpperCase()} · MIN. 5 REVIEWS</span>
            </div>
          ) : null}
        </section>
      </div>
      )}
    </main>
  );
}
