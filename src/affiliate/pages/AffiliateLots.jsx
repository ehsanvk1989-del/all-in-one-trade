import React from 'react';
import { BarChart3, Download } from 'lucide-react';
import { AffStatCard, AffCard, AffDataTable, AffBadge, AffPageHeader, AffBarChart, AffMoney } from '../affiliateUI';
import { TRADE_LOTS, getLotsByProduct, getWeeklyLots } from '../affiliateMockData';

const PRODUCT_LABELS = { crypto: 'Crypto Futures', forex: 'Forex & Commodities', simple: 'Simple Trade' };
const PRODUCT_COLORS = { crypto: '#3B82F6', forex: '#7C3AED', simple: '#10B981' };
const weeklyLotsData = getWeeklyLots();
const lotsByProduct  = getLotsByProduct();

export default function AffiliateLots() {
  const totalLots   = TRADE_LOTS.reduce((s, t) => s + t.lots, 0);
  const totalVolume = TRADE_LOTS.reduce((s, t) => s + t.volume, 0);
  const totalRebate = TRADE_LOTS.reduce((s, t) => s + t.rebateGenerated, 0);

  // By client
  const byClient = Object.values(
    TRADE_LOTS.reduce((map, t) => {
      if (!map[t.clientId]) map[t.clientId] = { clientId: t.clientId, clientName: t.clientName, lots: 0, volume: 0, rebate: 0, trades: 0 };
      map[t.clientId].lots += t.lots;
      map[t.clientId].volume += t.volume;
      map[t.clientId].rebate += t.rebateGenerated;
      map[t.clientId].trades += 1;
      return map;
    }, {})
  ).sort((a, b) => b.lots - a.lots);

  const columns = [
    { key: 'id',           label: 'Trade ID',  render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-4)' }}>{r.id}</span> },
    { key: 'clientName',   label: 'Client',    sortable: true, render: r => (
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{r.clientName}</div>
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.clientId}</div>
        </div>
      )},
    { key: 'product',      label: 'Product',   sortable: true, render: r => <AffBadge status={r.product} label={PRODUCT_LABELS[r.product]} /> },
    { key: 'symbol',       label: 'Symbol',    sortable: true, render: r => <span className="font-mono text-sm font-bold" style={{ color: 'var(--text-1)' }}>{r.symbol}</span> },
    { key: 'direction',    label: 'Side',      render: r => <AffBadge status={r.direction} /> },
    { key: 'lots',         label: 'Lots',      sortable: true, render: r => <span className="font-mono text-sm font-bold">{r.lots}</span> },
    { key: 'volume',       label: 'Volume',    sortable: true, render: r => <AffMoney value={r.volume} /> },
    { key: 'openTime',     label: 'Open',      render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.openTime}</span> },
    { key: 'closeTime',    label: 'Close',     render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.closeTime}</span> },
    { key: 'rebateGenerated', label: 'Rebate', sortable: true, render: r => (
        <span className="font-mono font-bold text-sm" style={{ color: '#10B981' }}>${r.rebateGenerated.toFixed(2)}</span>
      )},
  ];

  return (
    <div>
      <AffPageHeader title="Trading Volume" subtitle="Lots traded by your referred clients across all products"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', color: 'var(--text-2)' }}>
            <Download size={13} /> Export
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <AffStatCard label="Total Lots Traded"  value={totalLots.toFixed(1) + ' L'} icon={BarChart3}  accent="#3B82F6" />
        <AffStatCard label="Total Volume"        value={'$' + (totalVolume / 1000).toFixed(0) + 'K'}  icon={BarChart3} accent="#10B981" />
        <AffStatCard label="Rebate Generated"    value={'$' + totalRebate.toFixed(0)} icon={BarChart3} accent="#7C3AED" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <AffCard title="Weekly Lots Traded" subtitle="Last 8 weeks" accent="#3B82F6">
            <AffBarChart data={weeklyLotsData} valueKey="lots" height={160} color="#3B82F6" />
          </AffCard>
        </div>
        <AffCard title="Lots by Product" subtitle="All time" accent="#7C3AED">
          <div className="space-y-5 py-3">
            {lotsByProduct.map(p => {
              const pct = totalLots > 0 ? (p.lots / totalLots * 100) : 0;
              const color = PRODUCT_COLORS[p.product];
              return (
                <div key={p.product}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{PRODUCT_LABELS[p.product]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold" style={{ color }}>{p.lots}L</span>
                      <span className="text-xs" style={{ color: 'var(--text-4)' }}>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AffCard>
      </div>

      {/* By Client breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AffCard title="Lots by Client" subtitle="Top contributors" accent="#10B981">
          <div className="space-y-3">
            {byClient.slice(0, 8).map((c, i) => {
              const pct = totalLots > 0 ? (c.lots / totalLots * 100) : 0;
              return (
                <div key={c.clientId} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-5 text-right flex-shrink-0" style={{ color: 'var(--text-4)' }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{c.clientName}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: '#3B82F6' }}>{c.lots.toFixed(2)}L</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `hsl(${210 + i * 15}, 70%, 55%)` }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: '#10B981' }}>${c.rebate.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </AffCard>

        <AffCard title="Top Symbols" subtitle="By lots volume" accent="#F59E0B">
          <div className="space-y-3">
            {Object.values(
              TRADE_LOTS.reduce((map, t) => {
                if (!map[t.symbol]) map[t.symbol] = { symbol: t.symbol, product: t.product, lots: 0, rebate: 0 };
                map[t.symbol].lots += t.lots;
                map[t.symbol].rebate += t.rebateGenerated;
                return map;
              }, {})
            ).sort((a, b) => b.lots - a.lots).slice(0, 8).map((s, i) => {
              const pct = totalLots > 0 ? (s.lots / totalLots * 100) : 0;
              return (
                <div key={s.symbol} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-1)' }}>{s.symbol}</span>
                      <span className="text-xs font-mono" style={{ color: '#F59E0B' }}>{s.lots.toFixed(2)}L</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PRODUCT_COLORS[s.product] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AffCard>
      </div>

      {/* Full trade table */}
      <AffCard title="Trade History" subtitle="All trades from your referred clients">
        <AffDataTable
          columns={columns}
          rows={TRADE_LOTS}
          searchKeys={['clientName', 'symbol', 'product']}
          searchPlaceholder="Search by client, symbol or product…"
          pageSize={10}
        />
      </AffCard>
    </div>
  );
}
