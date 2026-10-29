import { Button } from './rmc/index.jsx';

export function Loading({ rows = 3, height = 120 }) {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton" style={{ minHeight: height }} />)}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const notFound = error?.status === 404;
  return (
    <div className="state" role="alert">
      <strong>{notFound ? 'Not found' : 'Something went wrong'}</strong>
      <p style={{ margin: '0 0 14px' }}>{error?.message || 'Please try again.'}</p>
      {onRetry && !notFound ? <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button> : null}
      {notFound ? <Button variant="outline" size="sm" to="/search">Find a class</Button> : null}
    </div>
  );
}

export function Empty({ title, children, action }) {
  return (
    <div className="state">
      <strong>{title}</strong>
      {children ? <p style={{ margin: '0 0 14px' }}>{children}</p> : null}
      {action}
    </div>
  );
}
