import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { me } from '../api/index.js';
import { Button, CourseCard, StatRow, Tag } from '../components/rmc/index.jsx';
import { Empty, ErrorState, Loading } from '../components/States.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../lib/toast.jsx';
import { fmt1, pct, shortDate } from '../lib/format.js';
import { useApi, useTitle } from '../lib/useApi.js';

const SORTS = [
  ['saved', 'Recently saved', (a, b) => b.savedAt.localeCompare(a.savedAt)],
  ['score', 'Highest score', (a, b) => (b.score ?? -1) - (a.score ?? -1)],
  ['workload', 'Lightest workload', (a, b) => (a.workload ?? 9) - (b.workload ?? 9)],
  ['code', 'Course number', (a, b) => a.code.localeCompare(b.code, 'en', { numeric: true })],
];

export default function Favorites() {
  useTitle('Favorites');
  const toast = useToast();
  const { refresh } = useAuth();
  const favs = useApi(() => me.favorites(), []);
  const [sort, setSort] = useState('saved');
  const [picked, setPicked] = useState([]);
  const [comparing, setComparing] = useState(false);

  const list = useMemo(() => [...(favs.data || [])].sort(SORTS.find(([k]) => k === sort)[2]), [favs.data, sort]);
  const chosen = list.filter((c) => picked.includes(c.id));

  const remove = async (c) => {
    try {
      await me.removeFavorite(c.id);
      favs.setData((d) => d.filter((x) => x.id !== c.id));
      setPicked((p) => p.filter((x) => x !== c.id));
      refresh();
      toast(`${c.code} removed`);
    } catch (e) { toast(e.message); }
  };
  const togglePick = (id, on) => setPicked((p) => (on ? [...p, id].slice(-3) : p.filter((x) => x !== id)));

  return (
    <main id="main" className="page rmc-fade">
      <div className="between" style={{ alignItems: 'end', gap: 24 }}>
        <div>
          <div className="rmc-label eyebrow">Saved classes · {favs.data ? favs.data.length : '…'}</div>
          <h1 className="h-xl">Favorites</h1>
          <p className="lede" style={{ maxWidth: 600 }}>Classes you're eyeing for next semester. Compare them side by side before you register.</p>
        </div>
        <Button variant="outline" disabled={chosen.length < 2} onClick={() => setComparing((v) => !v)}>
          {comparing ? 'Hide comparison' : `Compare ${chosen.length || ''} selected`.replace('  ', ' ')}
        </Button>
      </div>

      {comparing && chosen.length >= 2 ? (
        <section aria-label="Comparison" className="panel rmc-guides" style={{ marginTop: 24, overflowX: 'auto' }}>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${chosen.length}, minmax(220px, 1fr))`, gap: 20 }}>
            {chosen.map((c) => (
              <div key={c.id} className="stack-sm">
                <Link to={`/classes/${c.id}`} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 700, fontSize: 32, letterSpacing: '-0.03em' }}>{c.code}</Link>
                <div style={{ color: 'var(--text-2)' }}>{c.title}</div>
                <StatRow items={[{ value: c.score != null ? fmt1(c.score) : '—', label: 'Score' }, { value: fmt1(c.workload), label: 'Workload' }, { value: pct(c.retakePct), label: 'Retake' }]} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="panel between" style={{ marginTop: 28, padding: '12px 16px' }}>
        <div className="row-wrap">
          <span className="rmc-label" style={{ marginRight: 6 }}>Sort</span>
          {SORTS.map(([k, l]) => <Tag key={k} selected={sort === k} onToggle={() => setSort(k)}>{l}</Tag>)}
        </div>
        <span className="mono-meta" style={{ fontWeight: 700 }}>PICK 2–3 CLASSES TO COMPARE</span>
      </div>

      <div style={{ marginTop: 20 }}>
        {favs.error ? <ErrorState error={favs.error} onRetry={favs.reload} /> : !favs.data ? <Loading rows={2} height={280} /> : list.length === 0 ? (
          <Empty title="No favorites yet" action={<Button size="sm" to="/search">Find a class</Button>}>Tap the bookmark on any class to save it here.</Empty>
        ) : (
          <div className="favgrid">
            {list.map((c) => (
              <div key={c.id} className="fav">
                <CourseCard code={c.code} title={c.title} department={c.department} score={c.score} reviewCount={c.reviewCount}
                  wouldRetakePct={c.retakePct} workload={c.workload} difficulty={c.difficulty} quote={c.quote} highlight={c.highlight} to={`/classes/${c.id}`} />
                <div className="fav-bar">
                  <label className="chk-inline" style={{ font: '700 12px var(--font-mono)', letterSpacing: '0.08em', minHeight: 44 }}>
                    <input type="checkbox" checked={picked.includes(c.id)} onChange={(e) => togglePick(c.id, e.target.checked)} />COMPARE
                  </label>
                  <span className="mono-meta">SAVED {shortDate(c.savedAt)}</span>
                  <Button variant="text" size="sm" onClick={() => remove(c)}>Remove</Button>
                </div>
              </div>
            ))}
            <Link to="/search" className="add-tile">
              <span style={{ font: '700 48px var(--font-display)', lineHeight: 1, color: 'var(--ruler)' }}>+</span>
              <span style={{ fontWeight: 700, fontSize: 22 }}>Find more classes</span>
              <span style={{ fontSize: 15, color: 'var(--text-2)' }}>Tap the bookmark on any class page to save it here.</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
