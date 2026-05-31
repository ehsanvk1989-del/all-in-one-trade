import React, { useState, useMemo } from 'react';
import { DollarSign, Clock, TrendingUp, Download } from 'lucide-react';
import { AffStatCard, AffCard, AffDataTable, AffBadge, AffPageHeader, AffBarChart, AffMoney, FilterBtn } from '../affiliateUI';
import {
  REBATES, CLIENTS, getWeeklyRebates, getRebatesByProduct, getAffiliateSummary, formatMoney,
} from '../affiliateMockData';

const S = getAffiliateSummary();
const weeklyRebSeries = getWeeklyRebates();
const productBreakdown = getRebatesByProduct();
const PRODUCT_COLORS = { crypto: '#3B82F6', forex: '#7C3AED', simple: '#10B981' };
const PRODUCT_LABELS = { crypto: 'Crypto Futures', forex: 'Forex & Commodities', simple: 'Simple Trade' };

export default function AffiliateRebates() {
  const [tab, setTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const TABS = [
    { id: 'all',     label: 'All Rebates' },
    { id: 'weekly',  label: 'By Week' },
    { id: 'client',  label: 'By Client' },
    { id: 'product', label: 'By Product' },
    { id: 'symbol',  label: 'By Symbol' },
  ];

  const filteredRebates = useMemo(() =>
    statusFilter === 'all' ? REBATES : REBATES.filter(r => r.status === statusFilter),
  [statusFilter]);

  // By client aggregation
  const byClient = useMemo(() => {
    const map = {};
    REBATES.forEach(r => {
      if (!map[r.clientId]) map[r.clientId] = { clientId: r.clientId, clientName: r.clientName, total: 0, lots: 0, count: 0 };
      map[r.clientId].total += r.rebateAmount;
      map[r.clientId].lots  += r.lots;
      map[r.clientId].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, []);

  // By symbol aggregation
  const bySymbol = useMemo(() => {
    const map = {};
    REBATES.forEach(r => {
      if (!map[r.symbol]) map[r.symbol] = { symbol: r.symbol, product: r.product, total: 0, lots: 0, count: 0 };
      map[r.symbol].total += r.rebateAmount;
      map[r.symbol].lots  += r.lots;
      map[r.symbol].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, []);

  const mainColumns = [
    { key: 'id',           label: 'Rebate ID',   render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-4)' }}>{r.id}</span> },
    { key: 'clientName',   label: 'Client',      sortable: true, render: r => <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{r.clientName}</span> },
    { key: 'symbol',       label: 'Symbol',      sortable: true, render: r => <span className="font-mono text-sm font-bold" style={{ color: 'var(--text-1)' }}>{r.symbol}</span> },
    { key: 'product',      label: 'Product',     sortable: true, render: r => <AffBadge status={r.product} label={PRODUCT_LABELS[r.product]} /> },
    { key: 'lots',         label: 'Lots',        sortable: true, render: r => <span className="font-mono text-sm">{r.lots}</span> },
    { key: 'rebateRate',   label: 'Rate',        render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>${r.rebateRate}/lot</span> },
    { key: 'rebateAmount', label: 'Rebate',      sortable: true, render: r => <AffMoney value={r.rebateAmount} /> },
    { key: 'tradeDate',    label: 'Trade Date',  render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.tradeDate}</span> },
    { key: 'status',       label: 'Status',      sortable: true, render: r => <AffBadge status={r.status} /> },
  ];

  return (
    <div>
      <AffPageHeader title="Rebates & Commissions" subtitle="Detailed breakdown of all rebates earned from referred clients"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', color: 'var(--text-2)' }}>
            <Download size={13} /> Export
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <AffStatCard label="Total Rebates"    value={formatMoney(S.totalRebates)}     icon={DollarSign}  accent="#10B981" />
        <AffStatCard label="This Week"        value={'$' + S.thisWeekRebates.toFixed(0)}  icon={Clock} accent="#F59E0B" />
        <AffStatCard label="This Month"       value={'$' + S.thisMonthRebates.toFixed(0)} icon={TrendingUp} accent="#3B82F6" />
        <AffStatCard label="Pending"          value={formatMoney(S.pendingRebates)}   icon={Clock}       accent="#F59E0B" />
        <AffStatCard label="Paid"             value={formatMoney(S.paidRebates)}      icon={DollarSign}  accent="#10B981" />
      </div>

      {/* Weekly chart + product breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <AffCard title="Weekly Rebates" subtitle="Last 8 weeks" accent="#10B981">
            <AffBarChart data={weeklyRebSeries} valueKey="rebates" height={150} color="#10B981" />
          </AffCard>
        </div>
        <AffCard title="Rebates by Product" subtitle="All time breakdown" accent="#7C3AED">
          <div className="space-y-4 py-2">
            {productBreakdown.map(p => {
              const pct = S.totalRebates > 0 ? (p.amount / S.totalRebates * 100) : 0;
              const color = PRODUCT_COLORS[p.product];
              return (
                <div key={p.product}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-2)' }}>{PRODUCT_LABELS[p.product]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold" style={{ color }}>${p.amount.toFixed(0)}</span>
                      <span className="text-xs" style={{ color: 'var(--text-4)' }}>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AffCard>
      </div>

      {/* Tab section */}
      <AffCard noPad>
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-5 pt-4 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-0)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative flex-shrink-0"
              style={{ color: tab === t.id ? '#10B981' : 'var(--text-3)', background: tab === t.id ? 'rgba(16,185,129,0.08)' : 'transparent', borderRadius: '8px 8px 0 0' }}>
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#10B981' }} />}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'all' && (
            <AffDataTable
              columns={mainColumns}
              rows={filteredRebates}
              searchKeys={['clientName', 'symbol', 'product', 'id']}
              searchPlaceholder="Search by client, symbol or product…"
              pageSize={10}
              filters={
                <div className="flex gap-2">
                  {['all', 'paid', 'approved', 'pending'].map(s => (
                    <FilterBtn key={s} label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                      active={statusFilter === s} onClick={() => setStatusFilter(s)} />
                  ))}
                </div>
              }
            />
          )}

          {tab === 'weekly' && (
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-0)' }}>
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)' }}>
                    {['Week', 'Rebates Earned'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeklyRebSeries.map((w, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-0)' }}>
                      <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-2)' }}>Week {i + 1} of 8</td>
                      <td className="px-4 py-3"><AffMoney value={w.rebates} /></td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid var(--border-1)' }}>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--text-1)' }}>Total (8 weeks)</td>
                    <td className="px-4 py-3"><AffMoney value={weeklyRebSeries.reduce((s, w) => s + w.rebates, 0)} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === 'client' && (
            <AffDataTable
              columns={[
                { key: 'clientId',   label: 'Client ID',    render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-4)' }}>{r.clientId}</span> },
                { key: 'clientName', label: 'Client',       sortable: true, render: r => <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{r.clientName}</span> },
                { key: 'count',      label: 'Trades',       sortable: true, render: r => <span className="font-mono text-sm">{r.count}</span> },
                { key: 'lots',       label: 'Lots',         sortable: true, render: r => <span className="font-mono text-sm">{r.lots.toFixed(2)}</span> },
                { key: 'total',      label: 'Total Rebate', sortable: true, render: r => <AffMoney value={r.total} /> },
              ]}
              rows={byClient}
              searchKeys={['clientName', 'clientId']}
              searchPlaceholder="Search clients…"
              pageSize={12}
            />
          )}

          {tab === 'product' && (
            <div className="space-y-3">
              {productBreakdown.map(p => {
                const prodRebates = REBATES.filter(r => r.product === p.product);
                const lots = prodRebates.reduce((s, r) => s + r.lots, 0);
                return (
                  <div key={p.product} className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                    <div className="w-3 h-12 rounded-full flex-shrink-0" style={{ background: PRODUCT_COLORS[p.product] }} />
                    <div className="flex-1">
                      <div className="font-bold text-sm mb-1" style={{ color: 'var(--text-1)' }}>{PRODUCT_LABELS[p.product]}</div>
                      <div className="text-xs" style={{ color: 'var(--text-3)' }}>{prodRebates.length} trades · {lots.toFixed(2)} lots</div>
                    </div>
                    <div className="text-right">
                      <AffMoney value={p.amount} />
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>
                        {S.totalRebates > 0 ? (p.amount / S.totalRebates * 100).toFixed(1) : 0}% of total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'symbol' && (
            <AffDataTable
              columns={[
                { key: 'symbol',  label: 'Symbol',  sortable: true, render: r => <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-1)' }}>{r.symbol}</span> },
                { key: 'product', label: 'Product', sortable: true, render: r => <AffBadge status={r.product} label={PRODUCT_LABELS[r.product]} /> },
                { key: 'count',   label: 'Trades',  sortable: true, render: r => <span className="font-mono text-sm">{r.count}</span> },
                { key: 'lots',    label: 'Lots',    sortable: true, render: r => <span className="font-mono text-sm">{r.lots.toFixed(2)}</span> },
                { key: 'total',   label: 'Rebate',  sortable: true, render: r => <AffMoney value={r.total} /> },
              ]}
              rows={bySymbol}
              searchKeys={['symbol', 'product']}
              searchPlaceholder="Search symbol…"
              pageSize={12}
            />
          )}
        </div>
      </AffCard>
    </div>
  );
}
