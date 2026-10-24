import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../rmc/index.jsx';

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Search box used by every hero. Sends the query to /search. */
export function HeroSearch({ big = false, label = 'Find a class', placeholder = 'CS 240, Intro to Psych…', className = '' }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form role="search" className={`hero-search${big ? ' is-big' : ''} ${className}`}
      onSubmit={(e) => { e.preventDefault(); nav(`/search${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`); }}>
      <label className="field"><span className={big ? 'sr-only' : 'rmc-label'}>{label}</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} /></label>
      <Button size="lg" type="submit">Search</Button>
    </form>
  );
}

export const verdictFor = (v) => (v >= 4.5 ? 'Take it.' : v >= 3.8 ? 'Solid pick.' : v >= 3 ? 'Fair. Bring snacks.' : v >= 2.5 ? 'Proceed with a plan.' : 'Godspeed.');
