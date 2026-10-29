import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { me } from '../api/index.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../lib/toast.jsx';
import { Button } from './rmc/index.jsx';

/** Save / unsave a class. Sends signed-out visitors to sign in. `variant="icon"` = bookmark square. */
export function useFavorite(classId, initial, onChange) {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const [saved, setSaved] = useState(!!initial);
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    if (!user) { nav(`/signin?next=${encodeURIComponent(loc.pathname)}`); return; }
    setBusy(true);
    const next = !saved;
    setSaved(next);
    try {
      if (next) await me.addFavorite(classId); else await me.removeFavorite(classId);
      toast(next ? 'Saved to favorites' : 'Removed from favorites');
      onChange?.(next);
    } catch (e) {
      setSaved(!next);
      toast(e.message);
    } finally { setBusy(false); }
  };
  return { saved, busy, toggle };
}

export default function FavoriteButton({ classId, code, initial, variant = 'icon', onChange }) {
  const { saved, busy, toggle } = useFavorite(classId, initial, onChange);
  if (variant === 'icon') {
    return (
      <button type="button" className="icon-btn" aria-pressed={saved} disabled={busy} onClick={toggle}
        aria-label={saved ? `Remove ${code} from favorites` : `Save ${code} to favorites`}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M6 3h12v18l-6-4-6 4z" /></svg>
      </button>
    );
  }
  return <Button variant="outline" onClick={toggle} disabled={busy} aria-pressed={saved}>{saved ? 'Saved ✓' : 'Save to favorites'}</Button>;
}
