import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export function AffStatCard({ label, value, sub, icon: Icon, accent = '#3B82F6', trend, onClick }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden cursor-default transition-all"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}
      onClick={onClick}
      onMouseEnter={onClick ? e => e.currentTarget.style.border = `1px solid ${accent}40` : null}
      onMouseLeave={onClick ? e => e.currentTarget.style.border = '1px solid var(--border-0)' : null}>
      <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full pointer-events-none"
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
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-1.5 relative">
          {trend !== undefined && (
            <span className="text-xs font-bold" style={{ color: trend >= 0 ? '#10B981' : '#EF4444' }}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

export function AffCard({ title, subtitle, actions, children, noPad, accent }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 gap-4 flex-wrap" style={{ borderBottom: '1px solid var(--border-0)' }}>
          <div>
            {accent && <div className="w-8 h-0.5 rounded-full mb-2" style={{ background: accent }} />}
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

const BADGE_STYLES = {
  active:      { c: '#10B981', b: 'rgba(16,185,129,0.12)' },
  completed:   { c: '#10B981', b: 'rgba(16,185,129,0.12)' },
  verified:    { c: '#10B981', b: 'rgba(16,185,129,0.12)' },
  paid:        { c: '#10B981', b: 'rgba(16,185,129,0.12)' },
  approved:    { c: '#3B82F6', b: 'rgba(59,130,246,0.12)' },
  processing:  { c: '#F59E0B', b: 'rgba(245,158,11,0.12)' },
  pending:     { c: '#F59E0B', b: 'rgba(245,158,11,0.12)' },
  dormant:     { c: '#F59E0B', b: 'rgba(245,158,11,0.12)' },
  inactive:    { c: '#9CA3AF', b: 'rgba(156,163,175,0.12)' },
  suspended:   { c: '#EF4444', b: 'rgba(239,68,68,0.12)' },
  crypto:      { c: '#3B82F6', b: 'rgba(59,130,246,0.12)' },
  forex:       { c: '#7C3AED', b: 'rgba(124,58,237,0.12)' },
  simple:      { c: '#10B981', b: 'rgba(16,185,129,0.12)' },
  buy:         { c: '#10B981', b: 'rgba(16,185,129,0.12)' },
  sell:        { c: '#EF4444', b: 'rgba(239,68,68,0.12)' },
};

export function AffBadge({ status, label }) {
  const s = BADGE_STYLES[status] || { c: '#9CA3AF', b: 'rgba(156,163,175,0.12)' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ color: s.c, background: s.b }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.c }} />
      {label || status}
    </span>
  );
}

export function AffDataTable({ columns, rows, searchKeys = [], pageSize = 12, searchPlaceholder = 'Search…', filters, emptyText = 'No records found.' }) {
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
  }, [rows, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const sp = Math.min(page, pages - 1);
  const view = filtered.slice(sp * pageSize, sp * pageSize + pageSize);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {searchKeys.length > 0 && (
          <div className="relative" style={{ minWidth: 220, maxWidth: 320, flex: '1 1 220px' }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-4)' }} />
            <input value={query} onChange={e => { setQuery(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder} className="input-dark text-xs w-full"
              style={{ paddingLeft: '2.1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
          </div>
        )}
        {filters}
      </div>
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-0)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)' }}>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable && setSort(s => s.key === col.key ? { key: col.key, dir: -s.dir } : { key: col.key, dir: 1 })}
                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider select-none whitespace-nowrap"
                  style={{ color: 'var(--text-3)', cursor: col.sortable ? 'pointer' : 'default', textAlign: col.align || 'left' }}>
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && <ArrowUpDown size={10} style={{ opacity: sort.key === col.key ? 1 : 0.3 }} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-sm" style={{ color: 'var(--text-3)' }}>{emptyText}</td></tr>
            ) : view.map((row, i) => (
              <tr key={row.id || i} className="transition-colors" style={{ borderTop: '1px solid var(--border-0)' }}
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
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {sp * pageSize + 1}–{Math.min((sp + 1) * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={sp === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-2)', opacity: sp === 0 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-mono px-2" style={{ color: 'var(--text-2)' }}>{sp + 1}/{pages}</span>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={sp >= pages - 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-2)', opacity: sp >= pages - 1 ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AffBarChart({ data, valueKey, height = 140, color = '#3B82F6', labelKey = 'label' }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group" style={{ height: '100%' }}>
          <div className="w-full rounded-t-lg transition-all duration-300 relative"
            style={{ height: `${(d[valueKey] / max) * 100}%`, background: color, opacity: 0.85, minHeight: 3 }}>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-mono px-1.5 py-0.5 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)', color: 'var(--text-1)' }}>
              {typeof d[valueKey] === 'number' && d[valueKey] < 10000 ? '$' + d[valueKey].toFixed(0) : d[valueKey]}
            </div>
          </div>
          <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-4)', fontSize: 10 }}>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

export function AffAreaChart({ data, valueKey, height = 140, color = '#3B82F6', labelKey = 'label' }) {
  const vals = data.map(d => d[valueKey]);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const w = 600;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - 8 - ((d[valueKey] - min) / range) * (height - 24);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const gradId = 'affArea' + color.replace(/[^a-z0-9]/gi, '');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function AffPageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function AffMoney({ value, prefix = '$', colorize = false, bold = true }) {
  const color = colorize ? (value >= 0 ? '#10B981' : '#EF4444') : 'var(--text-1)';
  const sign  = colorize && value >= 0 ? '+' : '';
  return (
    <span className={`font-mono ${bold ? 'font-bold' : 'font-medium'}`} style={{ color }}>
      {sign}{prefix}{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}
    </span>
  );
}

export function FilterBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
      style={{ background: active ? 'rgba(59,130,246,0.15)' : 'var(--bg-surface)', color: active ? '#3B82F6' : 'var(--text-3)', border: `1px solid ${active ? 'rgba(59,130,246,0.3)' : 'var(--border-0)'}` }}>
      {label}
    </button>
  );
}
