import { Link } from 'react-router-dom';
import { Button } from '../components/rmc/index.jsx';
import { PROJECT, TEAM } from '../content/about.js';
import { initials } from '../lib/format.js';
import { useTitle } from '../lib/useApi.js';

const WHY = [
  ['Classes, not people', 'Most rating sites score professors. We wanted to score the class itself: the workload, the difficulty, and whether students would take it again.'],
  ['Before you register', 'Registration is a guess. A few honest numbers from students who already sat through it make that guess a lot better.'],
  ['Fair by design', 'Reviews are anonymous, scores only show once 5 students have rated a class, and the top and bottom 10 need at least 20 scores.'],
];

export default function About() {
  useTitle('About');
  return (
    <main id="main" className="page rmc-fade">
      <div className="rmc-label eyebrow">About · {PROJECT.course} class project</div>
      <h1 className="h-xl">Who made this</h1>
      <p className="lede" style={{ maxWidth: 720 }}>
        Rate My Classes was built by <strong style={{ color: 'var(--text)' }}>{PROJECT.team}</strong>, a student team in {PROJECT.course}, as our {PROJECT.term} class project.
        It's a working app with real accounts and reviews, built to practise taking a product from requirements to a deployed site.
      </p>

      <section className="about-grid" aria-label="Why we built it">
        {WHY.map(([t, d], i) => (
          <div key={t} className="panel">
            <span className="q-num">0{i + 1}</span>
            <h2 className="h-panel" style={{ margin: '8px 0 8px' }}>{t}</h2>
            <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: '24px' }}>{d}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="team" style={{ marginTop: 56 }}>
        <div className="between" style={{ alignItems: 'end', marginBottom: 16 }}>
          <h2 id="team" className="h-section">The team</h2>
          <span className="rmc-label">{PROJECT.team} · {PROJECT.term}</span>
        </div>
        <div className="team-grid">
          {TEAM.map((m, i) => (
            <div key={`${m.name}-${i}`} className="panel team-card">
              <div className="team-avatar" aria-hidden="true">{initials(m.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="team-name">{m.name}</div>
                <div className="rmc-label eyebrow" style={{ marginTop: 4 }}>{m.role}</div>
                {m.did ? <p style={{ margin: '8px 0 0', fontSize: 15, color: 'var(--text-2)' }}>{m.did}</p> : null}
                {m.link ? <a href={m.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8, font: '700 12px var(--font-mono)', letterSpacing: '0.08em' }}>PROFILE ↗</a> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel rmc-guides about-note">
        <div>
          <h2 className="h-panel">A student project</h2>
          <p style={{ margin: '8px 0 0', color: 'var(--text-2)', lineHeight: '24px', maxWidth: 640 }}>
            This site was made for a class. It isn't run by or affiliated with any university, and the school name, classes and reviews you see in the demo are sample data.
          </p>
        </div>
        <div className="row-wrap" style={{ gap: 12 }}>
          {PROJECT.repo ? <Button variant="outline" href={PROJECT.repo} target="_blank" rel="noreferrer">View the code</Button> : null}
          <Button to="/search">Find a class</Button>
        </div>
      </section>
      <p className="mono-meta" style={{ marginTop: 20 }}>Questions or a review that breaks the rules? <Link to="/search">Report it from the class page.</Link></p>
    </main>
  );
}
