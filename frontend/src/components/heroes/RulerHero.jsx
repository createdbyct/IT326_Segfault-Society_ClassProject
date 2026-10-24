import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RulerNums, RulerTicks } from '../rmc/index.jsx';
import { fmt1, upcomingTerm } from '../../lib/format.js';
import { HeroSearch, prefersReducedMotion, verdictFor } from './shared.jsx';

/** Hero A — a giant ruler. Drag the blade and it snaps to the class closest to that score. */
export default function RulerHero({ classesList }) {
  const nav = useNavigate();
  const [value, setValue] = useState(4.6);
  const [dragging, setDragging] = useState(false);
  const [auto, setAuto] = useState(!prefersReducedMotion());
  const trackRef = useRef(null);
  const dragRef = useRef(false);
  const tour = useRef(0);

  const nearest = useMemo(() => {
    if (!classesList.length) return null;
    return classesList.reduce((best, c) => (Math.abs(c.score - value) < Math.abs(best.score - value) ? c : best), classesList[0]);
  }, [classesList, value]);

  useEffect(() => {
    if (!auto || classesList.length < 3) return undefined;
    const stops = [0, classesList.length - 1, Math.floor(classesList.length / 2), 2, classesList.length - 3, 1];
    const t = setInterval(() => {
      tour.current = (tour.current + 1) % stops.length;
      setValue(classesList[Math.min(stops[tour.current], classesList.length - 1)].score);
    }, 2600);
    return () => clearInterval(t);
  }, [auto, classesList]);

  const fromPointer = useCallback((clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const v = Math.max(0, Math.min(5, ((clientX - r.left) / r.width) * 5));
    setValue(Math.round(v * 10) / 10);
  }, []);
  const onDown = (e) => { setAuto(false); dragRef.current = true; setDragging(true); e.currentTarget.setPointerCapture?.(e.pointerId); fromPointer(e.clientX); };
  const onMove = (e) => { if (dragRef.current) fromPointer(e.clientX); };
  const onUp = () => { if (!dragRef.current) return; dragRef.current = false; setDragging(false); if (nearest) setValue(nearest.score); };
  const onKey = (e) => {
    const step = e.shiftKey ? 1 : 0.1;
    const d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[e.key];
    if (e.key === 'Enter' && nearest) { nav(`/classes/${nearest.id}`); return; }
    if (d === undefined) return;
    e.preventDefault(); setAuto(false);
    setValue((v) => Math.round(Math.max(0, Math.min(5, v + d)) * 10) / 10);
  };
  const pct = (value / 5) * 100;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <div className="hero-top">
          <div className="hero-copy">
            <div className="rmc-label eyebrow">Midstate University · {upcomingTerm()} registration</div>
            <h1 id="hero-title" className="hero-title">Measure twice.<br /><span>Enroll once.</span></h1>
            <p className="hero-lede">Honest scores from the students who already sat through it. Drag the blade to find a class at any score.</p>
          </div>
          <HeroSearch />
        </div>

        <div className="hero-stage">
          <div className="hero-readout-lane">
            <div className="hero-readout" style={{ left: `${pct}%`, transform: `translateX(-${pct}%)` }} aria-live="polite">
              {nearest ? (
                <Link to={`/classes/${nearest.id}`} className="hero-card rmc-guides">
                  <span className="rmc-label">{nearest.department} · {nearest.reviewCount} students</span>
                  <span className="hero-card-code">{nearest.code}</span>
                  <span className="hero-card-title">{nearest.title}</span>
                  <span className="hero-card-foot"><b>{fmt1(nearest.score)}</b> / 5.0 · {verdictFor(value)}</span>
                </Link>
              ) : <div className="hero-card skeleton" style={{ minHeight: 132 }} />}
            </div>
          </div>

          <div className={`hero-ruler${dragging ? ' is-dragging' : ''}`} role="slider" tabIndex={0}
            aria-label="Score blade. Use arrow keys to move, Enter to open the class." aria-valuemin={0} aria-valuemax={5} aria-valuenow={value}
            aria-valuetext={nearest ? `${fmt1(value)}: ${nearest.code}, ${nearest.title}, scored ${fmt1(nearest.score)}` : fmt1(value)}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}>
            <div className="hero-track" ref={trackRef}>
              <RulerTicks steps={10} />
              {classesList.map((c) => <span key={c.id} className="hero-pin" style={{ left: `${(c.score / 5) * 100}%` }} aria-hidden="true" />)}
              <span className={`hero-blade${dragging || !auto ? ' no-glide' : ''}`} style={{ left: `${pct}%` }} aria-hidden="true"><i /></span>
            </div>
            <RulerNums className="hero-ruler-nums" />
          </div>
          <div className="hero-hint mono-meta" aria-hidden="true">
            <span>← AVOID</span><span>{auto ? 'GRAB THE BLADE' : `READING ${fmt1(value)}`}</span><span>TAKE IT →</span>
          </div>
        </div>
      </div>
    </section>
  );
}
