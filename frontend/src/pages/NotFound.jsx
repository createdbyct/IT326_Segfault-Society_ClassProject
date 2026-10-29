import { Button } from '../components/rmc/index.jsx';
import { useTitle } from '../lib/useApi.js';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <main id="main" className="page page-narrow rmc-fade">
      <div className="rmc-label eyebrow">Error 404</div>
      <h1 className="h-xl">Page not found</h1>
      <p className="lede">That page doesn't exist. It may have moved, or the link has a typo.</p>
      <div className="row-wrap" style={{ gap: 12, marginTop: 24 }}><Button to="/search">Find a class</Button><Button variant="outline" to="/top">See the top 10</Button></div>
    </main>
  );
}
