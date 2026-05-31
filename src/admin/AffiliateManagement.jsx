import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, DollarSign, TrendingUp, BarChart3, Award, ShieldAlert, Settings,
  FileText, Trophy, Star, AlertTriangle, ChevronRight, X, Check, Edit2,
  Ban, Eye, Download, Zap, Activity, Globe,
} from 'lucide-react';
import { PageHeader, StatCard, Badge, Pill, Card, BarChart, AreaChart, DataTable, Money } from './adminUI';
import {
  AFFILIATES, AFFILIATE_CLIENTS, AFFILIATE_REBATES, TIER_CONFIG,
  getAffiliateStats, getMonthlyAffiliateDeposits, getAffiliateGrowth,
  getTopAffiliates, getWeeklyRebates, formatMoney,
} from './affiliateAdminData';

// ── Seeded PRNG for per-affiliate mock deposit series ─────────────────────────
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: 'Overview',    icon: BarChart3 },
  { id: 'affiliates',  label: 'Affiliates',  icon: Users },
  { id: 'clients',     label: 'Clients',     icon: Globe },
  { id: 'rebates',     label: 'Rebates',     icon: DollarSign },
  { id: 'tiers',       label: 'Tiers',       icon: Award },
  { id: 'rankings',    label: 'Rankings',    icon: Trophy },
  { id: 'reports',     label: 'Reports',     icon: FileText },
  { id: 'risk',        label: 'Risk',        icon: ShieldAlert },
  { id: 'settings',    label: 'Settings',    icon: Settings },
];

function TabBar({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 mb-6 flex-wrap"
      style={{ padding: '4px', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-0)', width: 'fit-content' }}>
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{
              background: isActive ? 'var(--brand)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-3)',
            }}>
            <Icon size={13} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Tier Badge ────────────────────────────────────────────────────────────────
function TierBadge({ tierId }) {
  const t = TIER_CONFIG[tierId] || { label: tierId, color: '#94A3B8' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold"
      style={{ color: t.color, background: t.color + '22', border: `1px solid ${t.color}44` }}>
      {t.label}
    </span>
  );
}

// ── Affiliate Drawer ──────────────────────────────────────────────────────────
function AffiliateDrawer({ aff, onClose }) {
  const clients = AFFILIATE_CLIENTS.filter(c => c.affiliateId === aff.id).slice(0, 5);
  const r = rng(aff.id.charCodeAt(4) * 997);
  const months = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
  const series = months.map(m => ({
    label: m,
    deposits: Math.round((aff.monthlyDeposit * (0.6 + r() * 0.8)) / 100) * 100,
  }));

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      {/* Panel */}
      <div className="fixed top-0 right-0 h-screen z-50 flex flex-col overflow-y-auto"
        style={{ width: 520, background: 'var(--bg-card)', borderLeft: '1px solid var(--border-1)' }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-0)', background: 'var(--bg-surface)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>
                {aff.name[0]}
              </div>
              <div>
                <div className="font-bold text-base" style={{ color: 'var(--text-1)' }}>{aff.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-4)' }}>{aff.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TierBadge tierId={aff.tier} />
              <Badge status={aff.status} />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-3)', background: 'var(--bg-hover)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Partner ID',  value: aff.id },
              { label: 'Join Date',   value: aff.regDate },
              { label: 'Country',     value: aff.country },
              { label: 'Campaigns',   value: aff.campaignCount },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-4)' }}>{item.label}</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Performance grid */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Performance</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Total Clients',    value: aff.totalClients },
                { label: 'Active Clients',   value: aff.activeClients },
                { label: 'Monthly Dep.',     value: formatMoney(aff.monthlyDeposit) },
                { label: 'Total Deposits',   value: formatMoney(aff.totalDeposit) },
                { label: 'Total Lots',       value: aff.totalLots.toLocaleString() },
                { label: 'Total Rebates',    value: formatMoney(aff.totalRebates) },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-0)' }}>
                  <div className="font-mono font-bold text-sm" style={{ color: 'var(--text-1)' }}>{item.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit trend */}
          <Card title="Deposit Trend" subtitle="Last 12 months">
            <AreaChart data={series} valueKey="deposits" height={120} color="var(--brand)" />
          </Card>

          {/* Referred clients mini-table */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Referred Clients</div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-0)' }}>
              {clients.length === 0
                ? <div className="px-4 py-6 text-center text-xs" style={{ color: 'var(--text-4)' }}>No clients</div>
                : clients.map((cl, i) => (
                  <div key={cl.id} className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderTop: i > 0 ? '1px solid var(--border-0)' : 'none', background: i % 2 === 0 ? 'var(--bg-surface)' : 'transparent' }}>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{cl.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-4)' }}>{cl.country}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>{formatMoney(cl.totalDeposits)}</div>
                      <Badge status={cl.status} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap pb-6">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--brand)', color: '#fff' }}>
              <Edit2 size={13} /> Edit Affiliate
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ background: aff.status === 'active' ? 'var(--warn-bg)' : 'var(--green-bg)', color: aff.status === 'active' ? 'var(--warn)' : 'var(--green)' }}>
              {aff.status === 'active' ? <Ban size={13} /> : <Check size={13} />}
              {aff.status === 'active' ? 'Disable' : 'Enable'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-0)' }}>
              <FileText size={13} /> Full Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── TAB 1: Overview ───────────────────────────────────────────────────────────
