import React, { useState } from 'react';
import {
  Users as UsersIcon, Wallet, ArrowDownToLine, ArrowUpFromLine, TrendingUp,
  TrendingDown, Activity, DollarSign, AlertTriangle, Server, ShieldAlert,
  BarChart3, Download, CheckCircle, XCircle, Eye, Ban, RefreshCw,
  FileText, Clock, Cpu, Zap, UserCheck, Layers
} from 'lucide-react';
import {
  PageHeader, StatCard, Badge, Pill, Card, BarChart, AreaChart, DataTable, Money,
} from './adminUI';
import {
  USERS, DEPOSITS, WITHDRAWALS, TRADES, POSITIONS, AUDIT_LOGS, SYSTEM_SERVICES,
  getPlatformStats, getSeries, getTopMarkets, getFlag, formatMoney, formatFull,
} from './adminData';

const S = getPlatformStats();
const SERIES = getSeries();
const TOP_MARKETS = getTopMarkets();

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export function Dashboard({ onNavigate }) {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview and key performance indicators" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Users" value={S.totalUsers} icon={UsersIcon} accent="#3B82F6" sub={`${S.activeUsers} active`} trend={8} />
        <StatCard label="Total Balance" value={`$${formatMoney(S.totalBalance)}`} icon={Wallet} accent="#7C3AED" sub="across all wallets" trend={5} />
        <StatCard label="Net Flow (30d)" value={`$${formatMoney(S.netFlow)}`} icon={DollarSign} accent="#1ea774" sub="deposits − withdrawals" trend={12} />
        <StatCard label="Trading Volume" value={`$${formatMoney(S.totalVolume)}`} icon={BarChart3} accent="#6366F1" sub={`${S.totalTrades} trades`} trend={-3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <Card title="Deposits vs Withdrawals" subtitle="Last 14 days">
            <BarChart data={SERIES} valueKey="deposits" color2={{ key: 'withdrawals', color: 'var(--brand-light)' }} color="var(--brand)" height={200} />
            <div className="flex items-center gap-5 mt-4 justify-center">
              <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}><span className="w-3 h-3 rounded" style={{ background: 'var(--brand)' }} /> Deposits</span>
              <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}><span className="w-3 h-3 rounded" style={{ background: 'var(--brand-light)' }} /> Withdrawals</span>
            </div>
          </Card>
        </div>
        <Card title="Quick Stats">
          <div className="space-y-3.5">
            {[
              { label: 'Active Positions', value: S.openPositions, color: 'var(--brand-light)' },
              { label: 'Open Exposure', value: `$${formatMoney(S.openExposure)}`, color: 'var(--text-1)' },
              { label: 'Pending KYC', value: S.pendingKyc, color: 'var(--warn)' },
              { label: 'Pending Withdrawals', value: S.pendingWithdrawalsCount, color: 'var(--warn)' },
              { label: 'High-Risk Positions', value: S.highRiskPositions, color: 'var(--red)' },
              { label: 'Platform Win Rate', value: `${S.winRate}%`, color: 'var(--green)' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-3)' }}>{item.label}</span>
                <span className="font-mono text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="New User Growth" subtitle="Daily sign-ups, last 14 days">
          <AreaChart data={SERIES} valueKey="newUsers" color="var(--brand)" height={180} />
        </Card>
        <Card title="Top Markets" subtitle="By trading volume" noPad>
          <div className="divide-y" style={{ borderColor: 'var(--border-0)' }}>
            {TOP_MARKETS.slice(0, 6).map((m, i) => (
              <div key={m.symbol} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs w-5" style={{ color: 'var(--text-4)' }}>{i + 1}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{m.symbol}</span>
                  <Pill>{m.trades} trades</Pill>
                </div>
                <span className="font-mono text-sm" style={{ color: 'var(--text-2)' }}>${formatMoney(m.volume)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── USERS ─────────────────────────────────────────────────────────────────────
export function UsersSection() {
  const [selected, setSelected] = useState(null);
  const columns = [
    { key: 'name', label: 'User', sortable: true, render: r => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>{r.name[0]}</div>
        <div>
          <div className="font-semibold" style={{ color: 'var(--text-1)' }}>{r.name}</div>
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.email}</div>
        </div>
      </div>
    ) },
    { key: 'id', label: 'ID', render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'country', label: 'Country', render: r => <span>{getFlag(r.country)} {r.country}</span> },
    { key: 'tier', label: 'Tier', render: r => <Pill>{r.tier}</Pill> },
    { key: 'balance', label: 'Balance', sortable: true, align: 'right', render: r => <Money value={r.balance} /> },
    { key: 'pnl', label: 'P&L', sortable: true, align: 'right', render: r => <Money value={r.pnl} colorize /> },
    { key: 'kyc', label: 'KYC', render: r => <Badge status={r.kyc} /> },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'actions', label: '', align: 'right', render: r => (
      <button onClick={() => setSelected(r)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--brand)' }}>
        <Eye size={15} />
      </button>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle={`${USERS.length} registered accounts`}
        actions={<button className="btn-export"><Download size={13} /> Export CSV</button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Users" value={S.totalUsers} icon={UsersIcon} accent="#3B82F6" />
        <StatCard label="Active" value={S.activeUsers} icon={UserCheck} accent="#1ea774" />
        <StatCard label="Suspended" value={S.suspendedUsers} icon={Ban} accent="#d44333" />
        <StatCard label="Pending KYC" value={S.pendingKyc} icon={Clock} accent="#f59e0b" />
      </div>

      <Card noPad>
        <div className="p-5">
          <DataTable columns={columns} rows={USERS} searchKeys={['name', 'email', 'id', 'country']} searchPlaceholder="Search by name, email, ID…" pageSize={10} />
        </div>
      </Card>

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function UserDrawer({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto animate-slide-in"
        style={{ background: 'var(--bg-base)', borderLeft: '1px solid var(--border-1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 flex items-center justify-between sticky top-0" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-0)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>User Details</span>
          <button onClick={onClose} style={{ color: 'var(--text-3)' }}><XCircle size={18} /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>{user.name[0]}</div>
            <div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--text-1)' }}>{user.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>{user.email}</div>
              <div className="flex gap-2 mt-2"><Badge status={user.status} /><Badge status={user.kyc} /></div>
            </div>
          </div>
          <div className="space-y-1">
            {[
              ['Account ID', user.id], ['Country', `${getFlag(user.country)} ${user.country}`], ['Tier', user.tier],
              ['Balance', `$${formatFull(user.balance)}`], ['Equity', `$${formatFull(user.equity)}`],
              ['Total P&L', `${user.pnl >= 0 ? '+' : ''}$${formatFull(user.pnl)}`], ['Total Trades', user.totalTrades],
              ['Win Rate', `${user.winRate}%`], ['Open Positions', user.openPositions],
              ['Registered', user.registered], ['Last Login', user.lastLogin],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border-0)' }}>
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{k}</span>
                <span className="text-sm font-medium font-mono" style={{ color: 'var(--text-1)' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button className="py-2.5 rounded-xl text-xs font-bold" style={{ background: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
            </button>
            <button className="py-2.5 rounded-xl text-xs font-bold" style={{ background: 'var(--brand-bg)', color: 'var(--brand)', border: '1px solid rgba(59,130,246,0.2)' }}>
              Adjust Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WALLETS ───────────────────────────────────────────────────────────────────
export function WalletsSection() {
  const wallets = USERS.map(u => ({
    ...u,
    margin: Math.round(u.equity * 0.3),
    free: Math.round(u.equity * 0.7),
  }));
  const columns = [
    { key: 'name', label: 'User', sortable: true, render: r => (
      <div><div className="font-semibold" style={{ color: 'var(--text-1)' }}>{r.name}</div><div className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>{r.id}</div></div>
    ) },
    { key: 'balance', label: 'Balance', sortable: true, align: 'right', render: r => <Money value={r.balance} /> },
    { key: 'equity', label: 'Equity', sortable: true, align: 'right', render: r => <Money value={r.equity} /> },
    { key: 'margin', label: 'Used Margin', align: 'right', render: r => <Money value={r.margin} /> },
    { key: 'free', label: 'Free Margin', align: 'right', render: r => <Money value={r.free} /> },
    { key: 'openPositions', label: 'Positions', align: 'center', render: r => <Pill>{r.openPositions}</Pill> },
  ];
  return (
    <div>
      <PageHeader title="Wallets" subtitle="Balances, equity and margin across all accounts" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Balance" value={`$${formatMoney(S.totalBalance)}`} icon={Wallet} accent="#3B82F6" />
        <StatCard label="Total Equity" value={`$${formatMoney(S.totalEquity)}`} icon={DollarSign} accent="#7C3AED" />
        <StatCard label="Open Exposure" value={`$${formatMoney(S.openExposure)}`} icon={Layers} accent="#6366F1" />
        <StatCard label="Active Positions" value={S.openPositions} icon={Activity} accent="#1ea774" />
      </div>
      <Card noPad><div className="p-5">
        <DataTable columns={columns} rows={wallets} searchKeys={['name', 'id']} searchPlaceholder="Search wallets…" />
      </div></Card>
    </div>
  );
}

// ── DEPOSITS / WITHDRAWALS ────────────────────────────────────────────────────
function txColumns(showActions) {
  return [
    { key: 'id', label: 'TX ID', render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'userName', label: 'User', sortable: true, render: r => (
      <div><div className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{r.userName}</div><div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.userId}</div></div>
    ) },
    { key: 'amount', label: 'Amount', sortable: true, align: 'right', render: r => <Money value={r.amount} /> },
    { key: 'network', label: 'Network', render: r => <Pill color="var(--text-2)" bg="var(--bg-surface)">{r.network}</Pill> },
    { key: 'txHash', label: 'Hash', render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-4)' }}>{r.txHash}</span> },
    { key: 'date', label: 'Date', sortable: true, render: r => <span className="text-xs">{r.date}</span> },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    ...(showActions ? [{ key: 'actions', label: '', align: 'right', render: r => r.status === 'pending' ? (
      <div className="flex items-center justify-end gap-1.5">
        <button className="p-1.5 rounded-lg" style={{ color: 'var(--green)', background: 'var(--green-bg)' }} title="Approve"><CheckCircle size={14} /></button>
        <button className="p-1.5 rounded-lg" style={{ color: 'var(--red)', background: 'var(--red-bg)' }} title="Reject"><XCircle size={14} /></button>
      </div>
    ) : <span className="text-xs" style={{ color: 'var(--text-4)' }}>—</span> }] : []),
  ];
}

export function DepositsSection() {
  const total = DEPOSITS.reduce((s, d) => s + d.amount, 0);
  const completed = DEPOSITS.filter(d => d.status === 'completed').length;
  return (
    <div>
      <PageHeader title="Deposits" subtitle={`${DEPOSITS.length} deposit transactions`}
        actions={<button className="btn-export"><Download size={13} /> Export</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <StatCard label="Total Deposited" value={`$${formatMoney(total)}`} icon={ArrowDownToLine} accent="#1ea774" />
        <StatCard label="Transactions" value={DEPOSITS.length} icon={FileText} accent="#3B82F6" />
        <StatCard label="Completed" value={completed} icon={CheckCircle} accent="#7C3AED" />
      </div>
      <Card noPad><div className="p-5">
        <DataTable columns={txColumns(false)} rows={DEPOSITS} searchKeys={['userName', 'userId', 'id']} searchPlaceholder="Search deposits…" />
      </div></Card>
    </div>
  );
}

export function WithdrawalsSection() {
  const pending = WITHDRAWALS.filter(d => d.status === 'pending');
  const total = WITHDRAWALS.filter(d => d.status === 'completed').reduce((s, d) => s + d.amount, 0);
  return (
    <div>
      <PageHeader title="Withdrawals" subtitle={`${pending.length} requests awaiting approval`}
        actions={<button className="btn-export"><Download size={13} /> Export</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <StatCard label="Total Withdrawn" value={`$${formatMoney(total)}`} icon={ArrowUpFromLine} accent="#d44333" />
        <StatCard label="Pending Requests" value={pending.length} icon={Clock} accent="#f59e0b" sub={`$${formatMoney(pending.reduce((s, d) => s + d.amount, 0))} queued`} />
        <StatCard label="Total Requests" value={WITHDRAWALS.length} icon={FileText} accent="#3B82F6" />
      </div>
      <Card noPad><div className="p-5">
        <DataTable columns={txColumns(true)} rows={WITHDRAWALS} searchKeys={['userName', 'userId', 'id']} searchPlaceholder="Search withdrawals…" />
      </div></Card>
    </div>
  );
}

// ── TRADES ────────────────────────────────────────────────────────────────────
export function TradesSection() {
  const columns = [
    { key: 'id', label: 'Trade ID', render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'userName', label: 'User', sortable: true, render: r => <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{r.userName}</span> },
    { key: 'symbol', label: 'Market', sortable: true, render: r => <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{r.symbol}</span> },
    { key: 'side', label: 'Side', render: r => <Pill color={r.side === 'long' ? 'var(--green)' : 'var(--red)'} bg={r.side === 'long' ? 'var(--green-bg)' : 'var(--red-bg)'}>{r.side.toUpperCase()}</Pill> },
    { key: 'leverage', label: 'Lev', align: 'center', render: r => <span className="font-mono text-xs">{r.leverage}x</span> },
    { key: 'entry', label: 'Entry', align: 'right', render: r => <span className="font-mono text-xs">{r.entry}</span> },
    { key: 'exit', label: 'Exit', align: 'right', render: r => <span className="font-mono text-xs">{r.exit}</span> },
    { key: 'pnl', label: 'P&L', sortable: true, align: 'right', render: r => <Money value={r.pnl} colorize /> },
    { key: 'date', label: 'Closed', sortable: true, render: r => <span className="text-xs">{r.date}</span> },
  ];
  const totalPnl = TRADES.reduce((s, t) => s + t.pnl, 0);
  return (
    <div>
      <PageHeader title="Trades" subtitle={`${TRADES.length} closed trades platform-wide`}
        actions={<button className="btn-export"><Download size={13} /> Export</button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Trades" value={S.totalTrades} icon={Activity} accent="#3B82F6" />
        <StatCard label="Volume" value={`$${formatMoney(S.totalVolume)}`} icon={BarChart3} accent="#7C3AED" />
        <StatCard label="Net P&L" value={`$${formatMoney(totalPnl)}`} icon={totalPnl >= 0 ? TrendingUp : TrendingDown} accent={totalPnl >= 0 ? '#1ea774' : '#d44333'} />
        <StatCard label="Win Rate" value={`${S.winRate}%`} icon={UserCheck} accent="#6366F1" />
      </div>
      <Card noPad><div className="p-5">
        <DataTable columns={columns} rows={TRADES} searchKeys={['userName', 'symbol', 'id']} searchPlaceholder="Search trades…" />
      </div></Card>
    </div>
  );
}

// ── POSITIONS ─────────────────────────────────────────────────────────────────
export function PositionsSection() {
  const columns = [
    { key: 'id', label: 'Position', render: r => <span className="font-mono text-xs">{r.id}</span> },
    { key: 'userName', label: 'User', sortable: true, render: r => <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{r.userName}</span> },
    { key: 'symbol', label: 'Market', sortable: true, render: r => <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{r.symbol}</span> },
    { key: 'side', label: 'Side', render: r => <Pill color={r.side === 'long' ? 'var(--green)' : 'var(--red)'} bg={r.side === 'long' ? 'var(--green-bg)' : 'var(--red-bg)'}>{r.side.toUpperCase()}</Pill> },
    { key: 'leverage', label: 'Lev', align: 'center', render: r => <span className="font-mono text-xs">{r.leverage}x</span> },
    { key: 'margin', label: 'Margin', sortable: true, align: 'right', render: r => <Money value={r.margin} /> },
    { key: 'pnl', label: 'Unreal. P&L', sortable: true, align: 'right', render: r => <Money value={r.pnl} colorize /> },
    { key: 'liqDistance', label: 'Liq. Dist', sortable: true, align: 'right', render: r => <span className="font-mono text-xs" style={{ color: r.risk === 'high' ? 'var(--red)' : r.risk === 'medium' ? 'var(--warn)' : 'var(--text-2)' }}>{r.liqDistance}%</span> },
    { key: 'risk', label: 'Risk', render: r => <Badge status={r.risk} /> },
    { key: 'actions', label: '', align: 'right', render: r => (
      <button className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ color: 'var(--red)', background: 'var(--red-bg)' }}>Force Close</button>
    ) },
  ];
  return (
    <div>
      <PageHeader title="Open Positions" subtitle={`${POSITIONS.length} live positions · sorted by liquidation risk`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Open Positions" value={S.openPositions} icon={Activity} accent="#3B82F6" />
        <StatCard label="Total Exposure" value={`$${formatMoney(S.openExposure)}`} icon={Layers} accent="#7C3AED" />
        <StatCard label="High Risk" value={S.highRiskPositions} icon={AlertTriangle} accent="#d44333" />
        <StatCard label="Total Margin" value={`$${formatMoney(POSITIONS.reduce((s, p) => s + p.margin, 0))}`} icon={DollarSign} accent="#1ea774" />
      </div>
      <Card noPad><div className="p-5">
        <DataTable columns={columns} rows={POSITIONS} searchKeys={['userName', 'symbol', 'id']} searchPlaceholder="Search positions…" />
      </div></Card>
    </div>
  );
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
export function AnalyticsSection() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform performance and engagement insights" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Trading Volume" value={`$${formatMoney(S.totalVolume)}`} icon={BarChart3} accent="#3B82F6" trend={14} />
        <StatCard label="Active Traders" value={S.activeUsers} icon={UsersIcon} accent="#7C3AED" trend={6} />
        <StatCard label="Avg Win Rate" value={`${S.winRate}%`} icon={TrendingUp} accent="#1ea774" trend={2} />
        <StatCard label="Net Revenue" value={`$${formatMoney(S.netFlow * 0.04)}`} icon={DollarSign} accent="#6366F1" trend={9} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card title="Daily Trading Volume" subtitle="Last 14 days">
          <AreaChart data={SERIES} valueKey="volume" color="var(--brand)" height={200} />
        </Card>
        <Card title="Active Users" subtitle="Daily active accounts">
          <BarChart data={SERIES} valueKey="activeUsers" color="var(--brand-light)" height={200} />
        </Card>
      </div>
      <Card title="Market Breakdown" subtitle="Volume, trades and net P&L by market" noPad>
        <div className="divide-y" style={{ borderColor: 'var(--border-0)' }}>
          {TOP_MARKETS.map(m => {
            const maxVol = TOP_MARKETS[0].volume;
            return (
              <div key={m.symbol} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{m.symbol}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{m.trades} trades</span>
                    <Money value={m.pnl} colorize />
                    <span className="font-mono text-sm w-20 text-right" style={{ color: 'var(--text-2)' }}>${formatMoney(m.volume)}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(m.volume / maxVol) * 100}%`, background: 'linear-gradient(90deg, var(--brand), var(--brand-light))' }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
export function ReportsSection() {
  const reports = [
    { name: 'Daily Trading Summary', desc: 'All trades, volume and P&L for the day', icon: BarChart3, freq: 'Daily' },
    { name: 'User Activity Report', desc: 'Logins, sign-ups and engagement metrics', icon: UsersIcon, freq: 'Weekly' },
    { name: 'Financial Statement', desc: 'Deposits, withdrawals and net flow', icon: DollarSign, freq: 'Monthly' },
    { name: 'Risk Exposure Report', desc: 'Open positions, leverage and liquidation risk', icon: ShieldAlert, freq: 'Real-time' },
    { name: 'KYC Compliance Report', desc: 'Verification status across all accounts', icon: UserCheck, freq: 'Weekly' },
    { name: 'Audit Trail Export', desc: 'Complete log of administrative actions', icon: FileText, freq: 'On demand' },
  ];
  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export platform reports" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.name} className="rounded-2xl p-5 transition-all duration-200 cursor-pointer"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-0)'; e.currentTarget.style.transform = 'none'; }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-bg)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Icon size={18} style={{ color: 'var(--brand)' }} />
                </div>
                <Pill>{r.freq}</Pill>
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-1)' }}>{r.name}</div>
              <div className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>{r.desc}</div>
              <button className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-surface)', color: 'var(--brand)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Download size={12} /> Generate
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── RISK MONITORING ───────────────────────────────────────────────────────────
export function RiskSection() {
  const highRisk = POSITIONS.filter(p => p.risk === 'high');
  const mediumRisk = POSITIONS.filter(p => p.risk === 'medium');
  const columns = [
    { key: 'userName', label: 'User', render: r => <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{r.userName}</span> },
    { key: 'symbol', label: 'Market', render: r => <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{r.symbol}</span> },
    { key: 'side', label: 'Side', render: r => <Pill color={r.side === 'long' ? 'var(--green)' : 'var(--red)'} bg={r.side === 'long' ? 'var(--green-bg)' : 'var(--red-bg)'}>{r.side.toUpperCase()}</Pill> },
    { key: 'leverage', label: 'Lev', align: 'center', render: r => <span className="font-mono text-xs font-bold" style={{ color: r.leverage >= 50 ? 'var(--red)' : 'var(--text-2)' }}>{r.leverage}x</span> },
    { key: 'margin', label: 'Margin', align: 'right', render: r => <Money value={r.margin} /> },
    { key: 'liqDistance', label: 'Liq. Distance', sortable: true, align: 'right', render: r => (
      <div className="flex items-center justify-end gap-2">
        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, r.liqDistance * 4)}%`, background: r.risk === 'high' ? 'var(--red)' : r.risk === 'medium' ? 'var(--warn)' : 'var(--green)' }} />
        </div>
        <span className="font-mono text-xs w-10" style={{ color: r.risk === 'high' ? 'var(--red)' : 'var(--text-2)' }}>{r.liqDistance}%</span>
      </div>
    ) },
    { key: 'risk', label: 'Risk', render: r => <Badge status={r.risk} /> },
  ];
  return (
    <div>
      <PageHeader title="Risk Monitoring" subtitle="Live exposure and liquidation risk surveillance" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="High Risk" value={highRisk.length} icon={AlertTriangle} accent="#d44333" sub="< 6% to liquidation" />
        <StatCard label="Medium Risk" value={mediumRisk.length} icon={ShieldAlert} accent="#f59e0b" />
        <StatCard label="Total Exposure" value={`$${formatMoney(S.openExposure)}`} icon={Layers} accent="#7C3AED" />
        <StatCard label="Avg Leverage" value={`${(POSITIONS.reduce((s, p) => s + p.leverage, 0) / POSITIONS.length).toFixed(0)}x`} icon={Zap} accent="#3B82F6" />
      </div>
      {highRisk.length > 0 && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: 'var(--red-bg)', border: '1px solid rgba(212,67,51,0.25)' }}>
          <AlertTriangle size={18} style={{ color: 'var(--red)' }} />
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--red)' }}>{highRisk.length} positions near liquidation</div>
            <div className="text-xs" style={{ color: 'var(--text-2)' }}>These accounts may require margin call notifications or manual intervention.</div>
          </div>
        </div>
      )}
      <Card title="Risk Watchlist" subtitle="Positions sorted by proximity to liquidation" noPad>
        <div className="p-5">
          <DataTable columns={columns} rows={POSITIONS} searchKeys={['userName', 'symbol']} searchPlaceholder="Search positions…" pageSize={12} />
        </div>
      </Card>
    </div>
  );
}

// ── SYSTEM MONITORING ─────────────────────────────────────────────────────────
export function SystemSection() {
  const allOk = SYSTEM_SERVICES.every(s => s.status === 'operational');
  return (
    <div>
      <PageHeader title="System Monitoring" subtitle="Infrastructure health and service status" />
      <div className="rounded-2xl p-5 mb-5 flex items-center justify-between"
        style={{ background: allOk ? 'var(--green-bg)' : 'var(--warn-bg)', border: `1px solid ${allOk ? 'rgba(30,167,116,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: allOk ? 'rgba(30,167,116,0.15)' : 'rgba(245,158,11,0.15)' }}>
            <Server size={20} style={{ color: allOk ? 'var(--green)' : 'var(--warn)' }} />
          </div>
          <div>
            <div className="text-base font-bold" style={{ color: allOk ? 'var(--green)' : 'var(--warn)' }}>{allOk ? 'All Systems Operational' : 'Partial Degradation Detected'}</div>
            <div className="text-xs" style={{ color: 'var(--text-2)' }}>Last checked just now · auto-refreshes every 30s</div>
          </div>
        </div>
        <RefreshCw size={16} style={{ color: 'var(--text-3)' }} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Avg Latency" value="18ms" icon={Zap} accent="#1ea774" />
        <StatCard label="API Requests/s" value="2.4K" icon={Activity} accent="#3B82F6" />
        <StatCard label="CPU Load" value="34%" icon={Cpu} accent="#7C3AED" />
        <StatCard label="Uptime (30d)" value="99.96%" icon={Server} accent="#6366F1" />
      </div>

      <Card title="Service Status" noPad>
        <div className="divide-y" style={{ borderColor: 'var(--border-0)' }}>
          {SYSTEM_SERVICES.map(s => (
            <div key={s.name} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ background: s.status === 'operational' ? 'var(--green)' : s.status === 'degraded' ? 'var(--warn)' : 'var(--red)', boxShadow: `0 0 8px ${s.status === 'operational' ? 'var(--green)' : 'var(--warn)'}` }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{s.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{s.latency}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{s.uptime}</span>
                <Badge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── AUDIT LOGS ────────────────────────────────────────────────────────────────
export function AuditSection() {
  const catColor = { finance: 'var(--green)', user: 'var(--brand)', trading: 'var(--brand-light)', system: 'var(--warn)', auth: 'var(--text-2)' };
  const columns = [
    { key: 'date', label: 'Timestamp', sortable: true, render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{r.date}</span> },
    { key: 'admin', label: 'Admin', sortable: true, render: r => <span className="text-sm" style={{ color: 'var(--text-1)' }}>{r.admin}</span> },
    { key: 'action', label: 'Action', render: r => <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{r.action}</span> },
    { key: 'category', label: 'Category', render: r => <Pill color={catColor[r.category]} bg="var(--bg-surface)">{r.category}</Pill> },
    { key: 'target', label: 'Target', render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.target}</span> },
    { key: 'ip', label: 'IP', render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-4)' }}>{r.ip}</span> },
  ];
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Complete trail of administrative actions"
        actions={<button className="btn-export"><Download size={13} /> Export</button>} />
      <Card noPad><div className="p-5">
        <DataTable columns={columns} rows={AUDIT_LOGS} searchKeys={['admin', 'action', 'target']} searchPlaceholder="Search logs…" pageSize={12} />
      </div></Card>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export function SettingsSection() {
  const [toggles, setToggles] = useState({
    maintenance: false, newRegistrations: true, withdrawalsEnabled: true,
    autoKyc: false, tradingHalt: false, emailAlerts: true,
  });
  const t = (k) => setToggles(s => ({ ...s, [k]: !s[k] }));
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-300"
      style={{ background: on ? 'var(--green)' : 'var(--border-1)' }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300" style={{ left: on ? '22px' : '2px' }} />
    </button>
  );
  const Row = ({ label, desc, k, danger }) => (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: danger ? 'var(--red)' : 'var(--text-1)' }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{desc}</div>
      </div>
      <Toggle on={toggles[k]} onClick={() => t(k)} />
    </div>
  );
  return (
    <div>
      <PageHeader title="Settings" subtitle="Platform configuration and controls" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Platform Controls">
          <Row label="New Registrations" desc="Allow new users to sign up" k="newRegistrations" />
          <Row label="Withdrawals Enabled" desc="Allow users to request withdrawals" k="withdrawalsEnabled" />
          <Row label="Auto KYC Approval" desc="Automatically approve standard KYC submissions" k="autoKyc" />
          <Row label="Email Alerts" desc="Send platform alerts to admin team" k="emailAlerts" />
        </Card>
        <Card title="Risk & Maintenance">
          <Row label="Maintenance Mode" desc="Take the platform offline for users" k="maintenance" danger />
          <Row label="Trading Halt" desc="Suspend all trading activity immediately" k="tradingHalt" danger />
          <div className="pt-4">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Default Limits</div>
            {[['Max Leverage', '100x'], ['Min Deposit', '$10'], ['Max Withdrawal/day', '$50,000'], ['Margin Call Level', '120%']].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2">
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>{k}</span>
                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
