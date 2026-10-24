import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from './rmc/index.jsx';
import { USE_MOCK } from '../api/index.js';
import { useAuth } from '../auth/AuthContext.jsx';
import logoSvg from '../assets/logo.svg?raw';

// The logo's colours come from the design tokens (tokens.css).
const LOGO = logoSvg
  .replace(/<title>.*?<\/title>/, '')
  .replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"')
  .replace(/fill="#ffd23f"/gi, 'style="fill:var(--ruler)"')
  .replace(/fill="#14513b"/gi, 'style="fill:var(--on-ruler)"')
  .replace(/fill="#ff7a3d"/gi, 'style="fill:var(--blade)"')
  .replace(/fill="#ffffff"/gi, 'style="fill:var(--text)"');

const LINKS = [
  { to: '/search', label: 'FIND A CLASS' },
  { to: '/top', label: 'TOP 10' },
  { to: '/bottom', label: 'BOTTOM 10' },
];

export default function Layout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  // --chrome-h = height of everything above the page (sample-data strip + header); the home hero fills the rest.
  useEffect(() => {
    const set = () => {
      const h = document.querySelector('.site-header');
      if (h) document.documentElement.style.setProperty('--chrome-h', `${h.offsetTop + h.offsetHeight}px`);
    };
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);

  // Favorites only exist for signed-in students, so the link appears once you sign in.
  const links = [...LINKS, ...(user ? [{ to: '/favorites', label: 'FAVORITES' }, { to: '/account', label: 'ACCOUNT' }] : [{ to: '/signin', label: 'SIGN IN' }])];
  const navItems = links.map((l) => (
    <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive || (l.to === '/account' && pathname.startsWith('/account')) ? 'active' : undefined)}>{l.label}</NavLink>
  ));

  return (
    <div className="app rmc-mat">
      <a href="#main" className="sr-only">Skip to content</a>
      {USE_MOCK ? <div className="mock-banner">SAMPLE DATA · SET VITE_USE_MOCK=false TO USE YOUR BACKEND</div> : null}
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-logo" aria-label="Rate My Classes home"><span className="site-logo-svg" role="img" aria-label="Rate My Classes" dangerouslySetInnerHTML={{ __html: LOGO }} /></Link>
          <nav className="navlinks" aria-label="Main">{navItems}</nav>
          <div className="header-actions">
            <Button size="sm" to="/review">Rate a class</Button>
            <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-nav" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>
      </header>
      <nav id="mobile-nav" className="mobile-nav" hidden={!open} aria-label="Main">
        {navItems}
        <NavLink to="/review">RATE A CLASS</NavLink>
      </nav>
      <Outlet />
      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>© {new Date().getFullYear()} RATE MY CLASSES · A STUDENT CLASS PROJECT</span>
          <nav className="footer-links" aria-label="Footer">
            <Link to="/about">ABOUT</Link>
            <Link to="/top">TOP 10</Link>
            <Link to="/bottom">BOTTOM 10</Link>
            <Link to="/classes/new">ADD A CLASS</Link>
          </nav>
          <span className="motto">MEASURE TWICE. ENROLL ONCE.</span>
        </div>
      </footer>
    </div>
  );
}
