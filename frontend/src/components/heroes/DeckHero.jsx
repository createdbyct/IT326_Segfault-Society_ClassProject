import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { me } from '../../api/index.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useToast } from '../../lib/toast.jsx';
import { ScoreRuler, withHighlight } from '../rmc/index.jsx';
import { upcomingTerm } from '../../lib/format.js';
import { HeroSearch } from './shared.jsx';

/** Hero D — a deck of class cards. Swipe (or use the buttons / arrow keys): left skips, right saves to favorites. */
export default function DeckHero({ classesList }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const deck = useMemo(() => classesList.filter((c) => c.reviewCount >= 15).slice(0, 12), [classesList]);
  const [idx, setIdx] = useState(0);
  const [fling, setFling] = useState(null); // 'left' | 'right'
  const [dx, setDx] = useState(0);
  const start = useRef(null);
  const stageRef = useRef(null);

  const go = async (dir) => {
    if (fling || !deck.length) return;
    const c = deck[idx % deck.length];
    if (dir === 'right') {
      if (!user) { nav(`/signin?next=${encodeURIComponent(loc.pathname)}`); return; }
      me.addFavorite(c.id).then(() => toast(`${c.code} saved to favorites`)).catch((e) => toast(e.message));
    }
    setFling(dir);
    setTimeout(() => { setIdx((i) => i + 1); setFling(null); setDx(0); }, 320);
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const onKey = (e) => { if (e.key === 'ArrowLeft') go('left'); if (e.key === 'ArrowRight') go('right'); };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  });

  const onDown = (e) => { if (e.target.closest('a,button')) return; start.current = e.clientX; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const onMove = (e) => { if (start.current != null) setDx(e.clientX - start.current); };
  const onUp = () => {
    if (start.current == null) return;
    start.current = null;
    if (dx > 110) go('right'); else if (dx < -110) go('left'); else setDx(0);
  };

  const visible = deck.length ? [0, 1, 2].map((k) => deck[(idx + k) % deck.length]) : [];

  return (
    <section className="hero hero-deck" aria-labelledby="hero-title">
      <div className="hero-inner deck-grid">
        <div>
          <div className="rmc-label eyebrow">Midstate University · {upcomingTerm()} registration</div>
          <h1 id="hero-title" className="hero-title deck-title">Swipe your<br /><span>schedule.</span></h1>
          <p className="hero-lede">Right to save a class to your favorites, left to skip. Every score comes from students who took it.</p>
          <HeroSearch className="deck-search" />
        </div>

        <div className="deck-stage" ref={stageRef} tabIndex={0} aria-label="Class deck. Left arrow skips, right arrow saves.">
          <div className="deck" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            {visible.slice().reverse().map((c, rIdx) => {
              const depth = visible.length - 1 - rIdx; // 0 = top card
              const top = depth === 0;
              const style = top
                ? { transform: fling ? `translateX(${fling === 'right' ? 140 : -140}%) rotate(${fling === 'right' ? 18 : -18}deg)` : `translateX(${dx}px) rotate(${dx / 18}deg)`, transition: start.current != null ? 'none' : undefined, opacity: fling ? 0 : 1 }
                : { transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05}) rotate(${depth % 2 ? 3 : -3}deg)` };
              return (
                <article key={`${c.id}-${idx}-${depth}`} className={`deck-card rmc-guides${top ? ' is-top' : ''}`} style={style} aria-hidden={!top}>
                  {top && dx > 40 ? <span className="deck-stamp is-save">SAVE</span> : null}
                  {top && dx < -40 ? <span className="deck-stamp is-skip">SKIP</span> : null}
                  <div className="between"><span className="rmc-label">{c.department}</span><span className="rmc-label">{c.reviewCount} students</span></div>
                  <Link to={`/classes/${c.id}`} className="deck-code" tabIndex={top ? 0 : -1}>{c.code}</Link>
                  <div className="deck-card-title">{c.title}</div>
                  <ScoreRuler score={c.score} size="sm" />
                  {c.quote ? <p className="deck-quote">“{withHighlight(c.quote, c.highlight)}”</p> : null}
                </article>
              );
            })}
          </div>
          <div className="deck-actions">
            <button type="button" className="deck-btn" onClick={() => go('left')} aria-label="Skip this class">← Skip</button>
            <span className="mono-meta">{deck.length ? `${(idx % deck.length) + 1} / ${deck.length}` : ''}</span>
            <button type="button" className="deck-btn is-save" onClick={() => go('right')} aria-label="Save this class to favorites">Save ★</button>
          </div>
        </div>
      </div>
    </section>
  );
}
