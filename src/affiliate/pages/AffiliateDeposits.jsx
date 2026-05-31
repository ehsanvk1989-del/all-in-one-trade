import React, { useState, useMemo } from 'react';
import { ArrowDownToLine, Download, TrendingUp, DollarSign } from 'lucide-react';
import { AffStatCard, AffCard, AffDataTable, AffBadge, AffPageHeader, AffMoney, FilterBtn } from '../affiliateUI';
import { DEPOSITS, formatMoney } from '../affiliateMockData';

export default function AffiliateDeposits() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  const campaigns = ['all', ...Array.from(new Set(DEPOSITS.map(d => d.campaign)))];

  const filtered = useMemo(() => DEPOSITS.filter(d => {
    const okStatus   = statusFilter === 'all' || d.status === statusFilter;
    const okCampaign = campaignFilter === 'all' || d.campaign === campaignFilter;
    return okStatus && okCampaign;
  }), [statusFilter, campaignFilter]);

  const completed  = DEPOSITS.filter(d => d.status === 'completed');
  const totalDeps  = completed.reduce((s, d) => s + d.amount, 0);
  const now = new Date(2025, 4, 31);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthlyDeps = completed.filter(d => d.ts >= monthStart).reduce((s, d) => s + d.amount, 0);
  const avgDeposit  = completed.length ? totalDeps / completed.length : 0;

  const columns = [
    { key: 'id',            label: 'Deposit ID', sortable: true, render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>{r.id}</span> },
    { key: 'clientName',    label: 'Client',     sortable: true, render: r => (
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{r.clientName}</div>
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.clientId}</div>
        </div>
      )},
    { key: 'date',          label: 'Date',       sortable: false, render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.date}</span> },
    { key: 'amount',        label: 'Amount',     sortable: true,  render: r => <AffMoney value={r.amount} /> },
    { key: 'currency',      label: 'Currency',   render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{r.currency}</span> },
    { key: 'paymentMethod', label: 'Method',     render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.paymentMethod}</span> },
    { key: 'status',        label: 'Status',     sortable: true,  render: r => <AffBadge status={r.status} /> },
    { key: 'campaign',      label: 'Campaign',   sortable: true,  render: r => (
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>{r.campaign}</span>
      )},
  ];

  return (
    <div>
      <AffPageHeader title="Client Deposits" subtitle="All deposits from your referred clients. Withdrawals are not tracked here."
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', color: 'var(--text-2)' }}>
            <Download size={13} /> Export
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <AffStatCard label="Total Deposits (Completed)"  value={formatMoney(totalDeps)}   icon={ArrowDownToLine} accent="#10B981" sub={`${completed.length} transactions`} />
        <AffStatCard label="Monthly Deposits (May '25)"  value={formatMoney(monthlyDeps)} icon={TrendingUp}      accent="#3B82F6" />
        <AffStatCard label="Average Deposit"             value={formatMoney(avgDeposit)}  icon={DollarSign}      accent="#7C3AED" sub="per completed transaction" />
      </div>

      <AffCard title="Deposit Records"
        subtitle="Only deposits — no withdrawals are shown in the affiliate portal"
        actions={
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1.5">
              {['all', 'completed', 'processing', 'pending'].map(s => (
                <FilterBtn key={s} label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  active={statusFilter === s} onClick={() => setStatusFilter(s)} />
              ))}
            </div>
            <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}
              className="input-dark text-xs" style={{ padding: '0.35rem 0.6rem' }}>
              {campaigns.map(c => <option key={c} value={c}>{c === 'all' ? 'All Campaigns' : c}</option>)}
            </select>
          </div>
        }>
        <AffDataTable
          columns={columns}
          rows={filtered}
          searchKeys={['clientName', 'clientId', 'id', 'paymentMethod', 'campaign']}
          searchPlaceholder="Search by client, ID or method…"
          pageSize={10}
        />
      </AffCard>

      {/* Summary breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {['USDT TRC20', 'USDT ERC20', 'Bank Transfer', 'Credit Card'].map(method => {
          const methodDeps = completed.filter(d => d.paymentMethod === method);
          const total = methodDeps.reduce((s, d) => s + d.amount, 0);
          return total > 0 ? (
            <div key={method} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-3)' }}>{method}</div>
              <div className="font-mono font-bold text-lg" style={{ color: '#10B981' }}>{formatMoney(total)}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>{methodDeps.length} transactions</div>
              <div className="mt-2 h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                <div className="h-full rounded-full" style={{ width: `${(total / totalDeps * 100).toFixed(0)}%`, background: '#10B981' }} />
              </div>
              <div className="text-xs mt-1 text-right" style={{ color: 'var(--text-4)' }}>{(total / totalDeps * 100).toFixed(1)}%</div>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
