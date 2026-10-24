import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs `fn` on mount and whenever `deps` change. Returns { data, error, loading, reload, setData }. */
export function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: undefined, error: null, loading: true });
  const seq = useRef(0);
  const run = useCallback(() => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => { if (id === seq.current) setState({ data, error: null, loading: false }); })
      .catch((error) => { if (id === seq.current) setState({ data: undefined, error, loading: false }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(run, [run]);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);
  return { ...state, reload: run, setData };
}

/** Document title helper. */
export function useTitle(title) {
  useEffect(() => { document.title = title ? `${title} — Rate My Classes` : 'Rate My Classes'; }, [title]);
}

/** Returns `value` once it has stopped changing for `ms` milliseconds. */
export function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
