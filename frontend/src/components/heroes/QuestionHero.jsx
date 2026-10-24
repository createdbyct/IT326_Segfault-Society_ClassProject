import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HeroSearch, prefersReducedMotion } from './shared.jsx';

/** Hero C — one big question, one big search box, and real review lines drifting past underneath. */

// Where the site numbers sit in this hero. Preview the others with ?stats=bar | inline | eyebrow.
export const STATS_DEFAULT = 'inline';

const CODES = ['CS 240', 'Calculus II', 'PSY 110', 'Gen Chem', 'ENG 101', 'Statistics'];

export default function QuestionHero({ reviews = [], stats }) {
  const [params] = useSearchParams();
  const statsStyle = ['bar', 'inline', 'eyebrow'].includes(params.get('stats')) ? params.get('stats') : STATS_DEFAULT;
  const items = stats ? [
    [stats.classes, 'Classes rated'], [stats.reviews, 'Scores logged'], [stats.departments, 'Departments'], [stats.reviewsThisTerm, 'Scored this term'],
  ] : null;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % CODES.length), 2200);
    return () => clearInterval(t);
  }, []);
  const lines = reviews.map((r) => ({ id: r.id, classId: r.classId, code: r.classCode, score: r.score, text: r.text.split(/(?<=[.!?])\s/)[0] }));
  const half = Math.ceil(lines.length / 2);
  const rows = [lines.slice(0, half), lines.slice(half)].filter((x) => x.length);

  return (
    <section className="hero hero-question" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="rmc-label eyebrow" style={{ textAlign: 'center' }}>
          {statsStyle === 'eyebrow' && stats
            ? <>{stats.reviews.toLocaleString()} scores from real students · {stats.classes} classes · {stats.departments} departments</>
            : 'Rate My Classes · scores from real students'}
        </div>
        <h1 id="hero-title" className="hero-title hero-q-title">What are you taking<br /><span>next semester?</span></h1>
        <HeroSearch big placeholder={`Try “${CODES[i]}”`} className="hero-q-search" />
        <p className="hero-q-sub mono-meta">Or browse the <Link to="/top">top 10</Link> · <Link to="/bottom">bottom 10</Link> · <Link to="/search?all=1">every class</Link></p>
        {statsStyle === 'inline' && items ? (
          <dl className="hero-stats-inline">
            {items.map(([v, l]) => <div key={l}><dd>{v.toLocaleString()}</dd><dt>{l}</dt></div>)}
          </dl>
        ) : null}
      </div>
      <div className="marquee-wrap" aria-label="Recent review lines">
        {rows.map((row, r) => (
          <div key={r} className={`marquee${r % 2 ? ' is-reverse' : ''}`}>
            <div className="marquee-track">
              {[...row, ...row].map((l, k) => (
                <Link key={`${l.id}-${k}`} to={`/classes/${l.classId}`} className="quote-chip" tabIndex={k >= row.length ? -1 : 0} aria-hidden={k >= row.length}>
                  <b>{l.code}</b><span className="score-chip">{l.score}/5</span><span>“{l.text}”</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      {statsStyle === 'bar' && items ? (
        <div className="hero-stats-bar">
          <dl>{items.map(([v, l]) => <div key={l}><dd>{v.toLocaleString()}</dd><dt>{l}</dt></div>)}</dl>
        </div>
      ) : null}
      <a href="#main" className="scroll-cue" onClick={(e) => { e.preventDefault(); e.currentTarget.closest('.hero')?.nextElementSibling?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }}>
        <span>Scroll</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </a>
    </section>
  );
}
