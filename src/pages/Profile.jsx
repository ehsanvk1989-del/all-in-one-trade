import React, { useState, useMemo } from 'react';
import {
  User, Mail, Phone, Globe, Clock, Shield, Award, TrendingUp, TrendingDown,
  BarChart3, Activity, Lock, Smartphone, CheckCircle, AlertCircle, ChevronRight,
  Zap, LineChart, Copy, Download, Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/mockData';

// ── helpers ──────────────────────────────────────────────────────────────────
function Avatar({ name, size = 80 }) {
  const initials = (name || 'U').slice(0, 2).toUpperCase();
  return (
    <div className="rounded-full flex items-center justify-center font-black text-white relative flex-shrink-0"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
        fontSize: size * 0.33,
        boxShadow: '0 0 30px rgba(99,102,241,0.5)',
      }}>
      {initials}
      <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
        style={{ background: 'var(--green)', borderColor: 'var(--bg-card)' }} />
    </div>
  );
}

function TabBtn({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 relative whitespace-nowrap"
      style={{ color: active ? 'var(--brand-light)' : 'var(--text-3)', borderBottom: `2px solid ${active ? 'var(--brand)' : 'transparent'}` }}>
      <Icon size={14} />
      {label}
    </button>
  );
}

function InfoRow({ label, value, mono = false, copy = false }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(String(value)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-0)' }}>
      <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--text-1)' }}>{value}</span>
        {copy && (
          <button onClick={handleCopy} className="transition-colors" style={{ color: copied ? 'var(--green)' : 'var(--text-4)' }}>
            {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color = 'var(--text-1)', icon: Icon, accent }) {
  return (
    <div className="rounded-xl p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
      {accent && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />}
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{label}</span>
        {Icon && <Icon size={14} style={{ color: 'var(--text-4)' }} />}
      </div>
      <div className="font-mono text-xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  );
}

function SecurityBadge({ ok, label }) {
  return (
    <div className="flex items-center gap-2">
      {ok
        ? <CheckCircle size={14} style={{ color: 'var(--green)' }} />
        : <AlertCircle size={14} style={{ color: 'var(--warn)' }} />}
      <span className="text-xs" style={{ color: ok ? 'var(--green)' : 'var(--warn)' }}>{label}</span>
    </div>
  );
}

function MiniBar({ pct, color }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden w-24" style={{ background: 'var(--border-0)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── TABS ─────────────────────────────────────────────────────────────────────

function OverviewTab({ user, metrics, positions }) {
  const accountId = useMemo(() => {
    const seed = user?.email || 'user';
    let h = 0;
    for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
    return 'PT' + Math.abs(h).toString(16).toUpperCase().slice(0, 8).padStart(8, '0');
  }, [user?.email]);

  const memberSince = useMemo(() => {
    return new Date(user?.loginTime || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, [user?.loginTime]);

  const moduleLabels = { simple: 'Simple Trade', crypto: 'Crypto Futures', forex: 'Forex & Commodities' };
  const allocation = useMemo(() => {
    if (!positions.length) return [];
    const groups = {};
    positions.forEach(p => { groups[p.module] = (groups[p.module] || 0) + 1; });
    return Object.entries(groups).map(([mod, count]) => ({
      label: moduleLabels[mod] || mod,
      pct: Math.round((count / positions.length) * 100),
      count,
    }));
  }, [positions]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal Information */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="flex items-center gap-2 mb-4">
            <User size={15} style={{ color: 'var(--brand)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Personal Information</span>
          </div>
          <InfoRow label="Display Name" value={user?.name || '—'} />
          <InfoRow label="Email Address" value={user?.email || '—'} copy />
          <InfoRow label="Phone Number" value="+44 •••• ••• 291" />
          <InfoRow label="Country" value="United Kingdom" />
          <InfoRow label="Time Zone" value="UTC+0 (London)" />
          <InfoRow label="Language" value="English" />
          <button className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--brand-bg)', color: 'var(--brand)', border: '1px solid rgba(59,130,246,0.2)' }}>
            Edit Information
          </button>
        </div>

        {/* Account Information */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} style={{ color: 'var(--brand-light)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Account Information</span>
          </div>
          <InfoRow label="Account ID" value={accountId} mono copy />
          <InfoRow label="Member Since" value={memberSince} />
          <InfoRow label="Account Type" value="Premium" />
          <InfoRow label="Account Status" value={<span style={{ color: 'var(--green)' }}>● Active</span>} />
          <InfoRow label="Verification" value={<span style={{ color: 'var(--green)' }}>Verified</span>} />
          <InfoRow label="Last Login" value={new Date(user?.loginTime || Date.now()).toLocaleString()} />
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={15} style={{ color: 'var(--brand)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Portfolio Overview</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'var(--text-1)' },
            { label: 'Equity', value: `$${formatCurrency(metrics.equity)}`, color: metrics.equity >= metrics.balance ? 'var(--green)' : 'var(--red)' },
            { label: 'Free Margin', value: `$${formatCurrency(metrics.freeMargin)}`, color: 'var(--text-1)' },
            { label: 'Open Positions', value: String(metrics.openPositions), color: 'var(--brand-light)' },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
              <div className="font-mono text-base font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Module allocation */}
        {allocation.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Allocation by Module</div>
            {allocation.map(a => (
              <div key={a.label} className="flex items-center gap-3">
                <span className="text-xs w-36 flex-shrink-0" style={{ color: 'var(--text-2)' }}>{a.label}</span>
                <MiniBar pct={a.pct} color="var(--brand)" />
                <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-2)' }}>{a.pct}% ({a.count})</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>No open positions — allocation shown when positions are active.</div>
          </div>
        )}
      </div>

      {/* Security Overview */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={15} style={{ color: 'var(--brand)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Security Overview</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>Protected</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SecurityBadge ok label="Password Set" />
          <SecurityBadge ok={false} label="2FA Disabled" />
          <SecurityBadge ok label="Email Verified" />
          <SecurityBadge ok label="Device Trusted" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab({ tradeHistory, positions }) {
  const stats = useMemo(() => {
    const total = tradeHistory.length;
    if (total === 0) return null;
    const wins = tradeHistory.filter(t => t.pnl > 0).length;
    const losses = total - wins;
    const totalPnl = tradeHistory.reduce((s, t) => s + t.pnl, 0);
    const avgPnl = totalPnl / total;
    const totalVol = tradeHistory.reduce((s, t) => s + (t.volume * t.openPrice), 0);
    const bySymbol = {};
    tradeHistory.forEach(t => { bySymbol[t.symbol] = (bySymbol[t.symbol] || 0) + t.pnl; });
    const best = Object.entries(bySymbol).sort((a, b) => b[1] - a[1])[0];
    const worst = Object.entries(bySymbol).sort((a, b) => a[1] - b[1])[0];
    const byModule = {};
    tradeHistory.forEach(t => { byModule[t.module] = (byModule[t.module] || 0) + 1; });
    const preferredModule = Object.entries(byModule).sort((a, b) => b[1] - a[1])[0];
    const winPnl = tradeHistory.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
    const lossPnl = Math.abs(tradeHistory.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
    const rr = lossPnl > 0 ? (winPnl / wins / (lossPnl / losses)).toFixed(2) : '—';
    return { total, wins, losses, winRate: ((wins / total) * 100).toFixed(1), totalPnl, avgPnl, totalVol, best, worst, preferredModule, rr };
  }, [tradeHistory]);

  const moduleLabels = { simple: 'Simple Trade', crypto: 'Crypto Futures', forex: 'Forex & Commodities' };

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <BarChart3 size={32} style={{ color: 'var(--text-4)', marginBottom: 12 }} />
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>No completed trades yet.</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>Your analytics will appear after your first trade.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Key stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Trades" value={stats.total} icon={BarChart3}
          accent="linear-gradient(90deg, var(--brand), var(--brand-light))" />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} icon={TrendingUp}
          color={parseFloat(stats.winRate) >= 50 ? 'var(--green)' : 'var(--red)'}
          accent={parseFloat(stats.winRate) >= 50 ? 'var(--green)' : 'var(--red)'} />
        <StatCard label="Total P&L" value={`${stats.totalPnl >= 0 ? '+' : ''}$${formatCurrency(stats.totalPnl)}`}
          icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
          color={stats.totalPnl >= 0 ? 'var(--green)' : 'var(--red)'}
          accent={stats.totalPnl >= 0 ? 'var(--green)' : 'var(--red)'} />
        <StatCard label="Avg Trade" value={`${stats.avgPnl >= 0 ? '+' : ''}$${formatCurrency(stats.avgPnl)}`}
          icon={Activity}
          color={stats.avgPnl >= 0 ? 'var(--green)' : 'var(--red)'}
          accent="linear-gradient(90deg, #6366F1, #8B5CF6)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Performance breakdown */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="text-sm font-bold mb-4" style={{ color: 'var(--text-1)' }}>Performance Breakdown</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>Win / Loss</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{stats.wins}W / {stats.losses}L</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--red-bg)' }}>
                <div className="h-full rounded-full" style={{ width: `${stats.winRate}%`, background: 'var(--green)' }} />
              </div>
            </div>
            <InfoRow label="Total Volume Traded" value={`$${formatCurrency(stats.totalVol)}`} mono />
            <InfoRow label="Risk / Reward Ratio" value={`1 : ${stats.rr}`} mono />
            <InfoRow label="Preferred Module" value={moduleLabels[stats.preferredModule?.[0]] || '—'} />
            {stats.best && <InfoRow label="Best Market" value={`${stats.best[0]} (+$${formatCurrency(stats.best[1])})`} />}
            {stats.worst && <InfoRow label="Worst Market" value={`${stats.worst[0]} (-$${formatCurrency(Math.abs(stats.worst[1]))})`} />}
          </div>
        </div>

        {/* Recent closed trades */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="text-sm font-bold mb-4" style={{ color: 'var(--text-1)' }}>Recent Closed Trades</div>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 260 }}>
            {tradeHistory.slice(0, 8).map(t => {
              const win = t.pnl > 0;
              return (
                <div key={t.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: win ? 'var(--green)' : 'var(--red)' }} />
                    <div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{t.symbol}</div>
                      <div className="text-xs" style={{ color: 'var(--text-4)' }}>{t.direction?.toUpperCase()} · {t.leverage}x</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: win ? 'var(--green)' : 'var(--red)' }}>
                    {win ? '+' : ''}${formatCurrency(t.pnl)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [pass2fa, setPass2fa] = useState(false);
  const sessions = [
    { device: 'Chrome · macOS', location: 'London, UK', time: 'Active now', current: true },
    { device: 'Safari · iPhone 15', location: 'London, UK', time: '2 hours ago', current: false },
  ];

  return (
    <div className="space-y-5">
      {/* Password */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={15} style={{ color: 'var(--brand)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Password</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Last changed <span style={{ color: 'var(--text-1)' }}>Never</span></div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>We recommend changing your password every 90 days.</div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}>Weak</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {['Current Password', 'New Password', 'Confirm Password'].map(p => (
            <input key={p} type="password" placeholder={p} className="input-dark text-xs" />
          ))}
        </div>
        <button className="mt-3 px-4 py-2 rounded-lg text-xs font-bold btn-brand">
          Update Password
        </button>
      </div>

      {/* 2FA */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={15} style={{ color: 'var(--brand)' }} />
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Two-Factor Authentication</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Add an extra layer of security to your account</div>
            </div>
          </div>
          <button
            onClick={() => setPass2fa(v => !v)}
            className="relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
            style={{ background: pass2fa ? 'var(--green)' : 'var(--border-1)' }}>
            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
              style={{ left: pass2fa ? '26px' : '2px' }} />
          </button>
        </div>
        {!pass2fa && (
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--warn-bg)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-start gap-2">
              <AlertCircle size={13} style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }} />
              <span className="text-xs" style={{ color: 'var(--warn)' }}>2FA is disabled. Enable it to protect your account from unauthorised access.</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} style={{ color: 'var(--brand)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Active Sessions</span>
        </div>
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'var(--bg-surface)', border: `1px solid ${s.current ? 'rgba(59,130,246,0.2)' : 'var(--border-0)'}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                  <Smartphone size={16} style={{ color: 'var(--text-3)' }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{s.device}</div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>{s.location} · {s.time}</div>
                </div>
              </div>
              {s.current
                ? <span className="text-xs font-semibold" style={{ color: 'var(--green)' }}>Current</span>
                : <button className="text-xs font-semibold" style={{ color: 'var(--red)' }}>Revoke</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ tradeHistory, wallet }) {
  const combined = useMemo(() => {
    const trades = tradeHistory.slice(0, 10).map(t => ({
      type: 'trade',
      label: `${t.direction?.toUpperCase()} ${t.symbol}`,
      sub: `${t.leverage}x leverage · ${t.module}`,
      time: t.closeTime || '',
      value: t.pnl,
      ts: t.timestamp || 0,
    }));
    const txns = (wallet?.transactions || []).slice(0, 10).map(t => ({
      type: t.type,
      label: t.type === 'deposit' ? 'Deposit' : 'Withdrawal',
      sub: `${t.network} · ${t.status}`,
      time: t.date || '',
      value: t.type === 'deposit' ? t.amount : -t.amount,
      ts: 0,
    }));
    return [...trades, ...txns].slice(0, 12);
  }, [tradeHistory, wallet]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
        <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-0)', background: 'var(--bg-surface)' }}>
          <Activity size={14} style={{ color: 'var(--brand)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Activity Timeline</span>
        </div>
        {combined.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>No activity yet.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-0)' }}>
            {combined.map((item, i) => {
              const isTrade = item.type === 'trade';
              const isDeposit = item.type === 'deposit';
              const Icon = isTrade ? (item.value >= 0 ? TrendingUp : TrendingDown) : isDeposit ? Zap : Download;
              const iconColor = isTrade ? (item.value >= 0 ? 'var(--green)' : 'var(--red)') : isDeposit ? 'var(--brand)' : 'var(--warn)';
              const valueColor = item.value >= 0 ? 'var(--green)' : 'var(--red)';
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--bg-surface)' }}>
                    <Icon size={14} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{item.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>{item.sub}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-sm font-bold" style={{ color: valueColor }}>
                      {item.value >= 0 ? '+' : ''}${formatCurrency(Math.abs(item.value))}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-4)' }}>{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, wallet, positions, tradeHistory, getMetrics } = useApp();
  const [tab, setTab] = useState('overview');
  const metrics = getMetrics();

  const totalPnl = tradeHistory.reduce((s, t) => s + t.pnl, 0);
  const winRate = tradeHistory.length > 0
    ? ((tradeHistory.filter(t => t.pnl > 0).length / tradeHistory.length) * 100).toFixed(1)
    : '0.0';

  const TABS = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-5 pb-10">

        {/* Hero card */}
        <div className="relative rounded-2xl overflow-hidden mb-6 mt-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.06), transparent 60%)' }} />
          <div className="relative px-6 pt-6 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <Avatar name={user?.name} size={80} />
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)' }}>
                  <Camera size={12} style={{ color: 'var(--text-3)' }} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl font-extrabold capitalize" style={{ color: 'var(--text-1)' }}>
                    {user?.name || 'Trader'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(124,58,237,0.2))', color: 'var(--brand-light)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    Premium
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(30,167,116,0.2)' }}>
                    ● Active
                  </span>
                </div>
                <div className="text-sm truncate mb-3" style={{ color: 'var(--text-3)' }}>{user?.email}</div>
                <div className="flex flex-wrap gap-5">
                  {[
                    { label: 'Win Rate', value: `${winRate}%`, color: parseFloat(winRate) >= 50 ? 'var(--green)' : 'var(--warn)' },
                    { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${formatCurrency(totalPnl)}`, color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' },
                    { label: 'Total Trades', value: tradeHistory.length, color: 'var(--brand-light)' },
                    { label: 'Balance', value: `$${formatCurrency(metrics.balance)}`, color: 'var(--text-1)' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="font-mono text-base font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs" style={{ color: 'var(--text-4)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab nav attached below hero */}
          <div className="flex overflow-x-auto" style={{ borderTop: '1px solid var(--border-0)' }}>
            {TABS.map(t => (
              <TabBtn key={t.id} id={t.id} label={t.label} icon={t.icon} active={tab === t.id} onClick={setTab} />
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'overview'   && <OverviewTab user={user} metrics={metrics} positions={positions} />}
        {tab === 'analytics'  && <AnalyticsTab tradeHistory={tradeHistory} positions={positions} />}
        {tab === 'security'   && <SecurityTab />}
        {tab === 'activity'   && <ActivityTab tradeHistory={tradeHistory} wallet={wallet} />}
      </div>
    </div>
  );
}
