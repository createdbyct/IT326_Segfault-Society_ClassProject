import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { classes, reviews as reviewsApi } from '../api/index.js';
import { Button, ReviewCard, ScoreRuler, StatRow, Tag, TickMeter } from '../components/rmc/index.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import { Empty, ErrorState, Loading } from '../components/States.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../lib/toast.jsx';
import { fmt1, pct } from '../lib/format.js';
import { useApi, useTitle } from '../lib/useApi.js';

const PAGE = 5;
const SORTS = [['helpful', 'Most helpful'], ['newest', 'Newest'], ['lowest', 'Lowest score']];

export default function ClassPage() {
  const { id } = useParams();
  const cls = useApi(() => classes.get(id), [id]);
  useTitle(cls.data ? `${cls.data.code} ${cls.data.title}` : 'Class');

  if (cls.loading && !cls.data) return <main id="main" className="page rmc-fade"><Loading rows={3} height={180} /></main>;
  if (cls.error) return <main id="main" className="page rmc-fade"><ErrorState error={cls.error} onRetry={cls.reload} /></main>;
  return <ClassView c={cls.data} />;
}

function ClassView({ c }) {
  const { user } = useAuth();
  const toast = useToast();
  const [filters, setFilters] = useState({ instructor: '', term: '', sort: 'helpful' });
  const [limit, setLimit] = useState(PAGE);
  const revs = useApi(() => classes.reviews(c.id, { ...filters, offset: 0, limit }), [c.id, filters.instructor, filters.term, filters.sort, limit]);
  const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setLimit(PAGE); };

  const enough = c.score != null;
  const stats = [
    { value: pct(c.retakePct), label: 'Would retake' },
    { value: fmt1(c.workload), label: 'Workload' },
    { value: fmt1(c.difficulty), label: 'Difficulty' },
    { value: fmt1(c.lecture), label: 'Lecture' },
    { value: c.hoursPerWeek ? `~${c.hoursPerWeek} h` : '—', label: 'Per week' },
  ];

  const helpful = async (r) => {
    if (!user) { toast('Sign in to vote on reviews'); return; }
    try {
      const out = await reviewsApi.helpful(r.id);
      revs.setData((d) => ({ ...d, items: d.items.map((x) => (x.id === r.id ? { ...x, ...out } : x)) }));
    } catch (e) { toast(e.message); }
  };
  const report = async (r) => {
    try { await reviewsApi.report(r.id, 'Reported from class page'); toast('Thanks — a moderator will take a look.'); } catch (e) { toast(e.message); }
  };

  return (
    <main id="main" className="page rmc-fade" style={{ paddingTop: 32 }}>
      <div className="rmc-label crumbs"><Link to="/">Midstate University</Link> / <Link to={`/search?department=${encodeURIComponent(c.department)}`}>{c.department}</Link> / <span className="here">{c.code}</span></div>
      <div className="split-aside" style={{ marginTop: 24, gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 500px)', gap: 48, alignItems: 'end' }}>
        <div>
          <div className="rmc-label eyebrow">Course · {c.department} · {c.credits} credits</div>
          <h1 className="h-code">{c.code}</h1>
          <p style={{ margin: '14px 0 0', fontSize: 28, fontWeight: 500, color: 'var(--text-2)' }}>{c.title}</p>
          <p className="mono-meta" style={{ margin: '10px 0 0', fontSize: 14 }}>
            {[c.prereqs.length ? `PREREQ ${c.prereqs.join(', ')}` : null, c.terms.length ? `OFFERED ${c.terms.join(' & ')}` : null, c.sections ? `${c.sections} SECTION${c.sections === 1 ? '' : 'S'}` : null].filter(Boolean).join(' · ')}
          </p>
          {c.description ? <p style={{ margin: '14px 0 0', fontSize: 17, lineHeight: '26px', maxWidth: 620 }}>{c.description}</p> : null}
          <div className="row-wrap" style={{ gap: 12, marginTop: 24 }}>
            {c.myReviewId ? <Button to={`/classes/${c.id}/review?edit=${c.myReviewId}`}>Edit your score</Button> : <Button to={`/classes/${c.id}/review`}>Rate this class</Button>}
            <FavoriteButton classId={c.id} code={c.code} initial={c.isFavorite} variant="button" />
          </div>
        </div>
        <div className="panel rmc-guides">
          <ScoreRuler score={c.score} size="lg" caption={`${c.reviewCount} student${c.reviewCount === 1 ? '' : 's'}`} />
          {!enough ? <p className="hint" style={{ margin: '12px 0 0' }}>Scores show once 5 students have rated it. {5 - c.reviewCount} to go.</p> : null}
        </div>
      </div>

      {enough ? <div style={{ marginTop: 32 }}><StatRow items={stats} /></div> : null}

      <div className="split-aside" style={{ marginTop: 48, gap: 48 }}>
        <section aria-labelledby="rev-title">
          <div className="between" style={{ alignItems: 'end', marginBottom: 16 }}>
            <h2 id="rev-title" className="h-section">{revs.data ? revs.data.total : c.reviewCount} reviews</h2>
            <div className="row-wrap" style={{ gap: 12, alignItems: 'end' }}>
              <label className="field compact"><span className="rmc-label">Instructor</span>
                <select value={filters.instructor} onChange={(e) => setFilter('instructor', e.target.value)}>
                  <option value="">All ({c.instructors.length})</option>
                  {c.instructors.map((i) => <option key={i.name}>{i.name}</option>)}
                </select></label>
              <label className="field compact"><span className="rmc-label">Term</span>
                <select value={filters.term} onChange={(e) => setFilter('term', e.target.value)}>
                  <option value="">All terms</option>
                  {c.reviewTerms.map((t) => <option key={t}>{t}</option>)}
                </select></label>
            </div>
          </div>
          <div className="row-wrap" style={{ marginBottom: 16 }}>
            {SORTS.map(([k, l]) => <Tag key={k} selected={filters.sort === k} onToggle={() => setFilter('sort', k)}>{l}</Tag>)}
          </div>
          {revs.error ? <ErrorState error={revs.error} onRetry={revs.reload} /> : !revs.data ? <Loading rows={3} height={160} /> : revs.data.items.length === 0 ? (
            <Empty title="No reviews yet" action={<Button size="sm" to={`/classes/${c.id}/review`}>Be the first</Button>}>Nobody has scored this class{filters.instructor || filters.term ? ' with these filters' : ''} yet.</Empty>
          ) : (
            <div className="stack">
              {revs.data.items.map((r) => (
                <ReviewCard key={r.id} score={r.score} term={r.term} instructor={r.instructor} year={r.year} text={r.text} highlight={r.highlight} tags={r.tags}
                  helpful={r.helpful} helpfulPressed={r.helpfulByMe} onHelpful={() => helpful(r)} onReport={() => report(r)} className={r.mine ? 'rmc-guides' : undefined} />
              ))}
            </div>
          )}
          {revs.data && revs.data.items.length < revs.data.total ? (
            <div style={{ marginTop: 20 }}><Button variant="outline" disabled={revs.loading} onClick={() => setLimit((l) => l + PAGE * 2)}>
              Show more reviews ({revs.data.total - revs.data.items.length} left)</Button></div>
          ) : null}
        </section>

        <aside className="stack">
          {enough ? (
            <div className="panel panel-tight stack-sm">
              <div className="rmc-label" style={{ marginBottom: 4 }}>The numbers</div>
              <TickMeter kind="workload" value={c.workload} />
              <TickMeter kind="difficulty" value={c.difficulty} />
              <TickMeter kind="lecture" value={c.lecture} />
            </div>
          ) : null}
          {c.tags.length ? (
            <div className="panel panel-tight">
              <div className="rmc-label" style={{ marginBottom: 10 }}>Students checked</div>
              <div className="rmc-tags">{c.tags.slice(0, 6).map((t) => <Tag key={t.label} count={t.count}>{t.label}</Tag>)}</div>
            </div>
          ) : null}
          {c.instructors.length ? (
            <div className="panel panel-tight">
              <div className="rmc-label" style={{ marginBottom: 8 }}>By instructor</div>
              {c.instructors.map((i) => (
                <button key={i.name} type="button" onClick={() => setFilter('instructor', filters.instructor === i.name ? '' : i.name)} aria-pressed={filters.instructor === i.name}
                  style={{ all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--grid-major)', font: '500 14px var(--font-mono)', color: filters.instructor === i.name ? 'var(--ruler)' : 'var(--text)' }}>
                  <span>{i.name} <span style={{ color: 'var(--text-2)' }}>· {i.reviewCount}</span></span>
                  <span style={{ font: '700 22px var(--font-display)', letterSpacing: '-0.02em' }}>{i.score != null ? fmt1(i.score) : '—'}<span style={{ fontSize: 12, color: 'var(--text-2)' }}> / 5.0</span></span>
                </button>
              ))}
            </div>
          ) : null}
          {!c.myReviewId ? (
            <div className="callout">
              <div style={{ fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' }}>TOOK {c.code}?</div>
              <p style={{ margin: '6px 0 16px', fontSize: 15, lineHeight: '22px' }}>Score it in about two minutes. Anonymous.</p>
              <Link to={`/classes/${c.id}/review`} className="callout-btn center">Rate this class</Link>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
