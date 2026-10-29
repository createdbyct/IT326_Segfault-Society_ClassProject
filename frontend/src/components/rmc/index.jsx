// Rate My Classes — Cutting Mat design system components (React).
// Ported from the RMC design-system bundle. Styles live in src/styles/components.css.
import { Link } from 'react-router-dom';

const cx = (...c) => c.filter(Boolean).join(' ');
export const fmt = (n) => (Math.round(Number(n) * 10) / 10).toFixed(1);

/** Button. `to` = in-app route (react-router), `href` = plain link, otherwise a <button>.
 *  variant: primary | outline | text · size: sm | md | lg */
export function Button({ variant = 'primary', size = 'md', className, to, href, children, type = 'button', ...rest }) {
  const cls = cx('rmc-btn', variant !== 'primary' && `rmc-btn-${variant}`, size !== 'md' && `rmc-btn-${size}`, className);
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>;
  return <button type={type} className={cls} {...rest}>{children}</button>;
}

function arrowStep(e, current, onChange) {
  const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
  if (!d) return;
  e.preventDefault();
  const nx = Math.min(5, Math.max(1, (current || 0) + d));
  onChange(nx);
  const sib = e.currentTarget.parentNode.children[nx - 1];
  if (sib) sib.focus();
}

/** Ruler ticks placed at exact percentages (a repeating background drifts as tiles round to whole pixels).
 *  steps = ticks per unit (5 → every 0.2). Labels 0–5 sit centred under their major ticks. */
export function RulerTicks({ steps = 5 }) {
  const n = 5 * steps;
  return (
    <>
      <span className="rmc-ticks" aria-hidden="true">
        {Array.from({ length: n + 1 }, (_, i) => {
          const kind = i % steps === 0 ? 'major' : steps % 2 === 0 && i % (steps / 2) === 0 ? 'mid' : 'minor';
          return <i key={i} className={`rmc-tk rmc-tk-${kind}`} style={{ left: `${(i / n) * 100}%` }} />;
        })}
      </span>
    </>
  );
}

/** 0–5 labels, centred under the major ticks. The row is inset by --ruler-inset, like the tick track. */
export function RulerNums({ className = 'rmc-ruler-nums' }) {
  return (
    <div className={className} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((n) => <span key={n} style={{ left: `calc(var(--ruler-inset) + (100% - 2 * var(--ruler-inset)) * ${n / 5})` }}>{n}</span>)}
    </div>
  );
}

/** The class score as a measurement: "4.6 / 5.0" over a yellow ruler with an orange blade marker.
 *  score null → "Not enough scores yet". onChange → a 1–5 picker under the ruler (rating input). */
