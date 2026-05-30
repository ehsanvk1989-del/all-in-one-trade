import React, { useState, useCallback, createContext, useContext } from 'react';
import {
  Settings as SettingsIcon, Globe, Sliders, Bell, Shield, Wallet, Palette,
  Terminal, ChevronRight, Check, AlertCircle, RefreshCw, Download,
  Lock, Smartphone, Zap, Sun, Eye, Volume2, Mail, MessageSquare,
  ToggleLeft, Gauge, Clock, Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── Settings persistence ──────────────────────────────────────────────────────
const DEFAULTS = {
  // General
  language:       'English',
  timezone:       'UTC+0 (London)',
  dateFormat:     'DD/MM/YYYY',
  numberFormat:   'en-US',
  // Trading
  defaultLeverage:   10,
  defaultPositionSize: 100,
  confirmOpen:       true,
  confirmClose:      true,
  oneClickTrading:   false,
  preferredMarket:   'simple',
  showPnlInHeader:   true,
  // Notifications
  tradeNotifications: true,
  positionAlerts:     true,
  tpAlerts:           true,
  slAlerts:           true,
  marginAlerts:       true,
  liquidationAlerts:  true,
  emailNotifications: false,
  pushNotifications:  false,
  // Appearance
  compactMode:    false,
  animations:     true,
  uiDensity:      'comfortable',
  chartStyle:     'candles',
  // Wallet
  preferredNetwork:   'TRC20',
  withdrawConfirm:    true,
  autoConvert:        false,
  // Security (display only)
  sessionTimeout:     '4h',
  loginNotifications: true,
  // Advanced
  dataSharing: false,
};

function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('pt_settings') || '{}') }; }
  catch { return { ...DEFAULTS }; }
}

function saveSettings(s) {
  try { localStorage.setItem('pt_settings', JSON.stringify(s)); } catch { /* ignore */ }
}

// ── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'general',       label: 'General',       icon: Globe,         desc: 'Language, timezone, formats' },
  { id: 'trading',       label: 'Trading',        icon: Sliders,       desc: 'Leverage, risk, execution' },
  { id: 'notifications', label: 'Notifications',  icon: Bell,          desc: 'Alerts and communication' },
  { id: 'appearance',    label: 'Appearance',     icon: Palette,       desc: 'Theme, density, animations' },
  { id: 'security',      label: 'Security',       icon: Shield,        desc: 'Password, 2FA, sessions' },
  { id: 'wallet',        label: 'Wallet',         icon: Wallet,        desc: 'Networks, withdrawal, deposits' },
  { id: 'advanced',      label: 'Advanced',       icon: Terminal,      desc: 'Reset, export, privacy' },
];

