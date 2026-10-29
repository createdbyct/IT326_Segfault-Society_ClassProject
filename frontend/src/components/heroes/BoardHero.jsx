import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fmt1, upcomingTerm } from '../../lib/format.js';
import { HeroSearch, prefersReducedMotion } from './shared.jsx';

/** Hero B — an airport-style split-flap board. Every few seconds the rows flip to the next set of classes. */
const ROWS = 5;
const W = { code: 8, title: 20, score: 3, status: 10 };

const status = (s) => (s >= 4.5 ? ['TAKE IT', 'go'] : s >= 3.8 ? ['SOLID', 'ok'] : s >= 3 ? ['FAIR', 'meh'] : ['PLAN AHEAD', 'warn']);
const fit = (str, n) => (str.length > n ? `${str.slice(0, n - 1)}…` : str.padEnd(n, ' '));

function Flaps({ text, width, delay = 0 }) {
  return (
    <span className="flaps" aria-hidden="true">
      {fit(text.toUpperCase(), width).split('').map((ch, i) => (
        // keying by character remounts the cell when it changes, which replays the flip
        <span key={`${i}-${ch}`} className="flap" style={{ animationDelay: `${delay + i * 22}ms` }}>{ch === ' ' ? ' ' : ch}</span>
      ))}
    </span>
  );
}

export default function BoardHero({ classesList }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(classesList.length / ROWS));
  useEffect(() => {
    if (prefersReducedMotion() || pages < 2) return undefined;
    const t = setInterval(() => setPage((p) => (p + 1) % pages), 5200);
    return () => clearInterval(t);
  }, [pages]);
  const rows = useMemo(() => {
    const list = classesList.slice(page * ROWS, page * ROWS + ROWS);
    return list.length ? list : classesList.slice(0, ROWS);
  }, [classesList, page]);

  return (
    <section className="hero hero-board" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-top">
          <div className="hero-copy">
            <div className="rmc-label eyebrow">Midstate University · {upcomingTerm()} registration</div>
            <h1 id="hero-title" className="hero-title">Next semester<br /><span>is boarding.</span></h1>
            <p className="hero-lede">Check the board before you commit. Every score comes from students who already took the class.</p>
          </div>
          <HeroSearch />
        </div>

        <div className="board" role="table" aria-label="Class scores board" aria-live="off">
          <div className="board-head" role="row">
            <span role="columnheader">Class</span><span role="columnheader" className="board-col-title">Title</span>
            <span role="columnheader">Score</span><span role="columnheader">Status</span>
          </div>
          {rows.map((c, r) => {
            const [label, tone] = status(c.score);
            return (
              <Link key={`${page}-${c.id}`} to={`/classes/${c.id}`} className="board-row" role="row"
                aria-label={`${c.code}, ${c.title}, scored ${fmt1(c.score)}, ${label.toLowerCase()}`}>
                <span role="cell" className="board-code"><Flaps text={c.code} width={W.code} delay={r * 90} /></span>
                <span role="cell" className="board-col-title"><Flaps text={c.title} width={W.title} delay={r * 90 + 120} /></span>
                <span role="cell" className="board-score"><Flaps text={fmt1(c.score)} width={W.score} delay={r * 90 + 260} /></span>
                <span role="cell" className={`board-status is-${tone}`}><Flaps text={label} width={W.status} delay={r * 90 + 320} /></span>
              </Link>
            );
          })}
          <div className="board-foot mono-meta">
            <span>Page {page + 1} of {pages}</span>
            <span className="row-wrap" style={{ gap: 6 }}>
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} type="button" className={`board-dot${i === page ? ' is-on' : ''}`} aria-label={`Show page ${i + 1}`} onClick={() => setPage(i)} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