export function ScoreRuler({ score, size = 'md', caption, label, onChange, className }) {
  const has = score != null && !Number.isNaN(Number(score));
  const s = has ? Math.max(0, Math.min(5, Number(score))) : null;
  const interactive = typeof onChange === 'function';
  const aria = label || (has ? `Score ${fmt(s)} out of 5` : 'Not enough scores yet');
  return (
    <div className={cx('rmc-ruler', size !== 'md' && `rmc-ruler-${size}`, !has && 'rmc-ruler-empty', className)} role={interactive ? 'group' : 'img'} aria-label={aria}>
      <div className="rmc-ruler-head">
        <span className="rmc-ruler-score" aria-hidden="true">
          {has ? <>{fmt(s)}<span className="rmc-ruler-of"> / 5.0</span></> : interactive ? 'Pick a score' : 'Not enough scores yet'}
        </span>
        {caption ? <span className="rmc-label">{caption}</span> : null}
      </div>
      <div className="rmc-ruler-bar" aria-hidden="true">
        {has ? (
          <span className="rmc-ruler-track">
            <RulerTicks steps={5} />
            <span className="rmc-ruler-mark" style={{ left: `${(s / 5) * 100}%` }} />
          </span>
        ) : null}
      </div>
      <RulerNums />
      {interactive ? (
        <div className="rmc-ruler-picks" role="radiogroup" aria-label={label || 'Overall score'}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={s === n} tabIndex={(s || 1) === n ? 0 : -1}
              onClick={() => onChange(n)} onKeyDown={(e) => arrowStep(e, s, onChange)}>{n}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const WORDS = {
  workload: ['', 'LIGHT', 'EASY', 'STEADY', 'HEAVY', 'BRUTAL'],
  difficulty: ['', 'EASY', 'FAIR', 'FAIR', 'HARD', 'VERY HARD'],
  lecture: ['', 'SKIP IT', 'MEH', 'FINE', 'GREAT', 'EXCELLENT'],
};

/** Five ticks, like the marks on a ruler. onChange → a 1–5 input. */
export function TickMeter({ value, kind = 'workload', label, word, onChange, className }) {
  const v = Math.round(Number(value) || 0);
  const lbl = label || kind.toUpperCase();
  const w = word != null ? word : (WORDS[kind] || [])[v] || '';
  const interactive = typeof onChange === 'function';
  const ticks = [1, 2, 3, 4, 5].map((n) =>
    interactive ? (
      <button key={n} type="button" role="radio" aria-checked={n === v} aria-label={`${lbl} ${n} of 5`} tabIndex={(v || 1) === n ? 0 : -1}
        className={cx('rmc-tick', n <= v && 'is-on')} onClick={() => onChange(n)} onKeyDown={(e) => arrowStep(e, v, onChange)}>{n}</button>
    ) : (
      <span key={n} className={cx('rmc-tick', n <= v && 'is-on')} />
    ),
  );
  return (
    <div className={cx('rmc-meter', className)}>
      <span className="rmc-label">{lbl}</span>
      {interactive
        ? <span className="rmc-meter-track is-input" role="radiogroup" aria-label={lbl}>{ticks}</span>
        : <span className="rmc-meter-track" role="img" aria-label={`${lbl} ${v} of 5`}>{ticks}</span>}
      <span className="rmc-meter-word" aria-hidden="true">{w}</span>
    </div>
  );
}

/** [BRACKETED] label. With onToggle it becomes a toggle button. */
export function Tag({ children, count, selected, onToggle, className }) {
  const kids = <>{children}{count != null ? <span className="rmc-tag-count">×{count}</span> : null}</>;
  if (typeof onToggle !== 'function') return <span className={cx('rmc-tag', className)}>{kids}</span>;
  return <button type="button" className={cx('rmc-tag', className)} aria-pressed={!!selected} onClick={() => onToggle(!selected)}>{kids}</button>;
}

export function StatRow({ items = [], className }) {
  return (
    <dl className={cx('rmc-stats', className)}>
      {items.map((s) => <div className="rmc-stat" key={s.label}><dd>{s.value}</dd><dt>{s.label}</dt></div>)}
    </dl>
  );
}

export function Highlight({ children, className }) {
  return <mark className={cx('rmc-hl', className)}>{children}</mark>;
}

export function withHighlight(text = '', phrase) {
  if (!phrase || !text.includes(phrase)) return text;
  const i = text.indexOf(phrase);
  return <>{text.slice(0, i)}<Highlight>{phrase}</Highlight>{text.slice(i + phrase.length)}</>;
}

/** A class at a glance. `to` makes the whole card a link. */
export function CourseCard({ code, title, score, department, reviewCount, wouldRetakePct, workload, difficulty, quote, highlight, tags = [], to, className }) {
  const stats = [];
  if (wouldRetakePct != null) stats.push({ value: `${Math.round(wouldRetakePct)}%`, label: 'Retake' });
  if (workload != null) stats.push({ value: fmt(workload), label: 'Workload' });
  if (difficulty != null) stats.push({ value: fmt(difficulty), label: 'Difficulty' });
  const body = (
    <>
      <div className="rmc-course-top">
        <span className="rmc-label">Course · {code}</span>
        <span className="rmc-label">{department || ''}</span>
      </div>
      <div><h3 className="rmc-course-code">{code}</h3><p className="rmc-course-title">{title}</p></div>
      <ScoreRuler score={score} size="sm" caption={reviewCount != null ? `${reviewCount} students` : null} />
      {stats.length ? <StatRow items={stats} /> : null}
      {quote ? <p className="rmc-course-quote">“{withHighlight(quote, highlight)}”</p> : null}
      {tags.length ? <div className="rmc-tags">{tags.map((t) => <Tag key={t}>{t}</Tag>)}</div> : null}
    </>
  );
  const cls = cx('rmc-card', 'rmc-guides', 'rmc-course', className);
  if (to) return <Link to={to} className={cls} aria-label={`${code}, ${title}${score != null ? `, score ${fmt(score)} out of 5` : ''}`}>{body}</Link>;
  return <article className={cls}>{body}</article>;
}

/** One student's review. */
export function ReviewCard({ score, text, highlight, term, instructor, year, tags = [], helpful = 0, helpfulPressed, onHelpful, onReport, className }) {
  const meta = [term, instructor, year].filter(Boolean).join(' · ');
  return (
    <article className={cx('rmc-card', 'rmc-review', className)}>
      <div className="rmc-review-head">
        <span className="rmc-review-score" aria-label={`Rated ${score} out of 5`}>{score} / 5</span>
        <span className="rmc-review-meta">{meta}</span>
      </div>
      <p className="rmc-review-text">{withHighlight(text, highlight)}</p>
      <div className="rmc-review-foot">
        <div className="rmc-tags">{tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        <div>
          <Button variant="text" size="sm" onClick={onHelpful} aria-pressed={!!helpfulPressed}>Helpful · {helpful}</Button>
          <Button variant="text" size="sm" onClick={onReport}>Report</Button>
        </div>
      </div>
    </article>
  );
}
