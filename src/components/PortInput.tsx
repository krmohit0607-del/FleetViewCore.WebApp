import { useEffect, useMemo, useRef, useState } from 'react';
import type { WorldPort } from '../data/ports';

interface PortInputProps {
  value: string;
  onChange: (value: string) => void;
  ports: WorldPort[];
  placeholder?: string;
  /** Limit suggestions for performance. */
  maxResults?: number;
}

/**
 * Themed port autocomplete. Replaces the native `<datalist>` (which the
 * browser styles inconsistently) with a styled dropdown that matches the
 * app theme. Filters the ~3k sea ports as the user types and keeps the
 * input free-text so "lat, lon" entries still work.
 */
export function PortInput({
  value,
  onChange,
  ports,
  placeholder,
  maxResults = 50,
}: PortInputProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return ports.slice(0, maxResults);
    return ports
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q),
      )
      .slice(0, maxResults);
  }, [value, ports, maxResults]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (p: WorldPort) => {
    onChange(p.label);
    setOpen(false);
  };

  return (
    <div className="fv-port-combo" ref={wrapRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, matches.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter' && matches[active]) {
            e.preventDefault();
            choose(matches[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul className="fv-port-combo__list">
          {matches.map((p, i) => (
            <li
              key={p.code || `${p.name}-${i}`}
              className={`fv-port-combo__item${i === active ? ' fv-port-combo__item--active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(p);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="fv-port-combo__name">{p.name}</span>
              <span className="fv-port-combo__meta">
                {p.country}
                {p.code ? ` · ${p.code}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
