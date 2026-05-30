import React, { useState, useEffect, useRef } from 'react';
import {
  Database, Wifi, WifiOff, Globe, Settings2, BarChart2, AlertTriangle,
  Activity, GitBranch, Plus, Pencil, Trash2, RefreshCw, Check, X,
  Eye, EyeOff, Copy, Zap, Server, TrendingUp, ChevronDown,
} from 'lucide-react';
import { PageHeader, Card, Badge, StatCard } from './adminUI';
import {
  INITIAL_PROVIDERS, INITIAL_SOURCE_CONFIG, INITIAL_SYMBOLS,
  INITIAL_CHART_CONFIG, INITIAL_FALLBACK_RULES,
} from './marketDataConfig';

// ── Design tokens ─────────────────────────────────────────────────────────────
const TYPE_STYLES = {
  broker:   { c: '#7C3AED', b: 'rgba(124,58,237,0.13)' },
  exchange: { c: '#3B82F6', b: 'rgba(59,130,246,0.13)' },
  data:     { c: '#0EA5E9', b: 'rgba(14,165,233,0.13)' },
  internal: { c: '#F59E0B', b: 'rgba(245,158,11,0.13)' },
};
const STATUS_COLOR = {
  connected:    'var(--green)',
  degraded:     'var(--warn)',
  disconnected: 'var(--text-4)',
  testing:      'var(--brand)',
};
const PRODUCTS = ['crypto', 'forex', 'simple'];
const PRODUCT_LABELS = { crypto: 'Crypto Futures', forex: 'Forex & Commodities', simple: 'Simple Trade' };
const TF_OPTIONS = ['1m','5m','15m','30m','1h','4h','1d','1w'];

const TABS = [
  { id: 'providers', label: 'Providers',        icon: Database },
  { id: 'sources',   label: 'Source Selection', icon: Globe },
  { id: 'symbols',   label: 'Symbol Config',    icon: Settings2 },
  { id: 'spreads',   label: 'Spread Management',icon: BarChart2 },
  { id: 'overrides', label: 'Price Override',   icon: AlertTriangle },
  { id: 'charts',    label: 'Chart Management', icon: TrendingUp },
  { id: 'health',    label: 'API Health',       icon: Activity },
  { id: 'fallback',  label: 'Fallback Rules',   icon: GitBranch },
];

// ── Reusable helpers ──────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ width: 36, height: 20, background: value ? 'var(--brand)' : 'var(--bg-surface)', border: `1px solid ${value ? 'var(--brand)' : 'var(--border-1)'}` }}>
      <span className="absolute rounded-full transition-transform duration-200"
        style={{ width: 14, height: 14, top: 2, left: 2, background: value ? '#fff' : 'var(--text-4)', transform: value ? 'translateX(16px)' : 'translateX(0)' }} />
    </button>
  );
}