function OverviewTab() {
  const S = getAffiliateStats();
  const monthlyDep = getMonthlyAffiliateDeposits();
  const growth = getAffiliateGrowth();
  const weekly = getWeeklyRebates();
  const top = getTopAffiliates(6);

  const stats = [
    { label: 'Total Affiliates',    value: S.totalAffiliates,               icon: Users,       accent: '#3B82F6' },
    { label: 'Active Affiliates',   value: S.activeAffiliates,              icon: Activity,    accent: '#1EA774' },
    { label: 'Total Clients',       value: S.totalClients,                  icon: Globe,       accent: '#6366F1' },
    { label: 'Total Net Deposits',  value: formatMoney(S.totalDeposit),     icon: DollarSign,  accent: '#7C3AED' },
    { label: 'Rebates Generated',   value: formatMoney(S.totalRebates),     icon: Award,       accent: '#F59E0B' },
    { label: 'Pending Rebates',     value: formatMoney(S.pendingRebates),   icon: AlertTriangle, accent: '#EF4444' },
    { label: 'Paid Rebates',        value: formatMoney(S.paidRebates),      icon: Check,       accent: '#10B981' },
    { label: 'Total Lots Traded',   value: S.totalLots.toLocaleString(),    icon: BarChart3,   accent: '#8B5CF6' },
    { label: 'Avg Dep/Affiliate',   value: formatMoney(S.avgDeposit),       icon: TrendingUp,  accent: '#06B6D4' },
  ];

  const topColumns = [
    { key: 'rank',  label: '#', render: (_, i) => <span className="font-bold text-xs" style={{ color: 'var(--text-3)' }}>{i + 1}</span> },
    { key: 'name',  label: 'Affiliate', render: r => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>{r.name[0]}</div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{r.name}</span>
      </div>
    )},
    { key: 'tier',    label: 'Tier',     render: r => <TierBadge tierId={r.tier} /> },
    { key: 'totalDeposit', label: 'Deposits', sortable: true, render: r => <span className="font-mono text-xs">{formatMoney(r.totalDeposit)}</span> },
    { key: 'totalRebates', label: 'Rebates',  sortable: true, render: r => <span className="font-mono text-xs">{formatMoney(r.totalRebates)}</span> },
    { key: 'totalClients', label: 'Clients',  sortable: true },
    { key: 'status',  label: 'Status',  render: r => <Badge status={r.status} /> },
  ];

  // Add rank index
  const topRows = top.map((a, i) => ({ ...a, rank: i + 1 }));

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliate Management" subtitle="Monitor affiliate performance, rebates, and client growth"
        actions={
          <div className="flex gap-2">
            <Pill color="var(--green)" bg="var(--green-bg)">Program Active</Pill>
            <Pill color="var(--brand-light)" bg="var(--brand-bg)">12 Partners</Pill>
          </div>
        }
      />

      {/* Stats grid 3×3 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
        ))}
      </div>

      {/* Charts 2×2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Monthly Net Deposits" subtitle="Last 12 months">
          <AreaChart data={monthlyDep} valueKey="deposits" height={160} color="var(--brand)" />
        </Card>
        <Card title="Monthly Rebates" subtitle="Last 12 months">
          <BarChart data={monthlyDep} valueKey="rebates" height={160} color="var(--brand-light)" />
        </Card>
        <Card title="Affiliate Growth" subtitle="Total active affiliates">
          <AreaChart data={growth} valueKey="total" height={160} color="var(--green)" />
        </Card>
        <Card title="Weekly Lots Traded" subtitle="Last 8 weeks">
          <BarChart data={weekly} valueKey="lots" height={160} color="#F59E0B" />
        </Card>
      </div>

      {/* Top affiliates table */}
      <Card title="Top Affiliates" subtitle="Ranked by total net deposits">
        <DataTable columns={topColumns} rows={topRows} pageSize={6} />
      </Card>
    </div>
  );
}

