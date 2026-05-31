import React, { useState } from 'react';
import { X, Download, Users, Activity, TrendingUp, ArrowDownToLine, BarChart3 } from 'lucide-react';
import { AffStatCard, AffCard, AffDataTable, AffBadge, AffPageHeader, AffMoney, FilterBtn } from '../affiliateUI';
import { CLIENTS, DEPOSITS, REBATES, TRADE_LOTS, formatFull } from '../affiliateMockData';

// ── Client detail drawer ──────────────────────────────────────────────────────
function ClientDrawer({ client, onClose }) {
  if (!client) return null;
  const clientDeposits = DEPOSITS.filter(d => d.clientId === client.id);
  const clientRebates  = REBATES.filter(r => r.clientId === client.id);
  const clientTrades   = TRADE_LOTS.filter(t => t.clientId === client.id);
  const totalDeps = clientDeposits.filter(d => d.status === 'completed').reduce((s, d) => s + d.amount, 0);
  const totalReb  = clientRebates.reduce((s, r) => s + r.rebateAmount, 0);

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{ width: 480, background: 'var(--bg-card)', borderLeft: '1px solid var(--border-1)', boxShadow: '-20px 0 60px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-0)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>
              {client.name[0]}
            </div>
            <div>
              <div className="font-bold text-base" style={{ color: 'var(--text-1)' }}>{client.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-4)' }}>{client.id} · {client.flag} {client.country}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Deposits',   value: formatFull(totalDeps),             color: '#10B981' },
              { label: 'Monthly Deposit',  value: formatFull(client.monthlyNetDeposit), color: '#3B82F6' },
              { label: 'Total Lots',       value: client.totalLots + ' L',           color: '#7C3AED' },
              { label: 'Rebate Contrib.',  value: formatFull(totalReb),              color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3.5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="text-xs mb-1" style={{ color: 'var(--text-4)' }}>{s.label}</div>
                <div className="font-mono font-bold text-base" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Profile info */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-0)' }}>
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--bg-surface)', color: 'var(--text-3)' }}>Profile</div>
            {[
              ['Email', client.email],
              ['Country', `${client.flag} ${client.country}`],
              ['Registered', client.registeredDate],
              ['Last Trade', client.lastTradeDate],
              ['Campaign', client.campaign],
              ['KYC Status', null],
              ['Account Status', null],
              ['Activity', null],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid var(--border-0)' }}>
                <span className="text-xs" style={{ color: 'var(--text-4)' }}>{label}</span>
                {label === 'KYC Status' ? <AffBadge status={client.kycStatus} />
                 : label === 'Account Status' ? <AffBadge status={client.accountStatus} />
                 : label === 'Activity' ? <AffBadge status={client.activityStatus} />
                 : <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{value}</span>}
              </div>
            ))}
          </div>

          {/* Deposit history */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Deposit History</div>
            {clientDeposits.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-4)' }}>No deposits recorded.</p>
            ) : clientDeposits.slice(0, 5).map(d => (
              <div key={d.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border-0)' }}>
                <div>
                  <div className="text-sm font-mono font-bold" style={{ color: '#10B981' }}>${d.amount.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: 'var(--text-4)' }}>{d.date} · {d.paymentMethod}</div>
                </div>
                <AffBadge status={d.status} />
              </div>
            ))}
          </div>

          {/* Trading summary */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Trading Activity</div>
            {clientTrades.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-4)' }}>No trades recorded.</p>
            ) : clientTrades.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border-0)' }}>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{t.symbol} <span className="text-xs capitalize font-mono">{t.direction}</span></div>
                  <div className="text-xs" style={{ color: 'var(--text-4)' }}>{t.product} · {t.lots} lots · {t.openTime}</div>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: '#10B981' }}>+${t.rebateGenerated}</span>
              </div>
            ))}
          </div>

          {/* Rebate contribution */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Rebate Contribution</div>
            {clientRebates.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-4)' }}>No rebates recorded.</p>
            ) : clientRebates.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border-0)' }}>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{r.symbol}</div>
                  <div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.lots} lots × ${r.rebateRate}/lot · {r.tradeDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold" style={{ color: '#10B981' }}>${r.rebateAmount.toFixed(2)}</div>
                  <AffBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AffiliateClients() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);

  const filtered = filterStatus === 'all' ? CLIENTS : CLIENTS.filter(c => c.activityStatus === filterStatus);
  const activeCount  = CLIENTS.filter(c => c.activityStatus === 'active').length;
  const dormantCount = CLIENTS.filter(c => c.activityStatus === 'dormant').length;
  const newThisMonth = CLIENTS.filter(c => c.regDays <= 30).length;

  const columns = [
    { key: 'id',              label: 'Client ID',   sortable: true, render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>{r.id}</span> },
    { key: 'name',            label: 'Client',      sortable: true, render: r => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)' }}>{r.name[0]}</div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{r.name}</div>
            <div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.email}</div>
          </div>
        </div>
      )},
    { key: 'country',         label: 'Country',     sortable: true, render: r => <span className="text-sm">{r.flag} {r.country}</span> },
    { key: 'registeredDate',  label: 'Registered',  sortable: false, render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.registeredDate}</span> },
    { key: 'accountStatus',   label: 'Account',     sortable: true,  render: r => <AffBadge status={r.accountStatus} /> },
    { key: 'totalDeposits',   label: 'Total Deps',  sortable: true,  render: r => <AffMoney value={r.totalDeposits} /> },
    { key: 'monthlyNetDeposit', label: 'Monthly Dep', sortable: true, render: r => <AffMoney value={r.monthlyNetDeposit} /> },
    { key: 'totalLots',       label: 'Lots',        sortable: true,  render: r => <span className="font-mono text-sm">{r.totalLots}</span> },
    { key: 'totalRebate',     label: 'Rebate',      sortable: true,  render: r => <AffMoney value={r.totalRebate} /> },
    { key: 'lastTradeDate',   label: 'Last Trade',  sortable: false, render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.lastTradeDate}</span> },
    { key: 'activityStatus',  label: 'Activity',    sortable: true,  render: r => <AffBadge status={r.activityStatus} /> },
    { key: '_action',         label: '',             render: r => (
        <button onClick={() => setSelectedClient(r)} className="text-xs px-2.5 py-1 rounded-lg font-semibold"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
          Details
        </button>
      )},
  ];

  return (
    <div>
      <AffPageHeader title="Referred Clients" subtitle="All clients registered through your affiliate link"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', color: 'var(--text-2)' }}>
            <Download size={13} /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <AffStatCard label="Total Clients"    value={CLIENTS.length}  icon={Users}          accent="#3B82F6" />
        <AffStatCard label="Active"           value={activeCount}     icon={Activity}       accent="#10B981" />
        <AffStatCard label="Dormant"          value={dormantCount}    icon={TrendingUp}     accent="#F59E0B" />
        <AffStatCard label="New This Month"   value={newThisMonth}    icon={Users}          accent="#7C3AED" />
      </div>

      <AffCard title="Client Directory" subtitle="Click any row to view detailed client profile"
        actions={
          <div className="flex gap-2 flex-wrap">
            {['all', 'active', 'dormant', 'inactive'].map(s => (
              <FilterBtn key={s} label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                active={filterStatus === s} onClick={() => setFilterStatus(s)} />
            ))}
          </div>
        }>
        <AffDataTable
          columns={columns}
          rows={filtered}
          searchKeys={['name', 'email', 'country', 'id']}
          searchPlaceholder="Search by name, email or ID…"
          pageSize={10}
        />
      </AffCard>

      <ClientDrawer client={selectedClient} onClose={() => setSelectedClient(null)} />
    </div>
  );
}