function Sel({ value, onChange, options, disabled, style }) {
  return (
    <div className="relative inline-flex items-center" style={style}>
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className="input-dark text-xs appearance-none pr-7 py-1.5 cursor-pointer"
        style={{ paddingLeft: '0.6rem', background: 'var(--bg-surface)', opacity: disabled ? 0.45 : 1, minWidth: 130 }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <ChevronDown size={11} className="absolute right-2 pointer-events-none" style={{ color: 'var(--text-4)' }} />
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl w-full overflow-hidden flex flex-col" style={{ maxWidth: width, background: 'var(--bg-card)', border: '1px solid var(--border-1)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-0)' }}>
          <span className="font-bold text-base" style={{ color: 'var(--text-1)' }}>{title}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-3)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function FormRow({ label, children, hint }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs" style={{ color: 'var(--text-4)' }}>{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', mono }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`input-dark text-sm w-full${mono ? ' font-mono' : ''}`}
      style={{ padding: '0.55rem 0.75rem' }} />
  );
}

// ── 1. Providers Tab ──────────────────────────────────────────────────────────
const EMPTY_PROVIDER = { id: '', name: '', fullName: '', type: 'data', enabled: false, status: 'disconnected', apiKey: '', baseUrl: '', wsUrl: '', products: [], latency: 0, uptime: 0, lastSeen: 'never', errorRate: 0, rateLimit: '', priority: 9 };

function ProviderModal({ open, onClose, initial, onSave }) {
  const [form, setForm] = useState(initial);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  useEffect(() => { setForm(initial); setTestResult(null); }, [initial]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleProduct = p => set('products', form.products.includes(p) ? form.products.filter(x => x !== p) : [...form.products, p]);

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    await new Promise(r => setTimeout(r, 1400));
    setTesting(false);
    setTestResult(form.apiKey && form.baseUrl ? 'success' : 'error');
  };

  return (
    <Modal open={open} onClose={onClose} title={initial.id ? `Edit Provider — ${initial.name}` : 'Add New Provider'} width={580}>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow label="Short Name">
          <TextInput value={form.name} onChange={v => set('name', v)} placeholder="e.g. Binance" />
        </FormRow>
        <FormRow label="Full Name">
          <TextInput value={form.fullName} onChange={v => set('fullName', v)} placeholder="e.g. Binance Exchange" />
        </FormRow>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow label="Type">
          <Sel value={form.type} onChange={v => set('type', v)} options={['broker','exchange','data','internal'].map(x => ({ value: x, label: x.charAt(0).toUpperCase() + x.slice(1) }))} style={{ width: '100%' }} />
        </FormRow>
        <FormRow label="Priority">
          <TextInput type="number" value={form.priority} onChange={v => set('priority', Number(v))} placeholder="1 = highest" />
        </FormRow>
      </div>
      <FormRow label="API Key" hint="Stored encrypted at rest. Only the last 4 characters are shown after saving.">
        <div className="relative">
          <input type={showKey ? 'text' : 'password'} value={form.apiKey} onChange={e => set('apiKey', e.target.value)}
            placeholder="Enter API key…" className="input-dark text-sm font-mono w-full" style={{ padding: '0.55rem 2.5rem 0.55rem 0.75rem' }} />
          <button onClick={() => setShowKey(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-3)' }}>{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
        </div>
      </FormRow>
      <FormRow label="Base REST URL">
        <TextInput value={form.baseUrl} onChange={v => set('baseUrl', v)} placeholder="https://api.provider.com/v1" mono />
      </FormRow>
      <FormRow label="WebSocket URL" hint="Leave blank if provider doesn't offer WebSocket streaming.">
        <TextInput value={form.wsUrl} onChange={v => set('wsUrl', v)} placeholder="wss://stream.provider.com/ws" mono />
      </FormRow>
      <FormRow label="Rate Limit">
        <TextInput value={form.rateLimit} onChange={v => set('rateLimit', v)} placeholder="e.g. 1000/min" />
      </FormRow>
      <FormRow label="Supported Products">
        <div className="flex gap-3 mt-1">
          {PRODUCTS.map(p => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.products.includes(p)} onChange={() => toggleProduct(p)}
                className="rounded" style={{ accentColor: 'var(--brand)' }} />
              <span className="text-xs capitalize" style={{ color: 'var(--text-2)' }}>{p}</span>
            </label>
          ))}
        </div>
      </FormRow>
      <FormRow label="Enabled">
        <Toggle value={form.enabled} onChange={v => set('enabled', v)} />
      </FormRow>
      {testResult && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs"
          style={{ background: testResult === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: testResult === 'success' ? 'var(--green)' : 'var(--red)' }}>
          {testResult === 'success' ? <Check size={13} /> : <X size={13} />}
          {testResult === 'success' ? 'Connection successful — provider is reachable.' : 'Connection failed — check URL and API key.'}
        </div>
      )}
      <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border-0)' }}>
        <button onClick={handleTest} disabled={testing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', color: 'var(--text-2)', opacity: testing ? 0.6 : 1 }}>
          {testing ? <RefreshCw size={13} className="animate-spin" /> : <Wifi size={13} />}
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
        <div className="flex-1" />
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-0)' }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)} className="btn-brand px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check size={13} /> Save Provider
        </button>
      </div>
    </Modal>
  );
}

