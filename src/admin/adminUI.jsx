import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── KPI stat card ──────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, accent = 'var(--brand)', trend }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}22, transparent 70%)` }} />
      <div className="flex items-center justify-between mb-3 relative">
        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}1a`, border: `1px solid ${accent}33` }}>
            <Icon size={16} style={{ color: accent }} />
          </div>
        )}
      </div>
      <div className="font-mono text-2xl font-extrabold relative" style={{ color: 'var(--text-1)' }}>{value}</div>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-1.5 relative">
          {trend !== undefined && (
            <span className="text-xs font-bold" style={{ color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ── Status badge ────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  active:      { c: 'var(--green)', b: 'var(--green-bg)', label: 'Active' },
  operational: { c: 'var(--green)', b: 'var(--green-bg)', label: 'Operational' },
  completed:   { c: 'var(--green)', b: 'var(--green-bg)', label: 'Completed' },
  verified:    { c: 'var(--green)', b: 'var(--green-bg)', label: 'Verified' },
  closed:      { c: 'var(--text-2)', b: 'var(--bg-surface)', label: 'Closed' },
  pending:     { c: 'var(--warn)', b: 'var(--warn-bg)', label: 'Pending' },
  processing:  { c: 'var(--warn)', b: 'var(--warn-bg)', label: 'Processing' },
  degraded:    { c: 'var(--warn)', b: 'var(--warn-bg)', label: 'Degraded' },
  suspended:   { c: 'var(--red)', b: 'var(--red-bg)', label: 'Suspended' },
  rejected:    { c: 'var(--red)', b: 'var(--red-bg)', label: 'Rejected' },
  down:        { c: 'var(--red)', b: 'var(--red-bg)', label: 'Down' },
  high:        { c: 'var(--red)', b: 'var(--red-bg)', label: 'High' },
  medium:      { c: 'var(--warn)', b: 'var(--warn-bg)', label: 'Medium' },
  low:         { c: 'var(--green)', b: 'var(--green-bg)', label: 'Low' },
};
export function Badge({ status, label }) {
  const m = BADGE_MAP[status] || { c: 'var(--text-2)', b: 'var(--bg-surface)', label: status };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize"
      style={{ color: m.c, background: m.b }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.c }} />
      {label || m.label}
    </span>
  );
}

export function Pill({ children, color = 'var(--brand-light)', bg = 'var(--brand-bg)' }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ color, background: bg }}>{children}</span>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────────────────
export function Card({ title, subtitle, actions, children, noPad }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
          <div>
            {title && <div className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{title}</div>}
            {subtitle && <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{subtitle}</div>}
          </div>
          {actions}
        </div>
      )}
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

// ── Mini bar chart (SVG) ─────────────────────────────────────────────────────
export function BarChart({ data, valueKey, height = 160, color = 'var(--brand)', color2 }) {
  const max = Math.max(...data.map(d => Math.max(d[valueKey] || 0, color2 ? (d[color2.key] || 0) : 0)));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative" style={{ height: '100%' }}>
          <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
            <div className="flex-1 rounded-t transition-all duration-300"
              style={{ height: `${(d[valueKey] / max) * 100}%`, background: color, minHeight: 2 }} />
            {color2 && (
              <div className="flex-1 rounded-t transition-all duration-300"
                style={{ height: `${(d[color2.key] / max) * 100}%`, background: color2.color, minHeight: 2 }} />
            )}
          </div>
          <span className="text-[9px] whitespace-nowrap" style={{ color: 'var(--text-4)' }}>{d.label?.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Line/area chart (SVG) ─────────────────────────────────────────────────────
export function AreaChart({ data, valueKey, height = 160, color = 'var(--brand)' }) {
  const vals = data.map(d => d[valueKey]);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const w = 600;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - 8 - ((d[valueKey] - min) / range) * (height - 24);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="adminArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${w},${height}`} fill="url(#adminArea)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Data table with search + sort + pagination ────────────────────────────────
export function DataTable({ columns, rows, searchKeys = [], pageSize = 10, searchPlaceholder = 'Search…', filters }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let r = rows;
    if (query && searchKeys.length) {
      const q = query.toLowerCase();
      r = r.filter(row => searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q)));
    }
    if (sort.key) {
      r = [...r].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir;
        return String(av).localeCompare(String(bv)) * sort.dir;
      });
    }
    return r;
  }, [rows, query, sort, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const view = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: -s.dir } : { key, dir: 1 });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {searchKeys.length > 0 && (
          <div className="relative flex-1" style={{ maxWidth: 320, minWidth: 200 }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-4)' }} />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder}
              className="input-dark text-xs"
              style={{ paddingLeft: '2.1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            />
          </div>
        )}
        {filters}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-0)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)' }}>
              {columns.map(col => (
                <th key={col.key}
                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider select-none"
                  style={{ color: 'var(--text-3)', cursor: col.sortable ? 'pointer' : 'default', textAlign: col.align || 'left' }}
                  onClick={() => col.sortable && toggleSort(col.key)}>
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && <ArrowUpDown size={11} style={{ opacity: sort.key === col.key ? 1 : 0.3 }} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>No records found.</td></tr>
            ) : view.map((row, i) => (
              <tr key={row.id || i}
                className="transition-colors"
                style={{ borderTop: '1px solid var(--border-0)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm" style={{ color: 'var(--text-2)', textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-2)', opacity: safePage === 0 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-mono px-2" style={{ color: 'var(--text-2)' }}>{safePage + 1} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={safePage >= pages - 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-2)', opacity: safePage >= pages - 1 ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Money helpers re-export for convenience ──────────────────────────────────
export function Money({ value, prefix = '$', colorize = false }) {
  const color = colorize ? (value >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--text-1)';
  const sign = colorize && value >= 0 ? '+' : '';
  return (
    <span className="font-mono font-semibold" style={{ color }}>
      {sign}{prefix}{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}
    </span>
  );
}
