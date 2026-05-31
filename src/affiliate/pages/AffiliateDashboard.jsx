import React from 'react';
import { Users, ArrowDownToLine, DollarSign, TrendingUp, BarChart3, Clock, Wallet, Activity } from 'lucide-react';
import { AffStatCard, AffCard, AffBarChart, AffAreaChart, AffBadge, AffPageHeader, AffMoney } from '../affiliateUI';
import {
  getAffiliateSummary, getMonthlyDeposits, getWeeklyRebates,
  getClientGrowth, getWeeklyLots, CLIENTS, formatFull, formatMoney,
} from '../affiliateMockData';
import { TierProgressCard } from './AffiliateTierPlan';

const S = getAffiliateSummary();
const monthlyDeps = getMonthlyDeposits();
const weeklyRebs  = getWeeklyRebates();
const clientGrowth = getClientGrowth();
const weeklyLots  = getWeeklyLots();

const TOP_CLIENTS = [...CLIENTS].sort((a, b) => b.totalRebate - a.totalRebate).slice(0, 6);

export default function AffiliateDashboard({ onNavigate }) {
  return (
    <div>
      <AffPageHeader
        title="Partner Dashboard"
        subtitle="Your performance overview — all time"
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981' }} />
            Live Data
          </div>
        }
      />

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <AffStatCard label="Total Clients"   value={S.totalClients}                     icon={Users}          accent="#3B82F6" sub={`${S.activeClients} active`} onClick={() => onNavigate('clients')} />
        <AffStatCard label="Total Deposits"  value={formatMoney(S.totalDeposits)}        icon={ArrowDownToLine} accent="#10B981" sub="all time" onClick={() => onNavigate('deposits')} />
        <AffStatCard label="Monthly Deposits" value={formatMoney(S.monthlyDeposits)}     icon={TrendingUp}     accent="#3B82F6" sub="May 2025" />
        <AffStatCard label="Total Rebates"   value={formatMoney(S.totalRebates)}         icon={DollarSign}     accent="#10B981" sub="all products" onClick={() => onNavigate('rebates')} />
        <AffStatCard label="Total Lots"      value={S.totalLots.toLocaleString() + ' L'} icon={BarChart3}      accent="#7C3AED" sub="across all clients" onClick={() => onNavigate('lots')} />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <AffStatCard label="This Week" value={'$' + S.thisWeekRebates.toFixed(0)} icon={Clock}     accent="#F59E0B" sub="rebates" />
        <AffStatCard label="This Month" value={'$' + S.thisMonthRebates.toFixed(0)} icon={DollarSign} accent="#10B981" sub="rebates" />
        <AffStatCard label="Pending Payout"   value={formatMoney(S.pendingPayout)}    icon={Clock}    accent="#F59E0B" onClick={() => onNavigate('payouts')} />
        <AffStatCard label="Paid Commissions" value={formatMoney(S.paidCommissions)}  icon={Wallet}   accent="#10B981" sub="lifetime" onClick={() => onNavigate('payouts')} />
        <AffStatCard label="Active Clients"   value={S.activeClients}                 icon={Activity} accent="#10B981" sub={`of ${S.totalClients} total`} />
      </div>

      {/* Tier progress */}
      <div className="mb-6">
        <TierProgressCard onViewDetails={() => onNavigate('tiers')} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AffCard title="Monthly Net Deposits" subtitle="Last 12 months" accent="#10B981">
          <AffAreaChart data={monthlyDeps} valueKey="deposits" height={160} color="#10B981" />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>Jun '24</span>
            <span className="text-xs font-mono font-bold" style={{ color: '#10B981' }}>
              Peak: {formatMoney(Math.max(...monthlyDeps.map(d => d.deposits)))}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>May '25</span>
          </div>
        </AffCard>

        <AffCard title="Weekly Rebates" subtitle="Last 8 weeks" accent="#3B82F6">
          <AffBarChart data={weeklyRebs} valueKey="rebates" height={160} color="#3B82F6" />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>8 weeks ago</span>
            <span className="text-xs font-mono font-bold" style={{ color: '#3B82F6' }}>
              Avg: ${(weeklyRebs.reduce((s, w) => s + w.rebates, 0) / weeklyRebs.length).toFixed(0)}/week
            </span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>This week</span>
          </div>
        </AffCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AffCard title="Client Growth" subtitle="Cumulative referred clients" accent="#7C3AED">
          <AffAreaChart data={clientGrowth} valueKey="total" height={130} color="#7C3AED" />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>Jun '24</span>
            <span className="text-xs font-mono font-bold" style={{ color: '#7C3AED' }}>
              +{clientGrowth.reduce((s, c) => s + c.new, 0)} total referred
            </span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>May '25</span>
          </div>
        </AffCard>

        <AffCard title="Weekly Lots Traded" subtitle="Last 8 weeks" accent="#F59E0B">
          <AffBarChart data={weeklyLots} valueKey="lots" height={130} color="#F59E0B" />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>8 weeks ago</span>
            <span className="text-xs font-mono font-bold" style={{ color: '#F59E0B' }}>
              Avg: {(weeklyLots.reduce((s, w) => s + w.lots, 0) / weeklyLots.length).toFixed(1)} L/week
            </span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>This week</span>
          </div>
        </AffCard>
      </div>

      {/* Top clients */}
      <AffCard title="Top Performing Clients" subtitle="Ranked by rebate generated — all time"
        accent="#10B981"
        actions={
          <button onClick={() => onNavigate('clients')} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.1)' }}>
            View All →
          </button>
        }>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                {['#','Client','Country','Total Deposits','Lots','Rebate','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_CLIENTS.map((c, i) => (
                <tr key={c.id} style={{ borderTop: '1px solid var(--border-0)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-4 py-3">
                    <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold"
                      style={{ background: i < 3 ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface)', color: i < 3 ? '#10B981' : 'var(--text-3)' }}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: `hsl(${i * 40 + 200}, 60%, 50%)` }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{c.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-4)' }}>{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{c.flag} {c.country}</td>
                  <td className="px-4 py-3"><AffMoney value={c.totalDeposits} /></td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-2)' }}>{c.totalLots}</td>
                  <td className="px-4 py-3"><AffMoney value={c.totalRebate} /></td>
                  <td className="px-4 py-3"><AffBadge status={c.activityStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AffCard>
    </div>
  );
}
