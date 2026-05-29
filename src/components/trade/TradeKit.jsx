import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   TradeKit — shared premium building blocks for the trading terminals
   (Crypto Futures + Forex & Commodities). Keeps both pages DRY and consistent.
   ───────────────────────────────────────────────────────────────────────────── */

// ── Animations (injected once) ─────────────────────────────────────────────────
export function injectTradeAnims() {
  if (typeof document === 'undefined' || document.getElementById('tk-anims')) return;
  const s = document.createElement('style');
  s.id = 'tk-anims';
  s.textContent = `
    @keyframes tk-fade-up   { from{opacity:0;transform:translateY(8px);}  to{opacity:1;transform:translateY(0);} }
    @keyframes tk-pop       { 0%{transform:scale(1);} 45%{transform:scale(1.03);} 100%{transform:scale(1);} }
    @keyframes tk-buy-glow  { 0%,100%{box-shadow:0 4px 20px rgba(30,167,116,0.22);} 50%{box-shadow:0 4px 44px rgba(30,167,116,0.5);} }
    @keyframes tk-sell-glow { 0%,100%{box-shadow:0 4px 20px rgba(212,67,51,0.22);} 50%{box-shadow:0 4px 44px rgba(212,67,51,0.5);} }
    @keyframes tk-up        { 0%{color:#6ee7b7;text-shadow:0 0 14px rgba(30,167,116,0.7);} 100%{text-shadow:none;} }
    @keyframes tk-down      { 0%{color:#fca5a5;text-shadow:0 0 14px rgba(212,67,51,0.7);} 100%{text-shadow:none;} }
    @keyframes tk-pnl       { from{opacity:0.5;transform:translateY(2px);} to{opacity:1;transform:translateY(0);} }
    @keyframes tk-sweep     { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
    .tk-fade-up { animation: tk-fade-up .35s ease forwards; }
    .tk-pop     { animation: tk-pop .5s cubic-bezier(0.34,1.56,0.64,1); }
    .tk-pnl     { animation: tk-pnl .28s ease forwards; }
    .tk-up      { animation: tk-up .6s ease forwards; }
    .tk-down    { animation: tk-down .6s ease forwards; }
    .tk-no-scrollbar::-webkit-scrollbar { display:none; }
    .tk-no-scrollbar { scrollbar-width:none; }
  `;
  document.head.appendChild(s);
}

// ── Price history hook ──────────────────────────────────────────────────────────
// Maintains a rolling window of recent prices per symbol. The host page already
// re-renders on `prices` changes, so reading the ref during render is current.
export function usePriceHistory(prices, symbols, maxLen = 48) {
  const histRef = useRef({});
  symbols.forEach(s => { if (!histRef.current[s]) histRef.current[s] = []; });

  useEffect(() => {
    symbols.forEach(s => {
      const p = prices[s];
      if (p == null) return;
      const h = histRef.current[s];
      if (h.length === 0 || h[h.length - 1] !== p) {
        h.push(p);
        if (h.length > maxLen) h.shift();
      }
    });
  });

  return histRef;
}

// ── Favorites (persisted) ───────────────────────────────────────────────────────
export function useFavorites(key = 'tk-favorites') {
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch { return new Set(); }
  });
  const toggle = useCallback((sym) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(sym) ? next.delete(sym) : next.add(sym);
      try { localStorage.setItem(key, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, [key]);
  return [favs, toggle];
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export function getSentiment(history) {
  if (!history || history.length < 5) {
    return { label: 'Neutral', dir: 'flat', score: 50, color: 'var(--warn)', bg: 'var(--warn-bg)' };
  }
  const last = history.slice(-16);
  let ups = 0;
  for (let i = 1; i < last.length; i++) if (last[i] > last[i - 1]) ups++;
  const ratio = ups / (last.length - 1);
  const score = Math.round(ratio * 100);
  if (ratio >= 0.6)  return { label: 'Bullish', dir: 'up',   score, color: 'var(--green)', bg: 'var(--green-bg)' };
  if (ratio <= 0.4)  return { label: 'Bearish', dir: 'down', score, color: 'var(--red)',   bg: 'var(--red-bg)' };
  return { label: 'Neutral', dir: 'flat', score, color: 'var(--warn)', bg: 'var(--warn-bg)' };
}

export function getVolatility(history) {
  if (!history || history.length < 8) return { label: 'Low', level: 1, color: 'var(--green)' };
  const min = Math.min(...history), max = Math.max(...history);
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const rangePct = ((max - min) / mean) * 100;
  if (rangePct >= 0.55) return { label: 'High',   level: 3, color: 'var(--red)' };
  if (rangePct >= 0.22) return { label: 'Medium', level: 2, color: 'var(--warn)' };
  return { label: 'Low', level: 1, color: 'var(--green)' };
}

// ── Sparkline ────────────────────────────────────────────────────────────────
export function Sparkline({ history, up, w = 72, h = 26, strokeWidth = 1.5, id = 'x', fill = true }) {
  if (!history || history.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...history), max = Math.max(...history);
  const range = max - min || 1;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const col = up ? '#1ea774' : '#d44333';
  const gid = `tk-spark-${id}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={col} stopOpacity="0.24" />
              <stop offset="100%" stopColor={col} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`} />
        </>
      )}
      <polyline points={pts} fill="none" stroke={col} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Strength / meter bar ────────────────────────────────────────────────────────
export function MeterBar({ value, color, height = 6, track = 'var(--border-0)' }) {
  return (
    <div className="rounded-full overflow-hidden" style={{ height, background: track }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

// ── Pill badge ──────────────────────────────────────────────────────────────────
export function Pill({ children, color = 'var(--text-2)', bg = 'var(--bg-surface)', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${className}`}
      style={{ color, background: bg }}>
      {children}
    </span>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
export function StatChip({ label, value, color = 'var(--text-1)' }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-3)' }}>{label}</div>
      <div className="font-mono text-xs font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}

// ── 24h range bar (shows where price sits between low & high) ───────────────────
export function RangeBar({ low, high, price, decimals = 2 }) {
  const pct = high > low ? Math.max(0, Math.min(100, ((price - low) / (high - low)) * 100)) : 50;
  return (
    <div className="w-full" style={{ minWidth: 120 }}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs" style={{ color: 'var(--red)' }}>{low.toFixed(decimals)}</span>
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>24h Range</span>
        <span className="font-mono text-xs" style={{ color: 'var(--green)' }}>{high.toFixed(decimals)}</span>
      </div>
      <div className="relative h-1.5 rounded-full"
        style={{ background: 'linear-gradient(90deg, rgba(212,67,51,0.5), rgba(245,158,11,0.4), rgba(30,167,116,0.5))' }}>
        <div className="absolute top-1/2 w-2.5 h-2.5 rounded-full"
          style={{
            left: `${pct}%`, transform: 'translate(-50%,-50%)',
            background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.6)',
          }} />
      </div>
    </div>
  );
}