function ProvidersTab({ providers, setProviders }) {
  const [modal, setModal] = useState({ open: false, editing: EMPTY_PROVIDER });
  const [delId, setDelId] = useState(null);
  const [testing, setTesting] = useState({});

  const openAdd = () => setModal({ open: true, editing: { ...EMPTY_PROVIDER, id: 'p_' + Date.now() } });
  const openEdit = p => setModal({ open: true, editing: { ...p } });
  const closeMdl = () => setModal(m => ({ ...m, open: false }));
  const handleSave = form => {
    setProviders(prev => prev.some(p => p.id === form.id) ? prev.map(p => p.id === form.id ? form : p) : [...prev, form]);
    closeMdl();
  };
  const handleDelete = id => { setProviders(prev => prev.filter(p => p.id !== id)); setDelId(null); };
  const handleToggle = id => setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled, status: !p.enabled ? 'connected' : 'disconnected' } : p));
  const handleTest = async id => {
    setTesting(t => ({ ...t, [id]: true }));
    await new Promise(r => setTimeout(r, 1200));
    setTesting(t => ({ ...t, [id]: false }));
  };

  const connected = providers.filter(p => p.enabled && p.status === 'connected').length;
  const degraded = providers.filter(p => p.status === 'degraded').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Providers" value={providers.length} icon={Database} accent="var(--brand)" />
        <StatCard label="Connected" value={connected} icon={Wifi} accent="var(--green)" />
        <StatCard label="Degraded" value={degraded} icon={AlertTriangle} accent="var(--warn)" />
        <StatCard label="Disabled" value={providers.filter(p => !p.enabled).length} icon={WifiOff} accent="var(--text-3)" />
      </div>

      <Card title="Data Providers" subtitle="Manage API connections for market data feeds"
        actions={
          <button onClick={openAdd} className="btn-brand flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold">
            <Plus size={14} /> Add Provider
          </button>
        }>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {providers.map(p => {
            const ts = TYPE_STYLES[p.type] || TYPE_STYLES.data;
            const sc = STATUS_COLOR[testing[p.id] ? 'testing' : p.status] || STATUS_COLOR.disconnected;
            return (
              <div key={p.id} className="rounded-xl p-4 relative overflow-hidden transition-all"
                style={{ background: 'var(--bg-surface)', border: `1px solid ${p.enabled ? 'var(--border-1)' : 'var(--border-0)'}`, opacity: p.enabled ? 1 : 0.65 }}>
                {/* Type accent stripe */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: ts.c, opacity: p.enabled ? 1 : 0.3 }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                      style={{ background: ts.b, color: ts.c }}>{p.name[0]}</div>
                    <div>
                      <div className="font-bold text-sm leading-tight" style={{ color: 'var(--text-1)' }}>{p.name}</div>
                      <span className="text-xs px-1.5 py-0.5 rounded font-semibold capitalize"
                        style={{ color: ts.c, background: ts.b }}>{p.type}</span>
                    </div>
                  </div>
                  <Toggle value={p.enabled} onChange={() => handleToggle(p.id)} />
                </div>
                {/* Status */}
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: sc }} />
                  <span className="text-xs font-semibold capitalize" style={{ color: sc }}>
                    {testing[p.id] ? 'Testing…' : p.status}
                  </span>
                  {p.enabled && p.status === 'connected' && (
                    <span className="text-xs ml-auto font-mono" style={{ color: 'var(--text-4)' }}>{p.latency}ms</span>
                  )}
                </div>
                {/* Metrics row */}
                {p.enabled && p.status !== 'disconnected' && (
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {[['Uptime', p.uptime + '%'], ['Error', (p.errorRate * 100).toFixed(2) + '%'], ['Limit', p.rateLimit]].map(([k, v]) => (
                      <div key={k} className="rounded-lg px-2 py-1.5 text-center" style={{ background: 'var(--bg-card)' }}>
                        <div className="text-xs font-mono font-bold" style={{ color: 'var(--text-1)' }}>{v}</div>
                        <div className="text-xs" style={{ color: 'var(--text-4)', fontSize: 10 }}>{k}</div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Products */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {p.products.map(pr => (
                    <span key={pr} className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background: 'var(--bg-card)', color: 'var(--text-3)', border: '1px solid var(--border-0)' }}>{pr}</span>
                  ))}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border-0)' }}>
                  <button onClick={() => handleTest(p.id)} disabled={!!testing[p.id]}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-3)', border: '1px solid var(--border-0)' }}>
                    {testing[p.id] ? <RefreshCw size={11} className="animate-spin" /> : <Zap size={11} />}
                    Test
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-3)', border: '1px solid var(--border-0)' }}>
                    <Pencil size={11} /> Edit
                  </button>
                  {delId === p.id ? (
                    <div className="ml-auto flex gap-1.5">
                      <button onClick={() => handleDelete(p.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Confirm</button>
                      <button onClick={() => setDelId(null)} className="px-2.5 py-1.5 rounded-lg text-xs"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-3)' }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDelId(p.id)} className="ml-auto p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-4)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.color = 'var(--red)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <ProviderModal open={modal.open} onClose={closeMdl} initial={modal.editing} onSave={handleSave} />
    </div>
  );
}

// ── 2. Source Selection Tab ───────────────────────────────────────────────────
function SourcesTab({ sourceConfig, setSourceConfig, providers }) {
  const activeProviders = providers.filter(p => p.enabled);
  const providerOpts = activeProviders.map(p => ({ value: p.id, label: p.name }));
  const set = (product, key, value) =>
    setSourceConfig(prev => ({ ...prev, [product]: { ...prev[product], [key]: value } }));

  const SOURCE_KEYS = [
    { key: 'price',     label: 'Price Feed',    desc: 'Primary real-time price source' },
    { key: 'chart',     label: 'Chart Data',    desc: 'OHLCV data for candles' },
    { key: 'orderBook', label: 'Order Book',    desc: 'Depth-of-market data' },
    { key: 'fallback',  label: 'Fallback',      desc: 'Used when primary fails' },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-3"
        style={{ background: 'var(--brand-bg)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <Database size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
        <span style={{ color: 'var(--brand-light)' }}>
          Source selection controls which provider feeds each product. Changes take effect immediately. Only active providers are shown.
        </span>
      </div>
      {PRODUCTS.map(product => (
        <Card key={product} title={PRODUCT_LABELS[product]} subtitle={`Data source routing for ${product === 'simple' ? 'Simple Trade' : product} module`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SOURCE_KEYS.map(({ key, label, desc }) => (
              <div key={key} className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>{label}</div>
                <div className="text-xs mb-3" style={{ color: 'var(--text-4)' }}>{desc}</div>
                <Sel
                  value={sourceConfig[product][key]}
                  onChange={v => set(product, key, v)}
                  options={[
                    ...providerOpts,
                    ...(key === 'fallback' ? [{ value: 'none', label: '— None —' }] : []),
                  ]}
                  style={{ width: '100%' }}
                />
                <div className="mt-2 flex items-center gap-1.5">
                  {(() => {
                    const prov = providers.find(p => p.id === sourceConfig[product][key]);
                    if (!prov) return <span className="text-xs" style={{ color: 'var(--text-4)' }}>Not configured</span>;
                    const sc = STATUS_COLOR[prov.status];
                    return <>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc }} />
                      <span className="text-xs font-semibold" style={{ color: sc }}>{prov.status}</span>
                      {prov.latency > 0 && <span className="text-xs font-mono ml-auto" style={{ color: 'var(--text-4)' }}>{prov.latency}ms</span>}
                    </>;
                  })()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── 3. Symbol Config Tab ──────────────────────────────────────────────────────
function SymbolModal({ open, onClose, symbol, onSave }) {
  const [form, setForm] = useState(symbol);
  useEffect(() => { setForm(symbol); }, [symbol]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title={`Configure Symbol — ${symbol?.id}`} width={480}>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow label="Provider Spread" hint="Raw spread from data provider">
          <TextInput type="number" value={form?.spread ?? ''} onChange={v => set('spread', Number(v))} placeholder="0.00" mono />
        </FormRow>
        <FormRow label="Spread Markup" hint="Additional markup applied on top">
          <TextInput type="number" value={form?.spreadMarkup ?? ''} onChange={v => set('spreadMarkup', Number(v))} placeholder="0.00" mono />
        </FormRow>
        <FormRow label="Max Leverage">
          <TextInput type="number" value={form?.maxLeverage ?? ''} onChange={v => set('maxLeverage', Number(v))} placeholder="100" />
        </FormRow>
        <FormRow label="Min Lot Size">
          <TextInput type="number" value={form?.minLotSize ?? ''} onChange={v => set('minLotSize', Number(v))} placeholder="0.01" mono />
        </FormRow>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Symbol Active</div>
          <div className="flex items-center gap-3">
            <Toggle value={form?.active ?? true} onChange={v => set('active', v)} />
            <span className="text-xs" style={{ color: form?.active ? 'var(--green)' : 'var(--text-4)' }}>
              {form?.active ? 'Trading enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Maintenance Mode</div>
          <div className="flex items-center gap-3">
            <Toggle value={form?.maintenance ?? false} onChange={v => set('maintenance', v)} />
            <span className="text-xs" style={{ color: form?.maintenance ? 'var(--warn)' : 'var(--text-4)' }}>
              {form?.maintenance ? 'Under maintenance' : 'Normal'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid var(--border-0)' }}>
        <button onClick={onClose} className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-0)' }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)} className="btn-brand flex-1 py-2 rounded-xl text-xs font-bold">
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

function SymbolsTab({ symbols, setSymbols }) {
  const [modal, setModal] = useState({ open: false, symbol: null });
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? symbols : symbols.filter(s => s.product === filter);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Symbols" value={symbols.length} icon={Database} accent="var(--brand)" />
        <StatCard label="Active" value={symbols.filter(s => s.active && !s.maintenance).length} icon={Check} accent="var(--green)" />
        <StatCard label="Maintenance" value={symbols.filter(s => s.maintenance).length} icon={AlertTriangle} accent="var(--warn)" />
        <StatCard label="Disabled" value={symbols.filter(s => !s.active).length} icon={X} accent="var(--red)" />
      </div>

      <Card title="Symbol Configuration" subtitle="Edit spread, leverage, lot size and trading status per instrument"
        actions={
          <div className="flex gap-2">
            {['all', 'crypto', 'forex'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
                style={{ background: filter === f ? 'var(--brand-bg)' : 'var(--bg-surface)', color: filter === f ? 'var(--brand-light)' : 'var(--text-3)', border: `1px solid ${filter === f ? 'rgba(59,130,246,0.2)' : 'var(--border-0)'}` }}>
                {f === 'all' ? 'All' : PRODUCT_LABELS[f]}
              </button>
            ))}
          </div>
        }>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-0)' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Symbol','Product','Category','Spread','Markup','Total','MaxLev','Min Lot','Status',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ borderTop: '1px solid var(--border-0)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-4 py-2.5"><span className="font-mono font-bold text-sm" style={{ color: 'var(--text-1)' }}>{s.id}</span></td>
                  <td className="px-4 py-2.5"><span className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{s.product}</span></td>
                  <td className="px-4 py-2.5"><span className="text-xs" style={{ color: 'var(--text-3)' }}>{s.category}</span></td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{s.spread}</td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--brand-light)' }}>+{s.spreadMarkup}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-bold" style={{ color: 'var(--text-1)' }}>{+(s.spread + s.spreadMarkup).toFixed(6)}</td>
                  <td className="px-4 py-2.5 text-xs font-mono" style={{ color: 'var(--text-2)' }}>{s.maxLeverage}x</td>
                  <td className="px-4 py-2.5 text-xs font-mono" style={{ color: 'var(--text-2)' }}>{s.minLotSize}</td>
                  <td className="px-4 py-2.5">
                    {s.maintenance
                      ? <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>Maintenance</span>
                      : s.active
                        ? <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>Active</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Disabled</span>
                    }
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setModal({ open: true, symbol: { ...s } })}
                      className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-4)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-bg)'; e.currentTarget.style.color = 'var(--brand)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}>
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SymbolModal open={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))}
        symbol={modal.symbol || {}}
        onSave={updated => { setSymbols(prev => prev.map(s => s.id === updated.id ? updated : s)); setModal(m => ({ ...m, open: false })); }} />
    </div>
  );
}

// ── 4. Spread Management Tab ──────────────────────────────────────────────────
function SpreadsTab({ symbols }) {
  const [filter, setFilter] = useState('all');
  const rows = (filter === 'all' ? symbols : symbols.filter(s => s.product === filter));
  const avgMarkup = rows.length ? rows.reduce((s, r) => s + r.spreadMarkup, 0) / rows.length : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Avg Provider Spread" value={rows.reduce((s, r) => s + r.spread, 0) / (rows.length || 1) < 0.01 ? (rows.reduce((s, r) => s + r.spread, 0) / (rows.length || 1)).toFixed(5) : (rows.reduce((s, r) => s + r.spread, 0) / (rows.length || 1)).toFixed(4)} icon={BarChart2} accent="var(--brand)" />
        <StatCard label="Avg Markup" value={'+' + (avgMarkup < 0.01 ? avgMarkup.toFixed(5) : avgMarkup.toFixed(4))} icon={TrendingUp} accent="var(--green)" />
        <StatCard label="Symbols in View" value={rows.length} icon={Database} accent="var(--text-2)" />
      </div>

      <Card title="Spread Management" subtitle="Provider spread + markup = final client-facing spread"
        actions={
          <div className="flex gap-2">
            {['all', 'crypto', 'forex'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
                style={{ background: filter === f ? 'var(--brand-bg)' : 'var(--bg-surface)', color: filter === f ? 'var(--brand-light)' : 'var(--text-3)', border: `1px solid ${filter === f ? 'rgba(59,130,246,0.2)' : 'var(--border-0)'}` }}>
                {f === 'all' ? 'All' : PRODUCT_LABELS[f]}
              </button>
            ))}
          </div>
        }>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-0)' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Symbol','Product','Category','Provider Spread','Markup','Final Spread','Markup %'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(s => {
                const total = s.spread + s.spreadMarkup;
                const markupPct = s.spread > 0 ? ((s.spreadMarkup / s.spread) * 100).toFixed(1) : '—';
                return (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--border-0)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-4 py-2.5 font-mono font-bold text-sm" style={{ color: 'var(--text-1)' }}>{s.id}</td>
                    <td className="px-4 py-2.5 text-xs capitalize" style={{ color: 'var(--text-3)' }}>{s.product}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--text-3)' }}>{s.category}</td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{s.spread}</td>
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold" style={{ color: 'var(--brand-light)' }}>+{s.spreadMarkup}</td>
                    <td className="px-4 py-2.5 font-mono text-sm font-bold" style={{ color: 'var(--text-1)' }}>{+total.toFixed(6)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-surface)', maxWidth: 80 }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, Number(markupPct) * 2)}%`, background: Number(markupPct) > 30 ? 'var(--warn)' : 'var(--brand)' }} />
                        </div>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{markupPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── 5. Price Override Tab ─────────────────────────────────────────────────────
function OverridesTab({ symbols }) {
  const [overrides, setOverrides] = useState(() =>
    Object.fromEntries(symbols.map(s => [s.id, { enabled: false, price: '', paused: false, simMin: '', simMax: '', volatility: '0.10', frequency: '5' }]))
  );
  const upd = (id, k, v) => setOverrides(prev => ({ ...prev, [id]: { ...prev[id], [k]: v } }));
  const activeCount = Object.values(overrides).filter(o => o.enabled).length;
  const pausedCount = Object.values(overrides).filter(o => o.paused).length;

  return (
    <div className="space-y-4">
      {activeCount > 0 && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
          style={{ background: 'rgba(212,67,51,0.1)', border: '1px solid rgba(212,67,51,0.35)' }}>
          <AlertTriangle size={18} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--red)' }}>
              {activeCount} Manual Price Override{activeCount !== 1 ? 's' : ''} Active
            </div>
            <div className="text-xs" style={{ color: 'var(--red)', opacity: 0.85 }}>
              Manual overrides bypass live market data. Prices shown to clients will not reflect real-market conditions. Ensure this is intentional.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active Overrides" value={activeCount} icon={AlertTriangle} accent={activeCount > 0 ? 'var(--red)' : 'var(--text-3)'} />
        <StatCard label="Feeds Paused" value={pausedCount} icon={Server} accent={pausedCount > 0 ? 'var(--warn)' : 'var(--text-3)'} />
        <StatCard label="Live Feeds" value={symbols.length - pausedCount} icon={Wifi} accent="var(--green)" />
      </div>

      <Card title="Price Override & Manual Control" subtitle="Override live prices or pause API feed per instrument">
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-0)' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Symbol','Product','Override','Manual Price','Pause Feed','Sim Range (min–max)','Volatility','Freq (s)'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map(s => {
                const o = overrides[s.id];
                const rowBg = o.enabled ? 'rgba(212,67,51,0.04)' : '';
                return (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--border-0)', background: rowBg }}>
                    <td className="px-4 py-2.5"><span className="font-mono font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{s.id}</span></td>
                    <td className="px-4 py-2.5 text-xs capitalize" style={{ color: 'var(--text-3)' }}>{s.product}</td>
                    <td className="px-4 py-2.5"><Toggle value={o.enabled} onChange={v => upd(s.id, 'enabled', v)} /></td>
                    <td className="px-4 py-2.5">
                      <input type="number" placeholder="0.00" value={o.price} onChange={e => upd(s.id, 'price', e.target.value)}
                        disabled={!o.enabled} className="input-dark text-xs font-mono"
                        style={{ padding: '0.3rem 0.5rem', width: 110, opacity: o.enabled ? 1 : 0.38 }} />
                    </td>
                    <td className="px-4 py-2.5"><Toggle value={o.paused} onChange={v => upd(s.id, 'paused', v)} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <input type="number" placeholder="min" value={o.simMin} onChange={e => upd(s.id, 'simMin', e.target.value)}
                          disabled={!o.enabled} className="input-dark text-xs font-mono"
                          style={{ padding: '0.3rem 0.4rem', width: 70, opacity: o.enabled ? 1 : 0.38 }} />
                        <span className="text-xs" style={{ color: 'var(--text-4)' }}>–</span>
                        <input type="number" placeholder="max" value={o.simMax} onChange={e => upd(s.id, 'simMax', e.target.value)}
                          disabled={!o.enabled} className="input-dark text-xs font-mono"
                          style={{ padding: '0.3rem 0.4rem', width: 70, opacity: o.enabled ? 1 : 0.38 }} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="number" step="0.01" value={o.volatility} onChange={e => upd(s.id, 'volatility', e.target.value)}
                        disabled={!o.enabled} className="input-dark text-xs font-mono"
                        style={{ padding: '0.3rem 0.5rem', width: 70, opacity: o.enabled ? 1 : 0.38 }} />
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="number" value={o.frequency} onChange={e => upd(s.id, 'frequency', e.target.value)}
                        disabled={!o.enabled} className="input-dark text-xs font-mono"
                        style={{ padding: '0.3rem 0.5rem', width: 60, opacity: o.enabled ? 1 : 0.38 }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── 6. Chart Management Tab ───────────────────────────────────────────────────
function ChartsTab({ chartConfig, setChartConfig, providers }) {
  const set = (product, key, value) =>
    setChartConfig(prev => ({ ...prev, [product]: { ...prev[product], [key]: value } }));
  const chartProviders = providers.filter(p => p.enabled).map(p => ({ value: p.id, label: p.name }));

  return (
    <div className="space-y-4">
      <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-3"
        style={{ background: 'var(--brand-bg)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <TrendingUp size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
        <span style={{ color: 'var(--brand-light)' }}>
          Chart settings control the data source, default view, and behaviour of the built-in trading charts across each product module.
        </span>
      </div>

      {PRODUCTS.map(product => {
        const cfg = chartConfig[product];
        const srcProv = providers.find(p => p.id === cfg.source);
        return (
          <Card key={product} title={PRODUCT_LABELS[product]} subtitle="Chart data source, default timeframe and display preferences">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Data Source</div>
                <Sel value={cfg.source} onChange={v => set(product, 'source', v)} options={chartProviders} style={{ width: '100%' }} />
                {srcProv && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[srcProv.status] }} />
                    <span className="text-xs" style={{ color: STATUS_COLOR[srcProv.status] }}>{srcProv.status}</span>
                    {srcProv.latency > 0 && <span className="text-xs font-mono ml-auto" style={{ color: 'var(--text-4)' }}>{srcProv.latency}ms</span>}
                  </div>
                )}
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Default Timeframe</div>
                <Sel value={cfg.defaultTimeframe} onChange={v => set(product, 'defaultTimeframe', v)}
                  options={TF_OPTIONS.map(t => ({ value: t, label: t }))} style={{ width: '100%' }} />
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Theme</div>
                <Sel value={cfg.theme} onChange={v => set(product, 'theme', v)}
                  options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} style={{ width: '100%' }} />
              </div>
              <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Indicators Enabled</div>
                  <Toggle value={cfg.indicators} onChange={v => set(product, 'indicators', v)} />
                </div>
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>Volume Display</div>
                  <Toggle value={cfg.volume} onChange={v => set(product, 'volume', v)} />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── 7. API Health Tab ─────────────────────────────────────────────────────────
function HealthTab({ providers }) {
  const initHealth = providers.filter(p => p.enabled).map(p => ({
    id: p.id, name: p.name, type: p.type, status: p.status,
    latency: p.latency, errorRate: p.errorRate, lastResponse: p.lastSeen,
    wsStatus: p.wsUrl ? (p.status === 'connected' ? 'open' : 'closed') : 'N/A',
    rateLimit: p.rateLimit, callsUsed: Math.floor(Math.random() * 500 + 80),
    uptime: p.uptime,
  }));
  const [health, setHealth] = useState(initHealth);
  const secsRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      secsRef.current += 3;
      setHealth(prev => prev.map(h => {
        if (h.status !== 'connected') return h;
        const jitter = (Math.random() - 0.5) * 10;
        const newLat = Math.max(1, Math.round(h.latency + jitter));
        const newErr = Math.max(0, +(h.errorRate + (Math.random() - 0.5) * 0.004).toFixed(4));
        const t = Math.floor(Math.random() * 4 + 1);
        return { ...h, latency: newLat, errorRate: newErr, lastResponse: t + 's ago', callsUsed: h.callsUsed + Math.floor(Math.random() * 4) };
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const avgLat = health.filter(h => h.latency > 0).reduce((s, h) => s + h.latency, 0) / (health.filter(h => h.latency > 0).length || 1);
  const maxErr = Math.max(...health.map(h => h.errorRate));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Monitored Feeds" value={health.length} icon={Activity} accent="var(--brand)" />
        <StatCard label="Avg Latency" value={Math.round(avgLat) + 'ms'} icon={Zap} accent={avgLat > 50 ? 'var(--warn)' : 'var(--green)'} />
        <StatCard label="Max Error Rate" value={(maxErr * 100).toFixed(2) + '%'} icon={AlertTriangle} accent={maxErr > 0.05 ? 'var(--red)' : 'var(--green)'} />
        <StatCard label="WebSocket Feeds" value={health.filter(h => h.wsStatus === 'open').length} icon={Wifi} accent="var(--green)" />
      </div>

      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-4)' }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
        Live — updating every 3 seconds
      </div>

      <Card title="Provider Health Status" subtitle="Real-time API latency, error rates and connection quality">
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-0)' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Provider','Type','Status','Latency','Error Rate','Last Response','WebSocket','Rate Limit','Calls Used','Uptime'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {health.map(h => {
                const ts = TYPE_STYLES[h.type] || TYPE_STYLES.data;
                const latColor = h.latency > 80 ? 'var(--red)' : h.latency > 40 ? 'var(--warn)' : 'var(--green)';
                const errColor = h.errorRate > 0.05 ? 'var(--red)' : h.errorRate > 0.02 ? 'var(--warn)' : 'var(--green)';
                return (
                  <tr key={h.id} style={{ borderTop: '1px solid var(--border-0)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0"
                          style={{ background: ts.b, color: ts.c }}>{h.name[0]}</div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{h.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold capitalize" style={{ color: ts.c, background: ts.b }}>{h.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[h.status] }} />
                        <span className="text-xs font-semibold capitalize" style={{ color: STATUS_COLOR[h.status] }}>{h.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-bold" style={{ color: latColor }}>
                        {h.latency > 0 ? h.latency + 'ms' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-bold" style={{ color: errColor }}>
                        {(h.errorRate * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-3)' }}>{h.lastResponse}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold"
                        style={{ color: h.wsStatus === 'open' ? 'var(--green)' : h.wsStatus === 'N/A' ? 'var(--text-4)' : 'var(--red)' }}>
                        {h.wsStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-3)' }}>{h.rateLimit}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-2)' }}>{h.callsUsed.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: h.uptime >= 99.5 ? 'var(--green)' : h.uptime >= 98 ? 'var(--warn)' : 'var(--red)' }}>
                        {h.uptime > 0 ? h.uptime + '%' : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── 8. Fallback Rules Tab ─────────────────────────────────────────────────────
const EMPTY_RULE = { id: '', product: 'crypto', assetClass: '', primary: 'binance', secondary: 'twelvedata', tertiary: 'tradingview', latencyThreshold: 300, errorThreshold: 5, autoSwitch: true };

function FallbackModal({ open, onClose, initial, onSave, providerOpts }) {
  const [form, setForm] = useState(initial);
  useEffect(() => { setForm(initial); }, [initial]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title={initial?.id?.startsWith('fb_') ? 'Add Fallback Rule' : `Edit Rule — ${initial?.assetClass || ''}`} width={520}>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow label="Product">
          <Sel value={form?.product} onChange={v => set('product', v)}
            options={PRODUCTS.map(p => ({ value: p, label: PRODUCT_LABELS[p] }))} style={{ width: '100%' }} />
        </FormRow>
        <FormRow label="Asset Class / Label">
          <TextInput value={form?.assetClass ?? ''} onChange={v => set('assetClass', v)} placeholder="e.g. Major Pairs" />
        </FormRow>
      </div>
      <div className="grid grid-cols-3 gap-x-4">
        <FormRow label="Primary Provider">
          <Sel value={form?.primary} onChange={v => set('primary', v)} options={providerOpts} style={{ width: '100%' }} />
        </FormRow>
        <FormRow label="Secondary Provider">
          <Sel value={form?.secondary} onChange={v => set('secondary', v)} options={providerOpts} style={{ width: '100%' }} />
        </FormRow>
        <FormRow label="Tertiary Provider">
          <Sel value={form?.tertiary} onChange={v => set('tertiary', v)} options={providerOpts} style={{ width: '100%' }} />
        </FormRow>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow label="Latency Threshold (ms)" hint="Switch provider when latency exceeds this value">
          <TextInput type="number" value={form?.latencyThreshold ?? ''} onChange={v => set('latencyThreshold', Number(v))} placeholder="300" />
        </FormRow>
        <FormRow label="Error Rate Threshold (%)" hint="Switch provider when error rate exceeds this %">
          <TextInput type="number" value={form?.errorThreshold ?? ''} onChange={v => set('errorThreshold', Number(v))} placeholder="5" />
        </FormRow>
      </div>
      <FormRow label="Auto-Switch">
        <div className="flex items-center gap-3">
          <Toggle value={form?.autoSwitch ?? true} onChange={v => set('autoSwitch', v)} />
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {form?.autoSwitch ? 'Automatically switch when thresholds are breached' : 'Manual override only — alerts but no auto-switch'}
          </span>
        </div>
      </FormRow>
      <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid var(--border-0)' }}>
        <button onClick={onClose} className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-0)' }}>Cancel</button>
        <button onClick={() => onSave(form)} className="btn-brand flex-1 py-2 rounded-xl text-xs font-bold">Save Rule</button>
      </div>
    </Modal>
  );
}

function FallbackTab({ fallbackRules, setFallbackRules, providers }) {
  const [modal, setModal] = useState({ open: false, editing: EMPTY_RULE });
  const [delId, setDelId] = useState(null);
  const providerOpts = providers.map(p => ({ value: p.id, label: p.name }));
  const pName = id => providers.find(p => p.id === id)?.name ?? id;

  const openAdd = () => setModal({ open: true, editing: { ...EMPTY_RULE, id: 'fb_' + Date.now() } });
  const openEdit = r => setModal({ open: true, editing: { ...r } });
  const handleSave = rule => {
    setFallbackRules(prev => prev.some(r => r.id === rule.id) ? prev.map(r => r.id === rule.id ? rule : r) : [...prev, rule]);
    setModal(m => ({ ...m, open: false }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: 'var(--brand-bg)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <GitBranch size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
        <span className="text-sm" style={{ color: 'var(--brand-light)' }}>
          Fallback rules define automatic provider switching when latency or error thresholds are breached.
          Rules are evaluated in order — primary → secondary → tertiary.
        </span>
      </div>

      <Card title="Fallback Rules" subtitle="Automatic provider failover configuration per product and asset class"
        actions={
          <button onClick={openAdd} className="btn-brand flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold">
            <Plus size={14} /> Add Rule
          </button>
        }>
        <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-0)' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Product','Asset Class','Primary','Secondary','Tertiary','Lat. Threshold','Err. Threshold','Auto-Switch',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fallbackRules.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border-0)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-4 py-3 text-xs capitalize font-semibold" style={{ color: 'var(--text-2)' }}>{r.product}</td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{r.assetClass}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{pName(r.primary)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: 'var(--warn)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-2)' }}>{pName(r.secondary)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: 'var(--text-4)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{pName(r.tertiary)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{r.latencyThreshold}ms</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>{r.errorThreshold}%</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: r.autoSwitch ? 'var(--green-bg)' : 'var(--bg-surface)', color: r.autoSwitch ? 'var(--green)' : 'var(--text-3)' }}>
                      {r.autoSwitch ? 'Auto' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg"
                        style={{ color: 'var(--text-4)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-bg)'; e.currentTarget.style.color = 'var(--brand)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}>
                        <Pencil size={13} />
                      </button>
                      {delId === r.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => { setFallbackRules(prev => prev.filter(x => x.id !== r.id)); setDelId(null); }}
                            className="px-2 py-1 rounded text-xs font-bold" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Del</button>
                          <button onClick={() => setDelId(null)} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--bg-surface)', color: 'var(--text-3)' }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDelId(r.id)} className="p-1.5 rounded-lg"
                          style={{ color: 'var(--text-4)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-bg)'; e.currentTarget.style.color = 'var(--red)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <FallbackModal open={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))}
        initial={modal.editing} onSave={handleSave} providerOpts={providerOpts} />
    </div>
  );
}

// ── Main Console ──────────────────────────────────────────────────────────────
export default function MarketDataConsole() {
  const [tab, setTab] = useState('providers');
  const [providers, setProviders]       = useState(INITIAL_PROVIDERS);
  const [sourceConfig, setSourceConfig] = useState(INITIAL_SOURCE_CONFIG);
  const [symbols, setSymbols]           = useState(INITIAL_SYMBOLS);
  const [chartConfig, setChartConfig]   = useState(INITIAL_CHART_CONFIG);
  const [fallbackRules, setFallbackRules] = useState(INITIAL_FALLBACK_RULES);

  const connectedCount = providers.filter(p => p.enabled && p.status === 'connected').length;
  const degradedCount  = providers.filter(p => p.status === 'degraded').length;

  return (
    <div>
      <PageHeader
        title="Market Data Console"
        subtitle="Manage data providers, symbol configuration, spreads, pricing and failover rules"
        actions={
          <div className="flex items-center gap-3">
            {degradedCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle size={13} /> {degradedCount} Degraded
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(30,167,116,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
              {connectedCount} Connected
            </div>
          </div>
        }
      />

      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1"
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative flex-shrink-0"
              style={{ color: active ? 'var(--brand-light)' : 'var(--text-3)', background: active ? 'var(--brand-bg)' : 'transparent', borderRadius: '8px 8px 0 0' }}>
              <Icon size={14} />
              {t.label}
              {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: 'var(--brand)' }} />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'providers' && <ProvidersTab providers={providers} setProviders={setProviders} />}
      {tab === 'sources'   && <SourcesTab sourceConfig={sourceConfig} setSourceConfig={setSourceConfig} providers={providers} />}
      {tab === 'symbols'   && <SymbolsTab symbols={symbols} setSymbols={setSymbols} />}
      {tab === 'spreads'   && <SpreadsTab symbols={symbols} />}
      {tab === 'overrides' && <OverridesTab symbols={symbols} />}
      {tab === 'charts'    && <ChartsTab chartConfig={chartConfig} setChartConfig={setChartConfig} providers={providers} />}
      {tab === 'health'    && <HealthTab providers={providers} />}
      {tab === 'fallback'  && <FallbackTab fallbackRules={fallbackRules} setFallbackRules={setFallbackRules} providers={providers} />}
    </div>
  );
}
