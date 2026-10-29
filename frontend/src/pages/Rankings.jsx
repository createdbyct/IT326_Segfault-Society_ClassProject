import { useState } from 'react';
import { Link } from 'react-router-dom';
import { meta, rankings } from '../api/index.js';
import { ScoreRuler, Tag } from '../components/rmc/index.jsx';
import { Empty, ErrorState, Loading } from '../components/States.jsx';
import { pad2, upcomingTerm } from '../lib/format.js';
import { useApi, useTitle } from '../lib/useApi.js';

/** Top 10 and Bottom 10 share this page. dir = "top" | "bottom". */
export default function Rankings({ dir }) {
  const top = dir === 'top';
  useTitle(top ? 'Top 10 classes' : 'Bottom 10 classes');
  const [department, setDepartment] = useState('');
  const depts = useApi(() => meta.departments(), []);
  const rows = useApi(() => (top ? rankings.top : rankings.bottom)({ department, limit: 10 }), [dir, department]);

  return (
    <main id="main" className="page rmc-fade" key={dir}>
      <div className="split-aside" style={{ gridTemplateColumns: `minmax(0, 1fr) ${top ? 400 : 420}px`, gap: 48, alignItems: 'end' }}>
        <div>
          <div className="rmc-label eyebrow">Midstate University · {upcomingTerm()}</div>
          {top ? <h1 className="h-xxl">TOP 10<br />CLASSES</h1> : (
            <>
              <h1 className="h-xxl">BOTTOM 10</h1>
              <div style={{ marginTop: 14, font: '700 15px var(--font-mono)', letterSpacing: '0.14em', color: 'var(--ruler)' }}>PROCEED WITH CAUTION — AND A PLAN</div>
            </>
          )}
        </div>
        {top ? (
          <p style={{ margin: 0, fontSize: 18, lineHeight: '28px', color: 'var(--text-2)' }}>The ten highest-scored classes this year. Only classes with at least <strong style={{ color: 'var(--text)' }}>20 student scores</strong> make the list, so one great semester can't game it.</p>
        ) : (
          <div className="panel panel-tight rmc-guides">
            <div className="rmc-label eyebrow" style={{ marginBottom: 8 }}>Read this first</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: '23px' }}>A low score is about the class, not a verdict on a person. It means students found it hard to get through. Every class here lists what helped the students who passed.</p>
          </div>
        )}
      </div>

      <div className="row-wrap" style={{ marginTop: 32 }}>
        <span className="rmc-label" style={{ marginRight: 8 }}>Department</span>
        <Tag selected={!department} onToggle={() => setDepartment('')}>All</Tag>
        {(depts.data || []).map((d) => <Tag key={d} selected={department === d} onToggle={() => setDepartment(department === d ? '' : d)}>{d}</Tag>)}
      </div>

      <div style={{ marginTop: 28 }} aria-live="polite">
        {rows.error ? <ErrorState error={rows.error} onRetry={rows.reload} /> : !rows.data ? <Loading rows={5} height={110} /> : rows.data.length === 0 ? (
          <Empty title="Not enough scores yet">No {department || ''} classes have 20 or more scores yet.</Empty>
        ) : (
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, opacity: rows.loading ? 0.6 : 1 }} className="stack-sm">
            {rows.data.map((r) => (
              <li key={r.id} className="rank">
                <span className="rank-num" style={{ color: top ? 'var(--ruler)' : 'var(--text)' }} aria-label={`Rank ${r.rank}`}>{pad2(r.rank)}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="rmc-label">{r.department} · {r.reviewCount} students{top && r.topInstructor ? ` · ${r.topInstructor}` : ''}</div>
                  <Link to={`/classes/${r.id}`} className="rank-code">{r.code} <span>{r.title}</span></Link>
                  {top ? (r.quote ? <div style={{ fontSize: 15, color: 'var(--text-2)', marginTop: 6 }}>“{r.quote}”</div> : null) : r.tip ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'baseline' }}><span className="chip">WHAT HELPS</span><span style={{ fontSize: 15 }}>{r.tip}</span></div>
                  ) : null}
                </div>
                <ScoreRuler score={r.score} size="sm" />
              </li>
            ))}
          </ol>
        )}
      </div>
      <p className="mono-meta" style={{ margin: '20px 0 0' }}>{top ? 'TIES BROKEN BY NUMBER OF SCORES · UPDATED NIGHTLY' : 'MIN. 20 SCORES · LOWEST FIRST · UPDATED NIGHTLY'}</p>
    </main>
  );
}
