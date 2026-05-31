import React, { useState } from 'react';
import { FileText, Users, Globe, DollarSign, BarChart3 } from 'lucide-react';
import { AffCard, AffPageHeader, AffBarChart, AffAreaChart, AffStatCard, FilterBtn } from '../affiliateUI';
import {
  CLIENTS, REBATES, DEPOSITS, TRADE_LOTS,
  getMonthlyDeposits, getWeeklyRebates, getClientGrowth, getWeeklyLots,
  getDepositsByCountry, getRebatesByProduct, getLotsByProduct, formatMoney,
} from '../affiliateMockData';

const PRODUCT_COLORS = { crypto: '#3B82F6', forex: '#7C3AED', simple: '#10B981' };
const PRODUCT_LABELS = { crypto: 'Crypto', forex: 'Forex', simple: 'Simple' };

const monthlyDeps   = getMonthlyDeposits();
const weeklyRebs    = getWeeklyRebates();
const clientGrowth  = getClientGrowth();
const weeklyLots    = getWeeklyLots();
const depsByCountry = getDepositsByCountry();
const rebsByProduct = getRebatesByProduct();
const lotsByProduct = getLotsByProduct();

export default function AffiliateReports() {
  const [productFilter, setProductFilter] = useState('all');

  const activeCount   = CLIENTS.filter(c => c.activityStatus === 'active').length;
  const inactiveCount = CLIENTS.length - activeCount;
  const completedDeps = DEPOSITS.filter(d => d.status === 'completed');
  const totalDeps = completedDeps.reduce((s, d) => s + d.amount, 0);
  const totalReb  = REBATES.reduce((s, r) => s + r.rebateAmount, 0);
  const totalLots = TRADE_LOTS.reduce((s, t) => s + t.lots, 0);

  return (
    <div>
      <AffPageHeader title="Reports & Analytics" subtitle="Performance analysis across clients, deposits, rebates, and trading volume"
        actions={
          <div className="flex gap-2">
            {['all', 'crypto', 'forex', 'simple'].map(f => (
              <FilterBtn key={f} label={f === 'all' ? 'All Products' : PRODUCT_LABELS[f]}
                active={productFilter === f} onClick={() => setProductFilter(f)} />
            ))}
          </div>
        }
      />

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <AffStatCard label="Total Deposits" value={formatMoney(totalDeps)}           icon={DollarSign} accent="#10B981" />
        <AffStatCard label="Total Rebates"  value={formatMoney(totalReb)}            icon={DollarSign} accent="#3B82F6" />
        <AffStatCard label="Total Lots"     value={totalLots.toFixed(1) + ' L'}      icon={BarChart3}  accent="#7C3AED" />
        <AffStatCard label="Total Clients"  value={CLIENTS.length} icon={Users}      accent="#F59E0B" sub={`${activeCount} active`} />
      </div>

      {/* Row 1: Deposits + Rebates charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AffCard title="Monthly Net Deposits" subtitle="12-month trend" accent="#10B981">
          <AffAreaChart data={monthlyDeps} valueKey="deposits" height={150} color="#10B981" />
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Peak Month',  value: formatMoney(Math.max(...monthlyDeps.map(d => d.deposits))), color: '#10B981' },
              { label: 'Avg Monthly', value: formatMoney(monthlyDeps.reduce((s, d) => s + d.deposits, 0) / monthlyDeps.length), color: '#3B82F6' },
              { label: 'Latest',      value: formatMoney(monthlyDeps[monthlyDeps.length - 1].deposits), color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                <div className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </AffCard>

        <AffCard title="Weekly Rebates" subtitle="8-week trend" accent="#3B82F6">
          <AffBarChart data={weeklyRebs} valueKey="rebates" height={150} color="#3B82F6" />
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Best Week',  value: '$' + Math.max(...weeklyRebs.map(w => w.rebates)).toFixed(0), color: '#10B981' },
              { label: 'Avg Week',   value: '$' + (weeklyRebs.reduce((s, w) => s + w.rebates, 0) / weeklyRebs.length).toFixed(0), color: '#3B82F6' },
              { label: 'This Week',  value: '$' + weeklyRebs[weeklyRebs.length - 1].rebates.toFixed(0), color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                <div className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </AffCard>
      </div>

      {/* Row 2: Client growth + Lots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AffCard title="Client Acquisition" subtitle="Cumulative client growth over 12 months" accent="#7C3AED">
          <AffAreaChart data={clientGrowth} valueKey="total" height={150} color="#7C3AED" />
        </AffCard>

        <AffCard title="Weekly Trading Volume (Lots)" subtitle="8-week lot volume" accent="#F59E0B">
          <AffBarChart data={weeklyLots} valueKey="lots" height={150} color="#F59E0B" />
        </AffCard>
      </div>

      {/* Row 3: By country + active vs inactive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <AffCard title="Deposits by Country" subtitle="Top 8 countries by total client deposits" accent="#10B981">
            <div className="space-y-3">
              {depsByCountry.map((c, i) => {
                const pct = totalDeps > 0 ? (c.amount / totalDeps * 100) : 0;
                return (
                  <div key={c.country} className="flex items-center gap-3">
                    <span className="text-base w-6 flex-shrink-0">{c.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{c.country}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold" style={{ color: '#10B981' }}>{formatMoney(c.amount)}</span>
                          <span className="text-xs" style={{ color: 'var(--text-4)' }}>{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `hsl(${140 + i * 12}, 60%, 50%)` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AffCard>
        </div>

        <div className="space-y-4">
          <AffCard title="Active vs Inactive" subtitle="Client activity status" accent="#3B82F6">
            <div className="flex items-center justify-center my-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-extrabold font-mono" style={{ color: '#10B981' }}>{activeCount}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Active</div>
              </div>
              <div className="h-12 w-px" style={{ background: 'var(--border-0)' }} />
              <div className="text-center">
                <div className="text-3xl font-extrabold font-mono" style={{ color: '#F59E0B' }}>{inactiveCount}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Dormant/Inactive</div>
              </div>
            </div>
            <div className="h-2.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
              <div className="h-full rounded-full" style={{ width: `${(activeCount / CLIENTS.length * 100).toFixed(0)}%`, background: 'linear-gradient(90deg, #10B981, #3B82F6)' }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs" style={{ color: '#10B981' }}>{(activeCount / CLIENTS.length * 100).toFixed(0)}% active</span>
              <span className="text-xs" style={{ color: 'var(--text-4)' }}>{CLIENTS.length} total</span>
            </div>
          </AffCard>

          <AffCard title="Rebates by Product" subtitle="All time" accent="#7C3AED">
            <div className="space-y-3 mt-2">
              {rebsByProduct.map(p => {
                const pct = totalReb > 0 ? (p.amount / totalReb * 100) : 0;
                return (
                  <div key={p.product}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{PRODUCT_LABELS[p.product]}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: PRODUCT_COLORS[p.product] }}>${p.amount.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PRODUCT_COLORS[p.product] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </AffCard>
        </div>
      </div>
    </div>
  );
}
