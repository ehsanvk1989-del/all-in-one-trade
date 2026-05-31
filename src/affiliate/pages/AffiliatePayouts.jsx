import React from 'react';
import { Wallet, Clock, Check, DollarSign } from 'lucide-react';
import { AffStatCard, AffCard, AffDataTable, AffBadge, AffPageHeader, AffMoney } from '../affiliateUI';
import { PAYOUTS, AFFILIATE_PROFILE, formatMoney } from '../affiliateMockData';

export default function AffiliatePayouts() {
  const pendingPayout   = PAYOUTS.filter(p => p.status === 'pending').reduce((s, p) => s + p.finalAmount, 0);
  const approvedPayout  = PAYOUTS.filter(p => p.status === 'approved').reduce((s, p) => s + p.finalAmount, 0);
  const paidPayout      = PAYOUTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.finalAmount, 0);
  const nextPayout      = PAYOUTS.find(p => p.status === 'approved' || p.status === 'pending');

  const columns = [
    { key: 'id',           label: 'Payout ID',   render: r => <span className="font-mono text-xs" style={{ color: 'var(--text-4)' }}>{r.id}</span> },
    { key: 'period',       label: 'Period',       sortable: true, render: r => <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{r.period}</span> },
    { key: 'rebateAmount', label: 'Rebate',       sortable: true, render: r => <AffMoney value={r.rebateAmount} /> },
    { key: 'adjustments',  label: 'Adjustments',  sortable: true, render: r => (
        <span className="font-mono text-sm" style={{ color: r.adjustments >= 0 ? '#10B981' : '#EF4444' }}>
          {r.adjustments >= 0 ? '+' : ''}{r.adjustments.toFixed(2)}
        </span>
      )},
    { key: 'finalAmount',  label: 'Final Amount', sortable: true, render: r => <AffMoney value={r.finalAmount} /> },
    { key: 'status',       label: 'Status',       sortable: true, render: r => <AffBadge status={r.status} /> },
    { key: 'paymentDate',  label: 'Payment Date', render: r => <span className="text-xs" style={{ color: 'var(--text-3)' }}>{r.paymentDate}</span> },
  ];

  return (
    <div>
      <AffPageHeader title="Payouts" subtitle="Commission payouts from Plus Trade Partner Program" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <AffStatCard label="Pending Payout"   value={formatMoney(pendingPayout)}  icon={Clock}      accent="#F59E0B" sub="awaiting approval" />
        <AffStatCard label="Approved Payout"  value={formatMoney(approvedPayout)} icon={Check}      accent="#3B82F6" sub="processing" />
        <AffStatCard label="Total Paid"        value={formatMoney(paidPayout)}     icon={Wallet}     accent="#10B981" sub="all time" />
        <AffStatCard label="Total Commissions" value={formatMoney(pendingPayout + approvedPayout + paidPayout)} icon={DollarSign} accent="#7C3AED" />
      </div>

      {/* Next payout info */}
      {nextPayout && (
        <div className="rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#3B82F6' }}>Next Payout</div>
            <div className="text-xl font-mono font-extrabold" style={{ color: 'var(--text-1)' }}>${nextPayout.finalAmount.toFixed(2)}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Period: {nextPayout.period} · {nextPayout.paymentDate}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs" style={{ color: 'var(--text-4)' }}>Payment Method</div>
              <div className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-1)' }}>{AFFILIATE_PROFILE.paymentMethod}</div>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: 'var(--text-4)' }}>Payout Schedule</div>
              <div className="font-semibold text-sm mt-0.5" style={{ color: 'var(--text-1)' }}>Monthly</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <AffCard title="Payment Details" accent="#10B981">
          <div className="space-y-3">
            {[
              ['Payment Method', AFFILIATE_PROFILE.paymentMethod],
              ['Wallet Address', AFFILIATE_PROFILE.walletAddress.slice(0, 12) + '…' + AFFILIATE_PROFILE.walletAddress.slice(-6)],
              ['Payout Schedule', AFFILIATE_PROFILE.payoutSchedule],
              ['Commission Plan', AFFILIATE_PROFILE.commissionPlan],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-0)' }}>
                <span className="text-xs" style={{ color: 'var(--text-4)' }}>{label}</span>
                <span className="text-xs font-semibold font-mono" style={{ color: 'var(--text-2)' }}>{value}</span>
              </div>
            ))}
          </div>
        </AffCard>

        <AffCard title="Payout Summary" accent="#3B82F6">
          <div className="space-y-3">
            {[
              { label: 'Lifetime Earned',  value: formatMoney(pendingPayout + approvedPayout + paidPayout), color: '#10B981' },
              { label: 'Paid to Date',     value: formatMoney(paidPayout),    color: '#10B981' },
              { label: 'In Processing',    value: formatMoney(approvedPayout), color: '#3B82F6' },
              { label: 'Pending Review',   value: formatMoney(pendingPayout),  color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-0)' }}>
                <span className="text-xs" style={{ color: 'var(--text-4)' }}>{s.label}</span>
                <span className="text-sm font-mono font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </AffCard>
      </div>

      <AffCard title="Payout History" subtitle="All commission payouts — monthly breakdown">
        <AffDataTable columns={columns} rows={PAYOUTS} pageSize={12} />
      </AffCard>
    </div>
  );
}