// ── Reusable controls ─────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-300"
      style={{ background: value ? 'var(--green)' : 'var(--border-1)' }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
        style={{ left: value ? '22px' : '2px' }} />
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input-dark text-xs py-1.5 pr-7"
      style={{ width: 'auto', minWidth: 140 }}>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-3.5 gap-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
      <div className="min-w-0">
        <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{desc}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
      <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-0)' }}>
        <Icon size={14} style={{ color: 'var(--brand)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{title}</span>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function SegmentControl({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg p-0.5 gap-0.5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className="px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200"
          style={{
            background: value === o.value ? 'var(--brand-bg)' : 'transparent',
            color: value === o.value ? 'var(--brand-light)' : 'var(--text-3)',
            border: `1px solid ${value === o.value ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NumericInput({ value, onChange, min, max, step = 1, suffix }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, value - step))}
        className="w-7 h-7 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', color: 'var(--text-2)' }}>−</button>
      <span className="font-mono text-sm font-bold w-12 text-center" style={{ color: 'var(--text-1)' }}>{value}{suffix}</span>
      <button onClick={() => onChange(Math.min(max, value + step))}
        className="w-7 h-7 rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', color: 'var(--text-2)' }}>+</button>
    </div>
  );
}

// ── Section panels ────────────────────────────────────────────────────────────
function GeneralSection({ s, set }) {
  return (
    <>
      <SectionCard title="Localisation" icon={Globe}>
        <Row label="Display Language" desc="Interface language throughout the platform">
          <Select value={s.language} onChange={v => set('language', v)}
            options={['English', 'Arabic', 'French', 'German', 'Spanish', 'Portuguese', 'Turkish']} />
        </Row>
        <Row label="Time Zone" desc="Used for all timestamps and market session display">
          <Select value={s.timezone} onChange={v => set('timezone', v)}
            options={['UTC+0 (London)', 'UTC+1 (Paris)', 'UTC+3 (Dubai)', 'UTC+5:30 (Mumbai)', 'UTC+8 (Singapore)', 'UTC-5 (New York)', 'UTC-8 (Los Angeles)']} />
        </Row>
        <Row label="Date Format" desc="Affects all date displays across the platform">
          <Select value={s.dateFormat} onChange={v => set('dateFormat', v)}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
            ]} />
        </Row>
        <Row label="Number Format" desc="Controls decimal and thousands separator">
          <Select value={s.numberFormat} onChange={v => set('numberFormat', v)}
            options={[
              { value: 'en-US', label: '1,234,567.89 (US)' },
              { value: 'en-GB', label: '1,234,567.89 (UK)' },
              { value: 'de-DE', label: '1.234.567,89 (EU)' },
            ]} />
        </Row>
      </SectionCard>
    </>
  );
}

function TradingSection({ s, set }) {
  return (
    <>
      <SectionCard title="Execution Defaults" icon={Sliders}>
        <Row label="Default Leverage" desc="Pre-filled leverage when opening a new position">
          <NumericInput value={s.defaultLeverage} onChange={v => set('defaultLeverage', v)} min={1} max={100} step={5} suffix="x" />
        </Row>
        <Row label="Default Position Size ($)" desc="Pre-filled margin amount for new positions">
          <NumericInput value={s.defaultPositionSize} onChange={v => set('defaultPositionSize', v)} min={10} max={10000} step={50} suffix="" />
        </Row>
        <Row label="Preferred Market" desc="Module shown by default on the selection screen">
          <Select value={s.preferredMarket} onChange={v => set('preferredMarket', v)}
            options={[
              { value: 'simple', label: 'Simple Trade' },
              { value: 'crypto', label: 'Crypto Futures' },
              { value: 'forex', label: 'Forex & Commodities' },
            ]} />
        </Row>
      </SectionCard>

      <SectionCard title="Order Confirmations" icon={Zap}>
        <Row label="Confirm Before Opening" desc="Show a confirmation dialog before placing orders">
          <Toggle value={s.confirmOpen} onChange={v => set('confirmOpen', v)} />
        </Row>
        <Row label="Confirm Before Closing" desc="Show a confirmation dialog before closing positions">
          <Toggle value={s.confirmClose} onChange={v => set('confirmClose', v)} />
        </Row>
        <Row label="One-Click Trading" desc="Open positions instantly with a single click — use with caution">
          <Toggle value={s.oneClickTrading} onChange={v => set('oneClickTrading', v)} />
        </Row>
        {s.oneClickTrading && (
          <div className="mb-3 p-3 rounded-lg flex gap-2 items-start" style={{ background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertCircle size={13} style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }} />
            <span className="text-xs" style={{ color: 'var(--warn)' }}>One-click trading bypasses order confirmation. Make sure your position sizes and leverage are set correctly before trading.</span>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Display" icon={Eye}>
        <Row label="Show P&L in Header" desc="Display unrealised profit/loss in the top navigation bar">
          <Toggle value={s.showPnlInHeader} onChange={v => set('showPnlInHeader', v)} />
        </Row>
        <Row label="Default Chart Style" desc="Chart type shown when opening a trading terminal">
          <SegmentControl value={s.chartStyle} onChange={v => set('chartStyle', v)}
            options={[{ value: 'candles', label: 'Candles' }, { value: 'line', label: 'Line' }, { value: 'area', label: 'Area' }]} />
        </Row>
      </SectionCard>
    </>
  );
}

function NotificationsSection({ s, set }) {
  const tradeAlerts = [
    { key: 'tradeNotifications', label: 'Trade Execution', desc: 'Notify when orders are opened or closed' },
    { key: 'positionAlerts', label: 'Position Updates', desc: 'Notify on position status changes' },
    { key: 'tpAlerts', label: 'Take Profit Hit', desc: 'Notify when a TP level is triggered' },
    { key: 'slAlerts', label: 'Stop Loss Hit', desc: 'Notify when a SL level is triggered' },
    { key: 'marginAlerts', label: 'Margin Warning', desc: 'Alert when margin level drops below 150%' },
    { key: 'liquidationAlerts', label: 'Liquidation Warning', desc: 'Critical alert when liquidation is imminent' },
  ];

  return (
    <>
      <SectionCard title="Trade Alerts" icon={Bell}>
        {tradeAlerts.map(a => (
          <Row key={a.key} label={a.label} desc={a.desc}>
            <Toggle value={s[a.key]} onChange={v => set(a.key, v)} />
          </Row>
        ))}
      </SectionCard>

      <SectionCard title="Communication Channels" icon={Mail}>
        <Row label="Email Notifications" desc="Receive trade summaries and account alerts via email">
          <Toggle value={s.emailNotifications} onChange={v => set('emailNotifications', v)} />
        </Row>
        <Row label="Push Notifications" desc="Browser push notifications for real-time alerts">
          <Toggle value={s.pushNotifications} onChange={v => set('pushNotifications', v)} />
        </Row>
      </SectionCard>
    </>
  );
}

function AppearanceSection({ s, set }) {
  return (
    <>
      <SectionCard title="Layout" icon={Layers}>
        <Row label="UI Density" desc="Controls spacing and element sizes throughout the platform">
          <SegmentControl value={s.uiDensity} onChange={v => set('uiDensity', v)}
            options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }, { value: 'spacious', label: 'Spacious' }]} />
        </Row>
        <Row label="Compact Mode" desc="Reduce padding and margins for denser information display">
          <Toggle value={s.compactMode} onChange={v => set('compactMode', v)} />
        </Row>
      </SectionCard>

      <SectionCard title="Motion" icon={Gauge}>
        <Row label="Animations" desc="Enable transitions, hover effects, and entrance animations">
          <Toggle value={s.animations} onChange={v => set('animations', v)} />
        </Row>
      </SectionCard>

      {/* Theme preview */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-0)' }}>
          <Sun size={14} style={{ color: 'var(--brand)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Theme</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'dark', label: 'Dark Pro', desc: 'Default premium dark theme', active: true },
              { id: 'darker', label: 'Midnight', desc: 'Deeper blacks for OLED screens', active: false },
            ].map(t => (
              <div key={t.id} className="relative rounded-xl p-3 cursor-pointer"
                style={{ background: 'var(--bg-surface)', border: `1px solid ${t.active ? 'rgba(99,102,241,0.4)' : 'var(--border-0)'}` }}>
                {t.active && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--brand)' }}>
                    <Check size={11} color="#fff" />
                  </div>
                )}
                <div className="h-10 rounded-lg mb-2" style={{ background: t.id === 'dark' ? '#0c0d13' : '#060608' }} />
                <div className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{t.label}</div>
                <div className="text-xs" style={{ color: 'var(--text-4)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-4)' }}>Light theme coming in a future release.</p>
        </div>
      </div>
    </>
  );
}

function SecuritySection({ s, set }) {
  const [expanded2fa, setExpanded2fa] = useState(false);
  const logins = [
    { device: 'Chrome · macOS', ip: '82.44.xx.xx', location: 'London, UK', time: 'Just now', current: true },
    { device: 'Safari · iPhone 15', ip: '82.44.xx.xx', location: 'London, UK', time: '3 hours ago', current: false },
    { device: 'Chrome · Windows', ip: '195.12.xx.xx', location: 'Manchester, UK', time: 'Yesterday 18:41', current: false },
  ];

  return (
    <>
      <SectionCard title="Authentication" icon={Lock}>
        <Row label="Session Timeout" desc="Automatically log out after a period of inactivity">
          <Select value={s.sessionTimeout} onChange={v => set('sessionTimeout', v)}
            options={[
              { value: '1h', label: '1 hour' },
              { value: '4h', label: '4 hours' },
              { value: '24h', label: '24 hours' },
              { value: 'never', label: 'Never' },
            ]} />
        </Row>
        <Row label="Login Notifications" desc="Receive an alert when a new login occurs on your account">
          <Toggle value={s.loginNotifications} onChange={v => set('loginNotifications', v)} />
        </Row>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication" icon={Smartphone}>
        <div className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>Authenticator App</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>Use Google Authenticator, Authy, or 1Password for time-based codes.</div>
              <div className="mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  Not enabled
                </span>
              </div>
            </div>
            <button onClick={() => setExpanded2fa(v => !v)}
              className="px-4 py-2 rounded-lg text-xs font-bold btn-brand flex-shrink-0">
              {expanded2fa ? 'Cancel' : 'Enable 2FA'}
            </button>
          </div>
          {expanded2fa && (
            <div className="mt-4 p-4 rounded-xl animate-fade-in" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>
                Scan the QR code below with your authenticator app, then enter the 6-digit code to confirm.
              </p>
              <div className="w-28 h-28 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#fff' }}>
                <span className="text-xs font-mono text-black opacity-40">QR Code</span>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter 6-digit code" className="input-dark text-sm flex-1" maxLength={6} />
                <button className="px-4 py-2 rounded-lg text-xs font-bold btn-brand">Verify</button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-0)' }}>
          <Clock size={14} style={{ color: 'var(--brand)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Login History</span>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-0)' }}>
          {logins.map((l, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{l.device}</span>
                  {l.current && <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>Current</span>}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{l.location} · {l.ip}</div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{l.time}</div>
                {!l.current && <button className="text-xs" style={{ color: 'var(--red)' }}>Revoke</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function WalletSection({ s, set }) {
  return (
    <>
      <SectionCard title="Deposit & Withdrawal" icon={Wallet}>
        <Row label="Preferred Network" desc="Default network pre-selected when making deposits or withdrawals">
          <Select value={s.preferredNetwork} onChange={v => set('preferredNetwork', v)}
            options={[
              { value: 'TRC20', label: 'TRON (TRC20) — Low fees' },
              { value: 'ERC20', label: 'Ethereum (ERC20)' },
              { value: 'BEP20', label: 'BSC (BEP20)' },
            ]} />
        </Row>
        <Row label="Withdrawal Confirmation" desc="Require email confirmation for every withdrawal request">
          <Toggle value={s.withdrawConfirm} onChange={v => set('withdrawConfirm', v)} />
        </Row>
        <Row label="Auto-Convert to USDT" desc="Automatically convert deposited assets to USDT on arrival">
          <Toggle value={s.autoConvert} onChange={v => set('autoConvert', v)} />
        </Row>
      </SectionCard>

      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--brand-bg2)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <div className="flex items-start gap-3">
          <AlertCircle size={14} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Demo Platform</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
              This is a simulated trading environment. All funds, positions, and transactions are for demonstration purposes only. No real money is involved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AdvancedSection({ s, set, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const { tradeHistory, wallet } = useApp();

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      tradeHistory,
      transactions: wallet?.transactions || [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plus-trade-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SectionCard title="Data & Privacy" icon={Eye}>
        <Row label="Usage Analytics" desc="Share anonymous usage data to help improve the platform">
          <Toggle value={s.dataSharing} onChange={v => set('dataSharing', v)} />
        </Row>
        <Row label="Export My Data" desc="Download all your trade history and activity as JSON">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--brand-bg)', color: 'var(--brand)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Download size={12} /> Export
          </button>
        </Row>
      </SectionCard>

      <SectionCard title="Reset" icon={RefreshCw}>
        <div className="py-4">
          {!confirmReset ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Reset All Settings</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Restore all settings to their default values. Your trading data is unaffected.</div>
              </div>
              <button onClick={() => setConfirmReset(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0"
                style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(212,67,51,0.2)' }}>
                Reset Settings
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl" style={{ background: 'var(--red-bg)', border: '1px solid rgba(212,67,51,0.2)' }}>
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--red)' }}>Are you sure?</div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-2)' }}>This will reset all preferences to defaults. Your account and trade history will not be affected.</p>
              <div className="flex gap-3">
                <button onClick={() => { onReset(); setConfirmReset(false); }}
                  className="px-4 py-2 rounded-lg text-xs font-bold"
                  style={{ background: 'var(--red)', color: '#fff' }}>
                  Yes, Reset Everything
                </button>
                <button onClick={() => setConfirmReset(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-1)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  const set = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSettings({ ...DEFAULTS });
    saveSettings({ ...DEFAULTS });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const active = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="flex-1 overflow-hidden flex">

      {/* Left sidebar */}
      <div className="flex-shrink-0 w-56 overflow-y-auto"
        style={{ background: 'var(--bg-base)', borderRight: '1px solid var(--border-0)' }}>
        <div className="px-3 py-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-3 px-2" style={{ color: 'var(--text-4)' }}>Settings</div>
          <nav className="space-y-0.5">
            {SECTIONS.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                  style={{
                    background: isActive ? 'var(--brand-bg)' : 'transparent',
                    color: isActive ? 'var(--brand-light)' : 'var(--text-3)',
                    border: `1px solid ${isActive ? 'rgba(59,130,246,0.18)' : 'transparent'}`,
                  }}>
                  <Icon size={15} style={{ color: isActive ? 'var(--brand)' : 'var(--text-4)', flexShrink: 0 }} />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold leading-tight">{section.label}</div>
                  </div>
                  {isActive && <ChevronRight size={12} className="ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 overflow-y-auto">
        {/* Section header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-0)' }}>
          <div>
            <h2 className="text-base font-extrabold" style={{ color: 'var(--text-1)' }}>{active?.label}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{active?.desc}</p>
          </div>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={{
              background: saved ? 'var(--green-bg)' : 'linear-gradient(135deg, #3B82F6, #7C3AED)',
              color: saved ? 'var(--green)' : '#fff',
              border: saved ? '1px solid rgba(30,167,116,0.3)' : 'none',
            }}>
            {saved ? <><Check size={12} /> Saved</> : 'Save Changes'}
          </button>
        </div>

        <div className="px-6 py-5 max-w-2xl">
          {activeSection === 'general'       && <GeneralSection s={settings} set={set} />}
          {activeSection === 'trading'       && <TradingSection s={settings} set={set} />}
          {activeSection === 'notifications' && <NotificationsSection s={settings} set={set} />}
          {activeSection === 'appearance'    && <AppearanceSection s={settings} set={set} />}
          {activeSection === 'security'      && <SecuritySection s={settings} set={set} />}
          {activeSection === 'wallet'        && <WalletSection s={settings} set={set} />}
          {activeSection === 'advanced'      && <AdvancedSection s={settings} set={set} onReset={handleReset} />}
        </div>
      </div>
    </div>
  );
}
