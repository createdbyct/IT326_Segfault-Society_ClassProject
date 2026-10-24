import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { me, reviews as reviewsApi } from '../api/index.js';
import { Button, StatRow } from '../components/rmc/index.jsx';
import { Empty, ErrorState, Loading } from '../components/States.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../lib/toast.jsx';
import { fmt1, initials, monthYear } from '../lib/format.js';
import { useApi, useTitle } from '../lib/useApi.js';

export default function Account() {
  useTitle('Your account');
  const { user, signOut, refresh } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const mine = useApi(() => me.reviews(), []);
  const favs = useApi(() => me.favorites(), []);
  const todo = useApi(() => me.toScore(), []);
  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (r) => {
    if (!window.confirm(`Delete your review of ${r.classCode}? This can't be undone.`)) return;
    try { await reviewsApi.remove(r.id); mine.setData((d) => d.filter((x) => x.id !== r.id)); refresh(); toast('Review deleted'); } catch (e) { toast(e.message); }
  };
  const out = async () => { await signOut(); nav('/'); };

  const stats = [
    { value: String(user.stats.reviews), label: 'Reviews written' },
    { value: String(user.stats.helpful), label: 'Helpful votes' },
    { value: String(user.stats.favorites), label: 'Favorites' },
    { value: String(user.stats.classesAdded), label: 'Classes added' },
  ];

  return (
    <main id="main" className="page rmc-fade">
      <section className="panel rmc-guides profile-card">
        <div className="avatar" aria-hidden="true">{initials(user.displayName)}</div>
        <div style={{ minWidth: 0 }}>
          <div className="rmc-label eyebrow">{user.verified ? 'Verified student' : 'Email not verified yet'} · {user.school}</div>
          <h1 style={{ margin: '8px 0 0', fontWeight: 700, fontSize: 'clamp(40px, 6vw, 56px)', lineHeight: 0.95, letterSpacing: '-0.04em', overflowWrap: 'anywhere' }}>{user.displayName}</h1>
          <p className="mono-meta" style={{ margin: '10px 0 0', fontSize: 14 }}>{[user.major, user.classYear ? `CLASS OF ${user.classYear}` : null, `MEMBER SINCE ${monthYear(user.memberSince)}`].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="row-wrap" style={{ gap: 12 }}>
          <Button variant="outline" to="/account/edit">Edit account</Button>
          <Button variant="text" onClick={out}>Sign out</Button>
        </div>
      </section>

      <div style={{ marginTop: 24 }}><StatRow items={stats} /></div>

      <div className="split-aside" style={{ marginTop: 48 }}>
        <section aria-labelledby="mine">
          <div className="between" style={{ alignItems: 'end', marginBottom: 16 }}>
            <h2 id="mine" className="h-section">My reviews</h2><span className="rmc-label">Only you see this list</span>
          </div>
          {mine.error ? <ErrorState error={mine.error} onRetry={mine.reload} /> : !mine.data ? <Loading rows={4} height={90} /> : mine.data.length === 0 ? (
            <Empty title="No reviews yet" action={<Button size="sm" to="/review">Rate a class</Button>}>Score a class you've taken. It takes about two minutes.</Empty>
          ) : (
            <div className="stack-sm">
              {mine.data.map((r) => (
                <div key={r.id} className="myrev">
                  <div>
                    <Link to={`/classes/${r.classId}`} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em' }}>{r.classCode}</Link>
                    <div style={{ marginTop: 6 }}><span className="score-chip">{r.score} / 5</span></div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="rmc-label">{r.term} · {r.instructor} · {r.helpful} found it helpful</div>
                    <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: '24px' }}>{r.text}</p>
                  </div>
                  <div className="row-wrap" style={{ gap: 4 }}>
                    <Button variant="text" size="sm" to={`/classes/${r.classId}/review?edit=${r.id}`}>Edit</Button>
                    <Button variant="text" size="sm" onClick={() => remove(r)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="stack">
          {todo.data && todo.data.length ? (
            <div className="callout">
              <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>SCORE THESE NEXT</div>
              <p style={{ margin: '6px 0 14px', fontSize: 15, lineHeight: '22px' }}>Classes you took last term that you haven't scored yet.</p>
              <div className="stack-sm" style={{ gap: 8 }}>
                {todo.data.map((c) => <Link key={c.id} to={`/classes/${c.id}/review`} className="callout-btn">{c.code} <span style={{ font: '700 12px var(--font-mono)' }}>SCORE →</span></Link>)}
              </div>
            </div>
          ) : null}
          <div className="panel panel-tight">
            <div className="between" style={{ marginBottom: 8 }}>
              <span className="rmc-label">Favorites</span>
              <Link to="/favorites" style={{ font: '700 12px var(--font-mono)', letterSpacing: '0.08em' }}>SEE ALL{favs.data ? ` ${favs.data.length}` : ''} →</Link>
            </div>
            {!favs.data ? <Loading rows={1} height={60} /> : favs.data.length === 0 ? <p className="hint">Nothing saved yet. Tap the bookmark on any class.</p> : favs.data.slice(0, 3).map((f) => (
              <Link key={f.id} to={`/classes/${f.id}`} className="divider-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', color: 'var(--text)', textDecoration: 'none' }}>
                <span style={{ fontWeight: 700 }}>{f.code}</span>
                <span style={{ font: '700 18px var(--font-display)' }}>{f.score != null ? fmt1(f.score) : '—'}<span style={{ fontSize: 12, color: 'var(--text-2)' }}> / 5.0</span></span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