// ── TAB 2: Affiliates ─────────────────────────────────────────────────────────
function AffiliatesTab() {
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drawerAff, setDrawerAff] = useState(null);

  const tiers = ['all', 'beginner', 'level1', 'standard', 'premium', 'gold'];
  const statuses = ['all', 'active', 'inactive', 'suspended'];

  const filtered = useMemo(() => AFFILIATES.filter(a =>
    (tierFilter === 'all' || a.tier === tierFilter) &&
    (statusFilter === 'all' || a.status === statusFilter)
  ), [tierFilter, statusFilter]);

  const columns = [
    { key: 'id',    label: 'ID',    render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>{r.id}</span> },
    { key: 'name',  label: 'Name',  sortable: true, render: r => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>{r.name[0]}</div>
        <div>
          <div className="font-semibold text-xs" style={{ color: 'var(--text-1)' }}>{r.name}</div>
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.email}</div>
        </div>
      </div>
    )},
    { key: 'tier',   label: 'Tier',   render: r => <TierBadge tierId={r.tier} /> },
    { key: 'status', label: 'Status', render: r => <Badge status={r.status} /> },
    { key: 'totalClients',   label: 'Clients',   sortable: true },
    { key: 'monthlyDeposit', label: 'Monthly Dep', sortable: true, render: r => <span className="font-mono text-xs">{formatMoney(r.monthlyDeposit)}</span> },
    { key: 'totalDeposit',   label: 'Total Dep',   sortable: true, render: r => <span className="font-mono text-xs">{formatMoney(r.totalDeposit)}</span> },
    { key: 'totalLots',      label: 'Lots',        sortable: true, render: r => <span className="font-mono text-xs">{r.totalLots.toLocaleString()}</span> },
    { key: 'totalRebates',   label: 'Rebates',     sortable: true, render: r => <span className="font-mono text-xs">{formatMoney(r.totalRebates)}</span> },
    { key: 'pendingRebates', label: 'Pending',     sortable: true, render: r => <span className="font-mono text-xs" style={{ color: 'var(--warn)' }}>{formatMoney(r.pendingRebates)}</span> },
    { key: 'lastActivity',   label: 'Last Active' },
    { key: 'actions', label: 'Actions', render: r => (
      <button onClick={() => setDrawerAff(r)}
        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold"
        style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>
        <Eye size={12} /> View
      </button>
    )},
  ];

  const filterBar = (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Tier filter */}
      <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
        {tiers.map(t => (
          <button key={t} onClick={() => setTierFilter(t)}
            className="px-2 py-1 rounded text-xs font-semibold capitalize transition-colors"
            style={{ background: tierFilter === t ? 'var(--brand)' : 'transparent', color: tierFilter === t ? '#fff' : 'var(--text-3)' }}>
            {t === 'all' ? 'All Tiers' : TIER_CONFIG[t]?.label || t}
          </button>
        ))}
      </div>
      {/* Status filter */}
      <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-2 py-1 rounded text-xs font-semibold capitalize transition-colors"
            style={{ background: statusFilter === s ? 'var(--brand)' : 'transparent', color: statusFilter === s ? '#fff' : 'var(--text-3)' }}>
            {s === 'all' ? 'All Status' : s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <Card title="All Affiliates" subtitle={`${filtered.length} partners`}>
        <DataTable
          columns={columns}
          rows={filtered}
          searchKeys={['name', 'email', 'id']}
          searchPlaceholder="Search affiliates…"
          pageSize={10}
          filters={filterBar}
        />
      </Card>
      {drawerAff && <AffiliateDrawer aff={drawerAff} onClose={() => setDrawerAff(null)} />}
    </div>
  );
}

