import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { classes, me, meta, rankings, reviews as reviewsApi } from '../api/index.js';
import { Button, ReviewCard, StatRow, TickMeter } from '../components/rmc/index.jsx';
import { HERO_DEFAULT, HEROES } from '../components/heroes/index.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { fmt1, pad2 } from '../lib/format.js';
import { useApi, useTitle } from '../lib/useApi.js';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Home() {
  useTitle(null);
  const { user } = useAuth();
  const pool = useApi(() => classes.search({ sort: 'score', pageSize: 50 }), []);
  const stats = useApi(() => meta.stats(), []);
  const top = useApi(() => rankings.top({ limit: 3 }), []);
  const bottom = useApi(() => rankings.bottom({ limit: 3 }), []);
  const recent = useApi(() => reviewsApi.recent({ limit: 12 }), []);
  const scored = useMemo(() => (pool.data?.items || []).filter((c) => c.score != null), [pool.data]);
  // Pick the hero in components/heroes/index.js (HERO_DEFAULT), or preview another with ?hero=board|question|deck|ruler
  const [params] = useSearchParams();
  const heroKey = HEROES[params.get('hero')] ? params.get('hero') : HERO_DEFAULT;
  const Hero = HEROES[heroKey];
  const statsInHero = heroKey === 'question'; // the question hero shows the site numbers itself

  return (
    <main id="main" className="home">
      <Hero classesList={scored} reviews={recent.data || []} stats={stats.data} />

      {/* Below the hero: full-width bands on grid paper, alternating deep green and plain green, ending in yellow. */}
      {user ? (
        <section className="band band-yellow" aria-label="Your favorites">
          <div className="band-inner"><YourFavorites name={user.displayName} /></div>
        </section>
      ) : null}

      <section className="band band-mat" aria-labelledby="plan-title">
        <div className="band-inner">
          <div className="band-head">
            <h2 id="plan-title" className="h-section">Plan your semester</h2>
            <span className="rmc-label">Two quick tools</span>
          </div>
          <div className="home-tools">
            <WeighIn />
            <Roulette />
          </div>
        </div>
      </section>

      {!statsInHero ? (
      <section className="band band-deep" aria-label="Site numbers">
        <div className="band-inner">
          {stats.data ? (
            <StatRow items={[
              { value: stats.data.classes.toLocaleString(), label: 'Classes rated' },
              { value: stats.data.reviews.toLocaleString(), label: 'Scores logged' },
              { value: stats.data.departments.toLocaleString(), label: 'Departments' },
              { value: stats.data.reviewsThisTerm.toLocaleString(), label: 'Scored this term' },
            ]} />
          ) : <div className="skeleton" style={{ minHeight: 64 }} />}
        </div>
      </section>
      ) : null}

      <section className={`band ${statsInHero ? 'band-deep' : 'band-mat'}`} aria-labelledby="fresh">
        <div className="band-inner">
          <div className="band-head">
            <h2 id="fresh" className="h-section">Fresh reviews</h2>
            <span className="rmc-label">Latest from students</span>
          </div>
          <div className="home-reviews">
            {(recent.data || []).slice(0, 3).map((r) => (
              <div key={r.id} className="stack-sm" style={{ gap: 8 }}>
                <Link to={`/classes/${r.classId}`} className="home-review-class">{r.classCode} <span>{r.classTitle}</span></Link>
                <ReviewCard score={r.score} term={r.term} instructor={r.instructor} year={r.year} text={r.text} highlight={r.highlight} tags={r.tags.slice(0, 2)} helpful={r.helpful} helpfulPressed={r.helpfulByMe} />
              </div>
            ))}
            {!recent.data ? [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ minHeight: 220 }} />) : null}
          </div>
        </div>
      </section>

      <section className={`band ${statsInHero ? 'band-mat' : 'band-deep'}`} aria-labelledby="ranks-title">
        <div className="band-inner">
          <div className="band-head">
            <h2 id="ranks-title" className="h-section">The rankings</h2>
            <span className="rmc-label">Classes with 20+ scores</span>
          </div>
          <div className="home-ranks">
            <RankTeaser title="Top rated" to="/top" rows={top.data} tone="top" note="Highest scored" />
            <RankTeaser title="Lowest rated" to="/bottom" rows={bottom.data} tone="bottom" note="Lowest scored · and what helps" />
          </div>
        </div>
      </section>

      <section className="band band-ruler">
        <div className="band-inner home-cta">
          <div>
            <div className="rmc-label" style={{ color: 'var(--on-ruler)' }}>Pay it forward</div>
            <h2>Took a class last term?</h2>
            <p>Score it in about two minutes. Anonymous. The next student will thank you.</p>
          </div>
          <div className="row-wrap" style={{ gap: 12 }}>
            <Link to="/review" className="home-cta-btn">Rate a class</Link>
            {!user ? <Link to="/signup" className="home-cta-link">or create an account →</Link> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Semester weigh-in ---------------- */

const LOAD_KEY = 'rmc.weighin';
const SAMPLE = ['cs-240', 'math-147', 'psy-110', 'eng-101'];

function loadVerdict(h) {
  if (h === 0) return ['Nothing yet', 'Add the classes you are thinking about.'];
  if (h < 15) return ['Breezy', 'Room for a job, a club, and sleep.'];
  if (h < 25) return ['Balanced', 'A normal full-time semester.'];
  if (h < 35) return ['Heavy', 'Doable. Protect your weekends.'];
  if (h < 45) return ['Brutal', 'Something else in your life has to give.'];
  return ['Please reconsider', 'That is a second job. Swap one out.'];
}

function WeighIn() {
  const [picked, setPicked] = useState(() => { try { return JSON.parse(localStorage.getItem(LOAD_KEY)) || []; } catch { return []; } });
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const sugg = useApi(() => (q.trim().length >= 2 ? classes.search({ q: q.trim(), pageSize: 5, sort: 'reviews' }) : null), [q]);

  useEffect(() => { try { localStorage.setItem(LOAD_KEY, JSON.stringify(picked)); } catch { /* ignore */ } }, [picked]);

  const add = (c) => { if (!picked.some((p) => p.id === c.id) && picked.length < 6) setPicked([...picked, c]); setQ(''); setOpen(false); };
  const sample = async () => {
    const out = await Promise.all(SAMPLE.map((id) => classes.get(id).catch(() => null)));
    setPicked(out.filter(Boolean));
  };
  const hoursOf = (c) => c.hoursPerWeek ?? (c.workload != null ? Math.round(c.workload * 2) : 5);
  const hours = picked.reduce((s, c) => s + hoursOf(c), 0);
  const credits = picked.reduce((s, c) => s + (c.credits || 0), 0);
  const [word, note] = loadVerdict(hours);
  const pct = Math.min(100, (hours / 50) * 100);

  return (
    <div className="panel rmc-guides weighin">
      <div className="between" style={{ alignItems: 'baseline' }}>
        <h2 className="h-panel">Weigh your semester</h2>
        <span className="rmc-label">Up to 6 classes</span>
      </div>
      <p className="hint" style={{ margin: '6px 0 16px', fontSize: 15 }}>Stack your schedule and see how many hours a week it really costs, from what students reported.</p>

      <div className="weighin-add">
        <label className="field"><span className="sr-only">Add a class</span>
          <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={picked.length >= 6 ? 'That is plenty.' : 'Add a class: CS 240, Calculus…'} disabled={picked.length >= 6} role="combobox" aria-expanded={open && !!sugg.data?.items.length} aria-controls="weighin-list" /></label>
        {open && sugg.data?.items.length ? (
          <ul id="weighin-list" className="weighin-list" role="listbox">
            {sugg.data.items.map((c) => (
              <li key={c.id} role="option" aria-selected="false"><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(c)}><b>{c.code}</b> {c.title}</button></li>
            ))}
          </ul>
        ) : null}
      </div>

      {picked.length ? (
        <ul className="weighin-rows">
          {picked.map((c) => (
            <li key={c.id}>
              <Link to={`/classes/${c.id}`}><b>{c.code}</b></Link>
              <TickMeter kind="workload" value={c.workload} label="LOAD" />
              <span className="weighin-h">~{hoursOf(c)} h</span>
              <button type="button" className="weighin-x" aria-label={`Remove ${c.code}`} onClick={() => setPicked(picked.filter((p) => p.id !== c.id))}>×</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="weighin-empty">
          <span>Nothing on the scale yet.</span>
          <Button variant="text" size="sm" onClick={sample}>Try a sample schedule</Button>
        </div>
      )}

      <div className="weighin-scale" aria-label={`About ${hours} hours a week outside class: ${word}`} role="img">
        <div className="weighin-bar"><span style={{ width: `${pct}%` }} /></div>
        <div className="rmc-ruler-nums" aria-hidden="true">{[0, 10, 20, 30, 40, 50].map((n) => <span key={n} style={{ left: `${n * 2}%` }}>{n}h</span>)}</div>
      </div>
      <div className="weighin-result">
        <div><span className="weighin-total">{hours}</span><span className="weighin-unit"> h / week</span></div>
        <div style={{ textAlign: 'right' }}>
          <div className="weighin-word">{word}</div>
          <div className="hint">{credits ? `${credits} credits · ` : ''}{note}</div>
        </div>
      </div>
      {picked.length ? <Button variant="text" size="sm" onClick={() => setPicked([])}>Clear the scale</Button> : null}
    </div>
  );
}

/* ---------------- Light-load roulette ---------------- */

function Roulette() {
  const pool = useApi(() => classes.search({ minScore: 4, maxWorkload: 3, sort: 'score', pageSize: 50 }), []);
  const [shown, setShown] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearInterval(timer.current), []);
  const items = pool.data?.items || [];

  const spin = () => {
    if (!items.length || spinning) return;
    const final = items[Math.floor(Math.random() * items.length)];
    if (prefersReducedMotion()) { setShown(final); return; }
    setSpinning(true);
    let n = 0;
    timer.current = setInterval(() => {
      n += 1;
      setShown(items[n % items.length]);
      if (n > 14) { clearInterval(timer.current); setShown(final); setSpinning(false); }
    }, 70 + n * 4);
  };

  return (
    <div className="roulette">
      <div className="rmc-label" style={{ color: 'var(--on-ruler)' }}>Light-load roulette</div>
      <h2>Need a gen-ed that won't eat your week?</h2>
      <p>Spins only classes scored 4.0+ with a workload of 3 or less.</p>
      <div className={`roulette-window${spinning ? ' is-spinning' : ''}`} aria-live="polite">
        {shown ? (
          <>
            <span className="roulette-code">{shown.code}</span>
            <span className="roulette-title">{shown.title}</span>
            <span className="roulette-meta">{fmt1(shown.score)} / 5.0 · WORKLOAD {fmt1(shown.workload)}</span>
          </>
        ) : <span className="roulette-title">{items.length ? `${items.length} classes in the drum` : 'Loading the drum…'}</span>}
      </div>
      <div className="row-wrap" style={{ gap: 10 }}>
        <button type="button" className="roulette-btn" onClick={spin} disabled={!items.length || spinning}>{spinning ? 'Spinning…' : shown ? 'Spin again' : 'Spin'}</button>
        {shown && !spinning ? <Link to={`/classes/${shown.id}`} className="roulette-link">See {shown.code} →</Link> : null}
      </div>
    </div>
  );
}

/* ---------------- Top / bottom teaser ---------------- */

function RankTeaser({ title, to, rows, tone, note }) {
  return (
    <div className="panel">
      <div className="between" style={{ alignItems: 'baseline', marginBottom: 6 }}>
        <h2 className="h-panel">{title}</h2>
        <Link to={to} style={{ font: '700 12px var(--font-mono)', letterSpacing: '0.08em' }}>SEE ALL 10 →</Link>
      </div>
      <div className="rmc-label" style={{ marginBottom: 8 }}>{note}</div>
      {(rows || [null, null, null]).map((r, i) => (r ? (
        <Link key={r.id} to={`/classes/${r.id}`} className="teaser-row">
          <span className="teaser-rank" style={{ color: tone === 'top' ? 'var(--ruler)' : 'var(--text-2)' }}>{pad2(r.rank)}</span>
          <span className="teaser-name"><b>{r.code}</b><span>{tone === 'bottom' && r.tip ? r.tip : r.title}</span></span>
          <span className="score-chip">{fmt1(r.score)}</span>
        </Link>
      ) : <div key={i} className="skeleton" style={{ minHeight: 56, marginTop: 8 }} />))}
    </div>
  );
}

/* ---------------- Signed in: your favorites ---------------- */

function YourFavorites({ name }) {
  const favs = useApi(() => me.favorites(), []);
  const list = favs.data || [];
  return (
    <section className="panel rmc-guides home-favs" aria-labelledby="your-favs">
      <div className="between" style={{ alignItems: 'baseline', marginBottom: 14 }}>
        <div>
          <div className="rmc-label eyebrow">Welcome back, {name}</div>
          <h2 id="your-favs" className="h-panel" style={{ marginTop: 6 }}>Your favorites</h2>
        </div>
        <Link to="/favorites" style={{ font: '700 12px var(--font-mono)', letterSpacing: '0.08em' }}>{list.length ? `SEE ALL ${list.length} →` : 'FAVORITES →'}</Link>
      </div>
      {!favs.data ? <div className="skeleton" style={{ minHeight: 84 }} /> : list.length === 0 ? (
        <p className="hint" style={{ margin: 0, fontSize: 15 }}>Nothing saved yet. Tap the bookmark on any class to keep it here. <Link to="/search">Find a class →</Link></p>
      ) : (
        <div className="home-favs-row">
          {list.slice(0, 4).map((c) => (
            <Link key={c.id} to={`/classes/${c.id}`} className="home-fav">
              <span className="home-fav-code">{c.code}</span>
              <span className="home-fav-title">{c.title}</span>
              <span className="home-fav-score">{c.score != null ? <><b>{fmt1(c.score)}</b> / 5.0</> : 'Not enough scores yet'}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
