import React, { useState, useEffect } from 'react';
import { Award, ChevronRight, Star, Zap, TrendingUp, DollarSign, X, CheckCircle2, Lock } from 'lucide-react';
import { AffCard, AffPageHeader } from '../affiliateUI';
import {
  TIERS, CURRENT_TIER_ID, CURRENT_MONTH_STATS,
  getCurrentTier, getNextTier, getDepositProgress, getLotsProgress, calculateEarnings,
} from '../affiliateTierConfig';

function fmt(n) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K';
  return '$' + n;
}

function ProgressBar({ pct, color, animated = true }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      <div className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: animated ? `${width}%` : `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
    </div>
  );
}

function TierModal({ tier, onClose }) {
  const currentIdx = TIERS.findIndex(t => t.id === CURRENT_TIER_ID);
  const tierIdx    = TIERS.findIndex(t => t.id === tier.id);
  const isCurrent  = tier.id === CURRENT_TIER_ID;
  const isUnlocked = tierIdx <= currentIdx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in"
        style={{ background: 'var(--bg-card)', border: `1px solid ${tier.color}40` }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: tier.bg, borderBottom: `1px solid ${tier.color}30` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: tier.glow, border: `2px solid ${tier.color}50` }}>
              <Award size={22} style={{ color: tier.color }} />
            </div>
            <div>
              <div className="text-lg font-black" style={{ color: tier.color }}>{tier.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-4)' }}>Partner Tier</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCurrent && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.color}40` }}>
                Current
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-3)' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-4)' }}>Requirements</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Monthly Deposits', value: fmt(tier.minDeposit), met: CURRENT_MONTH_STATS.monthlyDeposit >= tier.minDeposit },
              { label: 'Monthly Lots', value: tier.minLots === 0 ? 'Any' : tier.minLots + ' L', met: CURRENT_MONTH_STATS.monthlyLots >= tier.minLots },
            ].map(req => (
              <div key={req.label} className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: `1px solid ${req.met && isUnlocked ? tier.color + '30' : 'var(--border-0)'}` }}>
                <div className="text-xs" style={{ color: 'var(--text-4)' }}>{req.label}</div>
                <div className="text-sm font-bold mt-0.5 flex items-center gap-1.5">
                  <span style={{ color: 'var(--text-1)' }}>{req.value}</span>
                  {isUnlocked && (req.met
                    ? <CheckCircle2 size={13} style={{ color: tier.color }} />
                    : <Lock size={12} style={{ color: 'var(--text-4)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rates */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-4)' }}>Earnings</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Rebate Rate', value: `$${tier.rebatePerLot}/lot` },
              { label: 'Deposit Bonus', value: `${tier.bonusPct}%` },
            ].map(r => (
              <div key={r.label} className="rounded-xl p-3 text-center" style={{ background: tier.bg, border: `1px solid ${tier.color}25` }}>
                <div className="text-lg font-black font-mono" style={{ color: tier.color }}>{r.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div className="px-6 py-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-4)' }}>Included Perks</div>
          <div className="space-y-2">
            {tier.perks.map(p => (
              <div key={p} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-2)' }}>
                <CheckCircle2 size={14} style={{ color: tier.color, flexShrink: 0 }} />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TierProgressCard({ onViewDetails }) {
  const current = getCurrentTier();
  const next    = getNextTier();
  const depPct  = getDepositProgress();
  const lotsPct = getLotsProgress();

  const currentIdx = TIERS.findIndex(t => t.id === CURRENT_TIER_ID);

  return (
    <AffCard accent={current.color}
      title="Partner Tier Progress"
      subtitle={next ? `You're on track to reach ${next.label} — keep growing!` : 'You are at the highest tier!'}
      actions={
        onViewDetails && (
          <button onClick={onViewDetails}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: current.bg, color: current.color, border: `1px solid ${current.color}30` }}>
            View Program <ChevronRight size={12} />
          </button>
        )
      }>
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Current tier badge + roadmap */}
        <div className="flex items-start gap-4 flex-1">
          {/* Tier icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: current.bg, border: `2px solid ${current.color}50`, boxShadow: `0 0 20px ${current.glow}` }}>
            <Award size={26} style={{ color: current.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl font-black" style={{ color: current.color }}>{current.label}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: current.bg, color: current.color, border: `1px solid ${current.color}40` }}>
                Active
              </span>
            </div>
            <div className="text-xs mb-3" style={{ color: 'var(--text-4)' }}>
              ${current.rebatePerLot}/lot rebate · {current.bonusPct}% deposit bonus
            </div>

            {/* Mini tier roadmap */}
            <div className="flex items-center gap-1">
              {TIERS.map((t, i) => (
                <React.Fragment key={t.id}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: i <= currentIdx ? t.color : 'var(--bg-surface)',
                        border: `2px solid ${i <= currentIdx ? t.color : 'var(--border-1)'}`,
                        boxShadow: i === currentIdx ? `0 0 12px ${t.glow}` : 'none',
                      }}>
                      {i <= currentIdx
                        ? <Star size={11} fill="white" style={{ color: 'white' }} />
                        : <Lock size={10} style={{ color: 'var(--text-4)' }} />}
                    </div>
                    <span className="text-xs font-medium" style={{ color: i === currentIdx ? t.color : 'var(--text-4)', fontSize: 9 }}>{t.label}</span>
                  </div>
                  {i < TIERS.length - 1 && (
                    <div className="flex-1 h-0.5 mb-4" style={{ background: i < currentIdx ? TIERS[i + 1].color : 'var(--border-1)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        {next && (
          <div className="lg:w-72 space-y-4 border-l pl-5 flex-shrink-0" style={{ borderColor: 'var(--border-0)' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>
              Progress to {next.label}
            </div>

            {/* Deposit progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>Monthly Deposits</span>
                <span className="text-xs font-mono font-bold" style={{ color: next.color }}>
                  {fmt(CURRENT_MONTH_STATS.monthlyDeposit)} / {fmt(next.minDeposit)}
                </span>
              </div>
              <ProgressBar pct={depPct} color={next.color} />
              <div className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>
                {depPct.toFixed(0)}% — {fmt(next.minDeposit - CURRENT_MONTH_STATS.monthlyDeposit)} more needed
              </div>
            </div>

            {/* Lots progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>Monthly Lots</span>
                <span className="text-xs font-mono font-bold" style={{ color: next.color }}>
                  {CURRENT_MONTH_STATS.monthlyLots} / {next.minLots} L
                </span>
              </div>
              <ProgressBar pct={lotsPct} color={next.color} />
              <div className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>
                {lotsPct.toFixed(0)}% — {Math.max(0, next.minLots - CURRENT_MONTH_STATS.monthlyLots)} lots more needed
              </div>
            </div>

            {/* Upgrade benefit teaser */}
            <div className="rounded-xl px-3 py-2.5 flex items-center gap-2"
              style={{ background: next.bg, border: `1px solid ${next.color}25` }}>
              <Zap size={13} style={{ color: next.color, flexShrink: 0 }} />
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                Reach {next.label} → earn <span className="font-bold" style={{ color: next.color }}>${next.rebatePerLot}/lot</span> (+${next.rebatePerLot - current.rebatePerLot} more)
              </span>
            </div>
          </div>
        )}
      </div>
    </AffCard>
  );
}

function EarningsCalculator() {
  const [deposit, setDeposit] = useState(72500);
  const [lots,    setLots]    = useState(280);
  const result = calculateEarnings(deposit, lots);

  return (
    <AffCard title="Earnings Projection Calculator" subtitle="Simulate monthly earnings at different performance levels" accent="#F59E0B">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>Monthly Client Deposits</label>
              <span className="text-sm font-mono font-bold" style={{ color: '#F59E0B' }}>{fmt(deposit)}</span>
            </div>
            <input type="range" min="0" max="500000" step="5000" value={deposit}
              onChange={e => setDeposit(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#F59E0B', background: `linear-gradient(to right, #F59E0B ${deposit / 5000}%, var(--bg-surface) ${deposit / 5000}%)` }} />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-4)' }}>
              <span>$0</span><span>$250K</span><span>$500K</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>Monthly Lots Traded</label>
              <span className="text-sm font-mono font-bold" style={{ color: '#F59E0B' }}>{lots} L</span>
            </div>
            <input type="range" min="0" max="2000" step="10" value={lots}
              onChange={e => setLots(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#F59E0B', background: `linear-gradient(to right, #F59E0B ${lots / 20}%, var(--bg-surface) ${lots / 20}%)` }} />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-4)' }}>
              <span>0</span><span>1,000 L</span><span>2,000 L</span>
            </div>
          </div>

          {/* Tier unlock indicators at different deposit levels */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-4)' }}>Tier Milestones</div>
            <div className="flex gap-2 flex-wrap">
              {TIERS.map(t => {
                const unlocked = deposit >= t.minDeposit && lots >= t.minLots;
                return (
                  <div key={t.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: unlocked ? t.bg : 'var(--bg-surface)',
                      color: unlocked ? t.color : 'var(--text-4)',
                      border: `1px solid ${unlocked ? t.color + '40' : 'var(--border-0)'}`,
                    }}>
                    {unlocked ? <CheckCircle2 size={11} /> : <Lock size={11} />}
                    {t.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div className="space-y-3">
          {/* Tier */}
          <div className="rounded-2xl p-4 text-center" style={{ background: result.tier.bg, border: `2px solid ${result.tier.color}40` }}>
            <Award size={28} style={{ color: result.tier.color, margin: '0 auto 8px' }} />
            <div className="text-lg font-black" style={{ color: result.tier.color }}>{result.tier.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>Qualified tier at this level</div>
          </div>

          {/* Breakdown */}
          {[
            { label: 'Lot Rebates', value: '$' + result.rebates.toLocaleString(), color: result.tier.color, sub: `${lots} lots × $${result.tier.rebatePerLot}` },
            { label: 'Deposit Bonus', value: '$' + result.depositBonus.toLocaleString(undefined, { maximumFractionDigits: 0 }), color: '#3B82F6', sub: `${result.tier.bonusPct}% of deposits` },
          ].map(r => (
            <div key={r.label} className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.label}</span>
                <span className="text-sm font-mono font-bold" style={{ color: r.color }}>{r.value}</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{r.sub}</div>
            </div>
          ))}

          {/* Total */}
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.3)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-4)' }}>Est. Monthly Earnings</div>
            <div className="text-2xl font-black font-mono" style={{ color: '#F59E0B' }}>
              ${result.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>rebates + bonuses combined</div>
          </div>
        </div>
      </div>
    </AffCard>
  );
}

function MilestoneRoadmap({ onTierClick }) {
  const currentIdx = TIERS.findIndex(t => t.id === CURRENT_TIER_ID);

  return (
    <AffCard title="Tier Milestone Roadmap" subtitle="Your path from Beginner to Gold — click any tier to see details" accent="#7C3AED">
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 hidden lg:block" style={{ background: 'var(--border-1)' }} />

        <div className="space-y-4">
          {TIERS.map((tier, i) => {
            const isCurrent  = tier.id === CURRENT_TIER_ID;
            const isUnlocked = i <= currentIdx;
            const isNext     = i === currentIdx + 1;

            return (
              <div key={tier.id} className="relative flex items-start gap-4 pl-0 lg:pl-16 cursor-pointer group"
                onClick={() => onTierClick(tier)}>
                {/* Node on timeline */}
                <div className="hidden lg:flex absolute left-0 w-12 h-12 rounded-2xl items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{
                    background: isUnlocked ? tier.bg : 'var(--bg-surface)',
                    border: `2px solid ${isUnlocked ? tier.color : 'var(--border-1)'}`,
                    boxShadow: isCurrent ? `0 0 20px ${tier.glow}` : 'none',
                  }}>
                  {isUnlocked
                    ? <Award size={20} style={{ color: tier.color }} />
                    : <Lock size={16} style={{ color: 'var(--text-4)' }} />}
                </div>

                {/* Card */}
                <div className="flex-1 rounded-2xl p-4 transition-all group-hover:scale-[1.01]"
                  style={{
                    background: isCurrent ? tier.bg : 'var(--bg-surface)',
                    border: `1px solid ${isCurrent ? tier.color + '50' : isNext ? tier.color + '25' : 'var(--border-0)'}`,
                    boxShadow: isCurrent ? `0 4px 24px ${tier.glow}` : 'none',
                  }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Mobile icon */}
                      <div className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isUnlocked ? tier.bg : 'var(--bg-surface)', border: `2px solid ${isUnlocked ? tier.color : 'var(--border-1)'}` }}>
                        {isUnlocked ? <Award size={18} style={{ color: tier.color }} /> : <Lock size={14} style={{ color: 'var(--text-4)' }} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-black" style={{ color: isCurrent ? tier.color : 'var(--text-1)' }}>{tier.label}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: tier.color, color: 'white' }}>Current</span>
                          )}
                          {isNext && !isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.color}40` }}>Next Goal</span>
                          )}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>
                          {tier.minDeposit === 0 ? 'No deposit minimum' : `${fmt(tier.minDeposit)}+ / month`}
                          {tier.minLots > 0 ? ` · ${tier.minLots}+ lots / month` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black font-mono" style={{ color: tier.color }}>${tier.rebatePerLot}/lot</div>
                        <div className="text-xs" style={{ color: 'var(--text-4)' }}>{tier.bonusPct}% bonus</div>
                      </div>
                      <ChevronRight size={14} style={{ color: 'var(--text-4)' }} />
                    </div>
                  </div>

                  {/* Progress bar for next tier */}
                  {isNext && (
                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${tier.color}20` }}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-4)' }}>
                            <span>Deposits</span>
                            <span style={{ color: tier.color }}>{getDepositProgress().toFixed(0)}%</span>
                          </div>
                          <ProgressBar pct={getDepositProgress()} color={tier.color} />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-4)' }}>
                            <span>Lots</span>
                            <span style={{ color: tier.color }}>{getLotsProgress().toFixed(0)}%</span>
                          </div>
                          <ProgressBar pct={getLotsProgress()} color={tier.color} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AffCard>
  );
}

export default function AffiliateTierPlan() {
  const [selectedTier, setSelectedTier] = useState(null);
  const current = getCurrentTier();

  return (
    <div>
      <AffPageHeader
        title="Partner Program"
        subtitle="Your tier status, progression path, and earnings potential"
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: current.bg, color: current.color, border: `1px solid ${current.color}40` }}>
            <Award size={13} />
            {current.label} Tier
          </div>
        }
      />

      {/* Tier progress hero card */}
      <div className="mb-6">
        <TierProgressCard />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Current Rebate', value: `$${current.rebatePerLot}/lot`, icon: DollarSign, color: current.color },
          { label: 'Deposit Bonus',  value: `${current.bonusPct}%`,        icon: TrendingUp, color: current.color },
          { label: 'Monthly Deposits', value: fmt(CURRENT_MONTH_STATS.monthlyDeposit), icon: DollarSign, color: '#3B82F6' },
          { label: 'Monthly Lots',   value: `${CURRENT_MONTH_STATS.monthlyLots} L`,  icon: TrendingUp, color: '#7C3AED' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-0)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}18` }}>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                <span className="text-xs" style={{ color: 'var(--text-4)' }}>{s.label}</span>
              </div>
              <div className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Milestone roadmap */}
      <div className="mb-6">
        <MilestoneRoadmap onTierClick={setSelectedTier} />
      </div>

      {/* Earnings calculator */}
      <EarningsCalculator />

      {/* Tier detail modal */}
      {selectedTier && <TierModal tier={selectedTier} onClose={() => setSelectedTier(null)} />}
    </div>
  );
}