// ── TAB 3: Clients ────────────────────────────────────────────────────────────
function ClientsTab() {
  const [affFilter, setAffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => AFFILIATE_CLIENTS.filter(c =>
    (affFilter === 'all' || c.affiliateId === affFilter) &&
    (statusFilter === 'all' || c.status === statusFilter)
  ), [affFilter, statusFilter]);

  const columns = [
    { key: 'name',  label: 'Client', sortable: true, render: r => (
      <div>
        <div className="font-semibold text-xs" style={{ color: 'var(--text-1)' }}>{r.name}</div>
        <div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.email}</div>
      </div>
    )},
    { key: 'country',        label: 'Country' },
    { key: 'affiliateName',  label: 'Affiliate', sortable: true },
    { key: 'affilTier',      label: 'Aff Tier',  render: r => <TierBadge tierId={r.affilTier} /> },
    { key: 'regDate',        label: 'Reg Date' },
    { key: 'totalDeposits',  label: 'Total Dep', sortable: true, render: r => <span className="font-mono text-xs">{formatMoney(r.totalDeposits)}</span> },
    { key: 'monthlyDeposit', label: 'Monthly',   sortable: true, render: r => <span className="font-mono text-xs">{formatMoney(r.monthlyDeposit)}</span> },
    { key: 'totalLots',      label: 'Lots',      sortable: true },
    { key: 'generatedRebate',label: 'Rebate Gen',sortable: true, render: r => <span className="font-mono text-xs">{formatMoney(r.generatedRebate)}</span> },
    { key: 'status',         label: 'Status',    render: r => <Badge status={r.status} /> },
  ];

  const filterBar = (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={affFilter} onChange={e => setAffFilter(e.target.value)}
        className="text-xs px-2 py-1.5 rounded-lg outline-none"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-2)' }}>
        <option value="all">All Affiliates</option>
        {AFFILIATES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
        {['all', 'active', 'inactive'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-2 py-1 rounded text-xs font-semibold capitalize"
            style={{ background: statusFilter === s ? 'var(--brand)' : 'transparent', color: statusFilter === s ? '#fff' : 'var(--text-3)' }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card title="Referred Clients" subtitle={`${filtered.length} clients across all affiliates`}>
      <DataTable
        columns={columns}
        rows={filtered}
        searchKeys={['name', 'email', 'affiliateName']}
        searchPlaceholder="Search clients…"
        pageSize={15}
        filters={filterBar}
      />
    </Card>
  );
}

// ── TAB 4: Rebates ────────────────────────────────────────────────────────────
function RebatesTab() {
  const [rebates, setRebates] = useState(AFFILIATE_REBATES.map(r => ({ ...r })));
  const [statusTab, setStatusTab] = useState('all');

  const updateStatus = (id, newStatus) => {
    setRebates(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const filtered = useMemo(() => statusTab === 'all' ? rebates : rebates.filter(r => r.status === statusTab), [rebates, statusTab]);

  const total      = rebates.reduce((s, r) => s + r.rebateAmount, 0);
  const pending    = rebates.filter(r => r.status === 'pending').reduce((s, r) => s + r.rebateAmount, 0);
  const approved   = rebates.filter(r => r.status === 'approved').reduce((s, r) => s + r.rebateAmount, 0);
  const paid       = rebates.filter(r => r.status === 'paid').reduce((s, r) => s + r.rebateAmount, 0);

  const columns = [
    { key: 'affiliateName', label: 'Affiliate',   sortable: true },
    { key: 'clientName',    label: 'Client',      sortable: true },
    { key: 'product',       label: 'Product',     render: r => <Pill>{r.product}</Pill> },
    { key: 'symbol',        label: 'Symbol',      render: r => <span className="font-mono text-xs">{r.symbol}</span> },
    { key: 'lots',          label: 'Lots',        sortable: true, render: r => <span className="font-mono text-xs">{r.lots}</span> },
    { key: 'rebateRate',    label: 'Rate',        render: r => <span className="font-mono text-xs">${r.rebateRate}/lot</span> },
    { key: 'rebateAmount',  label: 'Amount',      sortable: true, render: r => <span className="font-mono text-xs font-bold" style={{ color: 'var(--green)' }}>${r.rebateAmount.toFixed(2)}</span> },
    { key: 'date',          label: 'Date' },
    { key: 'status',        label: 'Status',      render: r => <Badge status={r.status} /> },
    { key: 'actions',       label: 'Actions',     render: r => (
      <div className="flex gap-1">
        {r.status === 'pending' && (
          <>
            <button onClick={() => updateStatus(r.id, 'approved')}
              className="px-2 py-0.5 rounded text-xs font-semibold"
              style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>Approve</button>
            <button onClick={() => updateStatus(r.id, 'rejected')}
              className="px-2 py-0.5 rounded text-xs font-semibold"
              style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Reject</button>
          </>
        )}
        {r.status === 'approved' && (
          <button onClick={() => updateStatus(r.id, 'paid')}
            className="px-2 py-0.5 rounded text-xs font-semibold"
            style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>Mark Paid</button>
        )}
      </div>
    )},
  ];

  const statusTabs = ['all', 'pending', 'approved', 'paid', 'rejected'];

  return (
    <div className="space-y-5">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Rebates"    value={`$${total.toFixed(0)}`}    icon={DollarSign} accent="#3B82F6" />
        <StatCard label="Pending"          value={`$${pending.toFixed(0)}`}  icon={AlertTriangle} accent="#EF4444" />
        <StatCard label="Approved"         value={`$${approved.toFixed(0)}`} icon={Check} accent="#F59E0B" />
        <StatCard label="Paid Out"         value={`$${paid.toFixed(0)}`}     icon={Zap} accent="#10B981" />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl w-fit" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
        {statusTabs.map(s => (
          <button key={s} onClick={() => setStatusTab(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize"
            style={{ background: statusTab === s ? 'var(--brand)' : 'transparent', color: statusTab === s ? '#fff' : 'var(--text-3)' }}>
            {s === 'all' ? `All (${rebates.length})` : `${s} (${rebates.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      <Card title="Rebate Records" subtitle={`${filtered.length} records`}>
        <DataTable
          columns={columns}
          rows={filtered}
          searchKeys={['affiliateName', 'clientName', 'symbol']}
          searchPlaceholder="Search rebates…"
          pageSize={15}
        />
      </Card>
    </div>
  );
}

// ── TAB 5: Tiers ──────────────────────────────────────────────────────────────
function TiersTab() {
  const [editTier, setEditTier] = useState(null);
  const [tierData, setTierData] = useState(() => JSON.parse(JSON.stringify(TIER_CONFIG)));
  const [formData, setFormData] = useState({});

  const tierOrder = ['beginner', 'level1', 'standard', 'premium', 'gold'];
  const affiliateCountByTier = useMemo(() => {
    const counts = {};
    AFFILIATES.forEach(a => { counts[a.tier] = (counts[a.tier] || 0) + 1; });
    return counts;
  }, []);

  const openEdit = (tid) => {
    setEditTier(tid);
    setFormData({ ...tierData[tid] });
  };

  const saveEdit = () => {
    setTierData(prev => ({ ...prev, [editTier]: { ...prev[editTier], ...formData } }));
    setEditTier(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>Tier Configuration</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Manage affiliate tier requirements and rebate rates</p>
        </div>
      </div>

      {/* Tier cards 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tierOrder.map(tid => {
          const t = tierData[tid];
          const count = affiliateCountByTier[tid] || 0;
          return (
            <div key={tid} className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'var(--bg-card)', border: `1px solid ${t.color}44` }}>
              {/* Color accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: t.color }} />
              <div className="flex items-center justify-between mb-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: t.color + '22' }}>
                    <Star size={16} style={{ color: t.color }} />
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: t.color }}>{t.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-4)' }}>{count} affiliate{count !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <button onClick={() => openEdit(tid)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-0)' }}>
                  <Edit2 size={12} /> Edit
                </button>
              </div>

              {/* Progress bar: affiliates at this tier */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-4)' }}>
                  <span>Affiliates at this tier</span>
                  <span>{count} / {AFFILIATES.length}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(count / AFFILIATES.length) * 100}%`, background: t.color }} />
                </div>
              </div>

              {/* Requirements */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-4)' }}>Min Deposit</div>
                  <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-1)' }}>{formatMoney(t.minDeposit)}</div>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-4)' }}>Min Lots</div>
                  <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-1)' }}>{t.minLots.toLocaleString()}</div>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-4)' }}>Rebate/Lot</div>
                  <div className="text-sm font-bold mt-0.5" style={{ color: t.color }}>${t.rebatePerLot}</div>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-4)' }}>Bonus %</div>
                  <div className="text-sm font-bold mt-0.5" style={{ color: t.color }}>{t.bonusPct}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <Card title="Tier Comparison" subtitle="All tiers side by side">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Tier', 'Min Deposit', 'Min Lots', 'Rebate/Lot', 'Bonus %', 'Affiliates'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tierOrder.map((tid, i) => {
                const t = tierData[tid];
                return (
                  <tr key={tid} style={{ borderTop: '1px solid var(--border-0)' }}>
                    <td className="px-4 py-3"><span className="font-bold text-sm" style={{ color: t.color }}>{t.label}</span></td>
                    <td className="px-4 py-3 font-mono text-sm">{formatMoney(t.minDeposit)}</td>
                    <td className="px-4 py-3 font-mono text-sm">{t.minLots}</td>
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: t.color }}>${t.rebatePerLot}</td>
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: t.color }}>{t.bonusPct}%</td>
                    <td className="px-4 py-3 text-sm">{affiliateCountByTier[tid] || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      {editTier && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setEditTier(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-1)' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>Edit {tierData[editTier].label} Tier</h3>
                <button onClick={() => setEditTier(null)}><X size={16} style={{ color: 'var(--text-3)' }} /></button>
              </div>
              {[
                { key: 'minDeposit', label: 'Min Deposit ($)', type: 'number' },
                { key: 'minLots',    label: 'Min Lots',        type: 'number' },
                { key: 'rebatePerLot', label: 'Rebate per Lot ($)', type: 'number' },
                { key: 'bonusPct',   label: 'Bonus %',         type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-3)' }}>{f.label}</label>
                  <input type={f.type} value={formData[f.key] ?? ''} onChange={e => setFormData(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-1)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-3)' }}>Benefits</label>
                <textarea rows={3} placeholder="Describe tier benefits…"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-1)' }} />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setEditTier(null)} className="px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-0)' }}>Cancel</button>
                <button onClick={saveEdit} className="px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--brand)', color: '#fff' }}>Save Changes</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── TAB 6: Rankings ───────────────────────────────────────────────────────────
function RankingsTab() {
  const [metric, setMetric] = useState('totalDeposit');
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, [metric]);

  const metricOptions = [
    { key: 'totalDeposit',   label: 'By Net Deposits' },
    { key: 'totalRebates',   label: 'By Rebates' },
    { key: 'totalLots',      label: 'By Lots' },
    { key: 'activeClients',  label: 'By Active Clients' },
  ];

  const sorted = useMemo(() => [...AFFILIATES].sort((a, b) => b[metric] - a[metric]), [metric]);
  const maxVal = sorted[0]?.[metric] || 1;

  const MEDALS = ['#EAB308', '#9CA3AF', '#EA580C'];
  const medalLabels = ['1st', '2nd', '3rd'];

  const formatVal = (v, key) => {
    if (key === 'totalDeposit' || key === 'totalRebates') return formatMoney(v);
    if (key === 'totalLots') return v.toLocaleString() + ' lots';
    return v + ' clients';
  };

  const subMetric = (aff) => {
    if (metric === 'totalDeposit') return `${aff.totalClients} clients`;
    if (metric === 'totalRebates') return `${aff.totalLots} lots`;
    if (metric === 'totalLots') return formatMoney(aff.totalRebates) + ' rebates';
    return `${aff.totalLots} lots`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
          {metricOptions.map(m => (
            <button key={m.key} onClick={() => setMetric(m.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: metric === m.key ? 'var(--brand)' : 'transparent', color: metric === m.key ? '#fff' : 'var(--text-3)' }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <Card title="Affiliate Leaderboard" subtitle={metricOptions.find(m => m.key === metric)?.label}>
        <div className="space-y-2">
          {sorted.map((aff, i) => {
            const pct = (aff[metric] / maxVal) * 100;
            const medalColor = i < 3 ? MEDALS[i] : 'var(--text-4)';
            const isMedal = i < 3;
            return (
              <div key={aff.id} className="flex items-center gap-4 p-3 rounded-xl"
                style={{ background: isMedal ? medalColor + '11' : 'var(--bg-surface)', border: `1px solid ${isMedal ? medalColor + '33' : 'var(--border-0)'}` }}>
                {/* Rank */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: isMedal ? medalColor + '22' : 'var(--bg-base)', color: medalColor }}>
                  {isMedal ? medalLabels[i] : i + 1}
                </div>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${isMedal ? medalColor : '#3B82F6'}, #7C3AED)` }}>
                  {aff.name[0]}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{aff.name}</span>
                    <TierBadge tierId={aff.tier} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-base)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: animated ? `${pct}%` : '0%', background: isMedal ? medalColor : 'var(--brand)' }} />
                    </div>
                    <span className="text-xs font-mono font-bold w-28 text-right" style={{ color: isMedal ? medalColor : 'var(--text-2)' }}>
                      {formatVal(aff[metric], metric)}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{subMetric(aff)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── TAB 7: Reports ────────────────────────────────────────────────────────────
function ReportsTab() {
  const [dateRange, setDateRange] = useState('90d');
  const [product, setProduct] = useState('all');

  const monthlyDep = getMonthlyAffiliateDeposits();
  const sorted = useMemo(() => [...AFFILIATES].sort((a, b) => b.totalDeposit - a.totalDeposit), []);
  const maxDep = sorted[0]?.totalDeposit || 1;
  const maxReb = Math.max(...AFFILIATES.map(a => a.totalRebates));

  // Tier distribution for donut
  const tierCounts = useMemo(() => {
    const counts = {};
    AFFILIATES.forEach(a => { counts[a.tier] = (counts[a.tier] || 0) + 1; });
    return Object.entries(TIER_CONFIG).map(([tid, tc]) => ({ tid, label: tc.label, color: tc.color, count: counts[tid] || 0 }));
  }, []);
  const totalForPie = tierCounts.reduce((s, t) => s + t.count, 0);

  // Simple SVG donut
  const r2 = 60, cx = 80, cy = 80, strokeW = 22;
  const circ = 2 * Math.PI * r2;
  let offset = 0;
  const donutSlices = tierCounts.map(t => {
    const pct = t.count / totalForPie;
    const dash = pct * circ;
    const slice = { ...t, dash, offset };
    offset += dash;
    return slice;
  });

  const handleExport = (type) => {
    alert(`Export as ${type} — this would download the report in production.`);
  };

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
          {['30d', '90d', '12m'].map(d => (
            <button key={d} onClick={() => setDateRange(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: dateRange === d ? 'var(--brand)' : 'transparent', color: dateRange === d ? '#fff' : 'var(--text-3)' }}>
              Last {d}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
          {['all', 'crypto', 'forex', 'simple'].map(p => (
            <button key={p} onClick={() => setProduct(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize"
              style={{ background: product === p ? 'var(--brand)' : 'transparent', color: product === p ? '#fff' : 'var(--text-3)' }}>
              {p === 'all' ? 'All Products' : p}
            </button>
          ))}
        </div>

        {/* Export buttons */}
        <div className="ml-auto flex gap-2">
          <button onClick={() => handleExport('CSV')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-0)' }}>
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => handleExport('Excel')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--brand-bg)', color: 'var(--brand)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Download size={13} /> Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Net Deposits by Affiliate — horizontal bar SVG */}
        <Card title="Net Deposits by Affiliate" subtitle="All time">
          <div className="space-y-2 mt-1">
            {sorted.map(aff => (
              <div key={aff.id} className="flex items-center gap-3">
                <span className="text-xs w-24 truncate" style={{ color: 'var(--text-3)' }}>{aff.name.split(' ')[0]}</span>
                <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded-md flex items-center pl-2"
                    style={{ width: `${(aff.totalDeposit / maxDep) * 100}%`, background: 'var(--brand)', minWidth: 4 }}>
                  </div>
                </div>
                <span className="text-xs font-mono w-14 text-right" style={{ color: 'var(--text-2)' }}>{formatMoney(aff.totalDeposit)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Rebates by Affiliate */}
        <Card title="Rebates by Affiliate" subtitle="All time">
          <div className="space-y-2 mt-1">
            {[...AFFILIATES].sort((a, b) => b.totalRebates - a.totalRebates).map(aff => (
              <div key={aff.id} className="flex items-center gap-3">
                <span className="text-xs w-24 truncate" style={{ color: 'var(--text-3)' }}>{aff.name.split(' ')[0]}</span>
                <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded-md"
                    style={{ width: `${(aff.totalRebates / maxReb) * 100}%`, background: 'var(--brand-light)', minWidth: 4 }}>
                  </div>
                </div>
                <span className="text-xs font-mono w-14 text-right" style={{ color: 'var(--text-2)' }}>{formatMoney(aff.totalRebates)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Performance */}
        <Card title="Monthly Performance" subtitle="Deposits over 12 months">
          <AreaChart data={monthlyDep} valueKey="deposits" height={160} color="var(--brand)" />
        </Card>

        {/* Tier Distribution donut */}
        <Card title="Tier Distribution" subtitle="Affiliates by tier">
          <div className="flex items-center gap-6">
            <svg width={160} height={160} viewBox="0 0 160 160">
              <circle cx={cx} cy={cy} r={r2} fill="none" strokeWidth={strokeW} stroke="var(--bg-surface)" />
              {donutSlices.map((slice, i) => (
                <circle key={i} cx={cx} cy={cy} r={r2} fill="none"
                  strokeWidth={strokeW} stroke={slice.color}
                  strokeDasharray={`${slice.dash} ${circ - slice.dash}`}
                  strokeDashoffset={-slice.offset + circ * 0.25}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
                />
              ))}
              <text x={cx} y={cy - 6} textAnchor="middle" className="font-bold" style={{ fill: 'var(--text-1)', fontSize: 22, fontWeight: 700 }}>{totalForPie}</text>
              <text x={cx} y={cy + 12} textAnchor="middle" style={{ fill: 'var(--text-4)', fontSize: 11 }}>affiliates</text>
            </svg>
            <div className="space-y-2">
              {tierCounts.map(t => (
                <div key={t.tid} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  <span className="text-xs" style={{ color: 'var(--text-2)' }}>{t.label}</span>
                  <span className="text-xs font-bold ml-1" style={{ color: t.color }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── TAB 8: Risk ───────────────────────────────────────────────────────────────
function RiskTab() {
  const [flagged, setFlagged] = useState({});

  const toggleFlag = (id) => setFlagged(prev => ({ ...prev, [id]: !prev[id] }));

  const alerts = [
    {
      severity: 'high',
      title: 'Unusual Rebate Activity',
      desc: 'Ehsan Khan has generated 3× their normal weekly rebate volume ($12,450 vs avg $4,100). Possible wash-trading or gaming detected.',
      icon: AlertTriangle,
      affName: 'Ehsan Khan',
    },
    {
      severity: 'high',
      title: 'Client Concentration Risk',
      desc: 'Carlos Mendez accounts for 28% of all referred clients (34 clients). Concentration risk if partner churns.',
      icon: Users,
      affName: 'Carlos Mendez',
    },
    {
      severity: 'medium',
      title: 'Deposit Spike Detected',
      desc: 'Viktor Petrov shows 180% MoM deposit growth ($45K → $126K). Unusual inflow pattern may require compliance review.',
      icon: TrendingUp,
      affName: 'Viktor Petrov',
    },
    {
      severity: 'low',
      title: 'Inactive Affiliates',
      desc: '2 affiliates have had zero activity in 60+ days (Hana Sato, Tom Walker). Consider outreach or account review.',
      icon: Activity,
      affName: null,
    },
  ];

  const severityColor = { high: 'var(--red)', medium: 'var(--warn)', low: 'var(--green)' };
  const severityBg    = { high: 'var(--red-bg)', medium: 'var(--warn-bg)', low: 'var(--green-bg)' };

  // Risk scores — simple deterministic computation
  const riskScores = useMemo(() => AFFILIATES.map(aff => {
    const r = rng(aff.id.charCodeAt(4) * 31);
    const base = r() * 40 + 10;
    const conc = aff.totalClients > 25 ? 30 : 0;
    const inact = aff.status === 'inactive' ? 20 : aff.status === 'suspended' ? 40 : 0;
    const score = Math.min(99, Math.round(base + conc + inact));
    const trend = r() > 0.5 ? 'up' : 'down';
    return { ...aff, riskScore: score, trend };
  }).sort((a, b) => b.riskScore - a.riskScore), []);

  return (
    <div className="space-y-6">
      {/* Alert cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: `1px solid ${severityColor[alert.severity]}44` }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: severityBg[alert.severity] }}>
                  <Icon size={16} style={{ color: severityColor[alert.severity] }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>{alert.title}</span>
                    <Badge status={alert.severity} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{alert.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk table */}
      <Card title="Affiliate Risk Scores" subtitle="Computed from activity, concentration, and compliance signals">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['Affiliate', 'Tier', 'Status', 'Risk Score', 'Trend', 'Clients', 'Flag for Review'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskScores.map((aff, i) => {
                const riskColor = aff.riskScore > 60 ? 'var(--red)' : aff.riskScore > 35 ? 'var(--warn)' : 'var(--green)';
                return (
                  <tr key={aff.id} style={{ borderTop: '1px solid var(--border-0)' }}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{aff.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-4)' }}>{aff.id}</div>
                    </td>
                    <td className="px-4 py-3"><TierBadge tierId={aff.tier} /></td>
                    <td className="px-4 py-3"><Badge status={aff.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm" style={{ color: riskColor }}>{aff.riskScore}</span>
                        <div className="w-20 h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                          <div className="h-full rounded-full" style={{ width: `${aff.riskScore}%`, background: riskColor }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: aff.trend === 'up' ? 'var(--red)' : 'var(--green)', fontSize: 16 }}>
                        {aff.trend === 'up' ? '▲' : '▼'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-2)' }}>{aff.totalClients}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFlag(aff.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                        style={{
                          background: flagged[aff.id] ? 'var(--red-bg)' : 'var(--bg-surface)',
                          color: flagged[aff.id] ? 'var(--red)' : 'var(--text-3)',
                          border: `1px solid ${flagged[aff.id] ? 'var(--red)' : 'var(--border-0)'}`,
                        }}>
                        <ShieldAlert size={12} />
                        {flagged[aff.id] ? 'Flagged' : 'Flag'}
                      </button>
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

// ── TAB 9: Settings ───────────────────────────────────────────────────────────
function SettingsTab() {
  const [programSettings, setProgramSettings] = useState({
    autoApproveRebates: false,
    emailNotifications: true,
    allowSubAffiliates: false,
    requireKycWithdrawal: true,
  });
  const [rates, setRates] = useState({
    defaultRebatePerLot: 3,
    depositBonusPct: 0.5,
    minPayoutThreshold: 50,
  });
  const [approvalRules, setApprovalRules] = useState({
    maxAutoApproveAmount: 500,
    approvalDelayDays: 1,
    manualReviewThreshold: 2000,
  });

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full transition-colors flex items-center px-0.5"
      style={{ background: value ? 'var(--brand)' : 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
      <span className="w-5 h-5 rounded-full transition-all duration-200 flex-shrink-0"
        style={{ background: '#fff', transform: value ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  );

  const saved = (label) => alert(`${label} saved successfully.`);

  return (
    <div className="space-y-6">
      {/* Program Settings */}
      <Card title="Program Settings" subtitle="Global affiliate program configuration">
        <div className="space-y-4">
          {[
            { key: 'autoApproveRebates',   label: 'Auto-approve Rebates',     desc: 'Automatically approve rebate calculations without manual review' },
            { key: 'emailNotifications',   label: 'Email Notifications',       desc: 'Send email notifications for rebate approvals and tier changes' },
            { key: 'allowSubAffiliates',   label: 'Allow Sub-Affiliates',      desc: 'Allow affiliates to recruit sub-affiliates (multi-level)' },
            { key: 'requireKycWithdrawal', label: 'Require KYC for Withdrawal',desc: 'Enforce KYC verification before processing rebate withdrawals' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-4 py-2">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{item.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{item.desc}</div>
              </div>
              <Toggle value={programSettings[item.key]} onChange={v => setProgramSettings(p => ({ ...p, [item.key]: v }))} />
            </div>
          ))}
          <div className="pt-2">
            <button onClick={() => saved('Program Settings')} className="px-5 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--brand)', color: '#fff' }}>Save Settings</button>
          </div>
        </div>
      </Card>

      {/* Default Rates */}
      <Card title="Default Rates" subtitle="Base rates applied to new affiliates">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'defaultRebatePerLot', label: 'Default Rebate per Lot ($)', prefix: '$' },
            { key: 'depositBonusPct',     label: 'Deposit Bonus (%)',          prefix: '' },
            { key: 'minPayoutThreshold',  label: 'Minimum Payout Threshold ($)', prefix: '$' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>{f.label}</label>
              <input type="number" value={rates[f.key]} onChange={e => setRates(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-1)' }} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button onClick={() => saved('Default Rates')} className="px-5 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--brand)', color: '#fff' }}>Save Rates</button>
        </div>
      </Card>

      {/* Auto Approval Rules */}
      <Card title="Auto Approval Rules" subtitle="Configure automated rebate approval thresholds">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'maxAutoApproveAmount',    label: 'Max Auto-Approve Amount ($)' },
            { key: 'approvalDelayDays',       label: 'Approval Delay (days)' },
            { key: 'manualReviewThreshold',   label: 'Manual Review Threshold ($)' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>{f.label}</label>
              <input type="number" value={approvalRules[f.key]} onChange={e => setApprovalRules(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-1)' }} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button onClick={() => saved('Auto Approval Rules')} className="px-5 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--brand)', color: '#fff' }}>Save Rules</button>
        </div>
      </Card>
    </div>
  );
}

// ── Main AffiliateManagement component ────────────────────────────────────────
export default function AffiliateManagement() {
  const [tab, setTab] = useState('overview');

  const renderTab = () => {
    switch (tab) {
      case 'overview':   return <OverviewTab />;
      case 'affiliates': return <AffiliatesTab />;
      case 'clients':    return <ClientsTab />;
      case 'rebates':    return <RebatesTab />;
      case 'tiers':      return <TiersTab />;
      case 'rankings':   return <RankingsTab />;
      case 'reports':    return <ReportsTab />;
      case 'risk':       return <RiskTab />;
      case 'settings':   return <SettingsTab />;
      default:           return <OverviewTab />;
    }
  };

  return (
    <div>
      <TabBar active={tab} onChange={setTab} />
      {renderTab()}
    </div>
  );
}
