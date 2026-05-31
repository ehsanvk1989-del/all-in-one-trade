import React, { useState } from 'react';
import { Link2, Copy, Check, QrCode, TrendingUp, Users, ArrowDownToLine } from 'lucide-react';
import { AffCard, AffDataTable, AffPageHeader, AffStatCard } from '../affiliateUI';
import { CAMPAIGNS, AFFILIATE_PROFILE } from '../affiliateMockData';

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.1)',
        color: copied ? '#10B981' : '#3B82F6',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.2)'}`,
      }}>
      {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> {label}</>}
    </button>
  );
}

export default function AffiliateReferralTools() {
  const totalClicks = CAMPAIGNS.reduce((s, c) => s + c.clicks, 0);
  const totalRegs   = CAMPAIGNS.reduce((s, c) => s + c.registrations, 0);
  const totalDepositors = CAMPAIGNS.reduce((s, c) => s + c.depositors, 0);
  const totalDepAmt     = CAMPAIGNS.reduce((s, c) => s + c.depositAmount, 0);

  const columns = [
    { key: 'name',           label: 'Campaign',        sortable: true, render: r => <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{r.name}</span> },
    { key: 'link',           label: 'Link',            render: r => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono truncate" style={{ color: 'var(--text-3)', maxWidth: 200 }}>{r.link}</span>
          <CopyBtn text={r.link} label="Copy" />
        </div>
      )},
    { key: 'clicks',         label: 'Clicks',          sortable: true, render: r => <span className="font-mono text-sm">{r.clicks.toLocaleString()}</span> },
    { key: 'registrations',  label: 'Registrations',   sortable: true, render: r => <span className="font-mono text-sm">{r.registrations.toLocaleString()}</span> },
    { key: 'depositors',     label: 'Depositors',      sortable: true, render: r => <span className="font-mono text-sm">{r.depositors}</span> },
    { key: 'conversionRate', label: 'Conv. Rate',      sortable: true, render: r => (
        <span className="font-mono text-sm font-bold" style={{ color: r.conversionRate > 5 ? '#10B981' : 'var(--text-2)' }}>
          {r.conversionRate}%
        </span>
      )},
    { key: 'rebatesGenerated', label: 'Rebates',       sortable: true, render: r => (
        <span className="font-mono text-sm font-bold" style={{ color: '#10B981' }}>${r.rebatesGenerated.toLocaleString()}</span>
      )},
  ];

  return (
    <div>
      <AffPageHeader title="Referral Tools" subtitle="Manage your referral links, campaigns, and track performance" />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <AffStatCard label="Total Clicks"       value={totalClicks.toLocaleString()}   icon={TrendingUp}    accent="#3B82F6" />
        <AffStatCard label="Registrations"      value={totalRegs.toLocaleString()}     icon={Users}         accent="#7C3AED" />
        <AffStatCard label="Depositors"         value={totalDepositors}                icon={ArrowDownToLine} accent="#10B981" />
        <AffStatCard label="Conv. Rate"          value={(totalRegs / totalClicks * 100).toFixed(1) + '%'} icon={TrendingUp} accent="#F59E0B" />
      </div>

      {/* Referral link + code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AffCard title="Your Referral Link" subtitle="Share this link to refer new clients" accent="#10B981">
          <div className="rounded-xl p-4 flex items-center gap-3 mb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
            <Link2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
            <span className="text-sm font-mono flex-1 truncate" style={{ color: 'var(--text-2)' }}>{AFFILIATE_PROFILE.referralLink}</span>
            <CopyBtn text={AFFILIATE_PROFILE.referralLink} label="Copy Link" />
          </div>
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
              {AFFILIATE_PROFILE.referralCode.slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="text-xs" style={{ color: 'var(--text-4)' }}>Referral Code</div>
              <div className="font-mono font-bold text-base" style={{ color: 'var(--text-1)' }}>{AFFILIATE_PROFILE.referralCode}</div>
            </div>
            <CopyBtn text={AFFILIATE_PROFILE.referralCode} label="Copy Code" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Partner ID',   value: AFFILIATE_PROFILE.partnerId },
              { label: 'Commission',   value: AFFILIATE_PROFILE.commissionPlan },
              { label: 'Tier',         value: AFFILIATE_PROFILE.tier },
              { label: 'Max Rebate',   value: '$6/lot (Forex)' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="text-xs" style={{ color: 'var(--text-4)' }}>{s.label}</div>
                <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-1)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </AffCard>

        {/* QR Code placeholder + campaign links */}
        <div className="space-y-4">
          <AffCard title="QR Code" subtitle="Share your QR code for offline campaigns" accent="#7C3AED">
            <div className="flex flex-col items-center justify-center py-6 gap-4">
              <div className="w-36 h-36 rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{ background: 'var(--bg-surface)', border: '2px dashed var(--border-1)' }}>
                <QrCode size={48} style={{ color: 'var(--text-3)' }} />
                <span className="text-xs text-center px-4 leading-snug" style={{ color: 'var(--text-4)' }}>QR Code<br/>Preview</span>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.25)' }}>
                  Download PNG
                </button>
                <button className="px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-2)', border: '1px solid var(--border-0)' }}>
                  Download SVG
                </button>
              </div>
            </div>
          </AffCard>

          <AffCard title="Quick Campaign Links" accent="#3B82F6">
            <div className="space-y-2">
              {CAMPAIGNS.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{c.name}</span>
                  <CopyBtn text={c.link} label="Copy" />
                </div>
              ))}
            </div>
          </AffCard>
        </div>
      </div>

      {/* Campaign performance table */}
      <AffCard title="Campaign Performance" subtitle="Track clicks, registrations, deposits, and rebates per campaign" accent="#10B981">
        <AffDataTable
          columns={columns}
          rows={CAMPAIGNS}
          searchKeys={['name']}
          searchPlaceholder="Search campaigns…"
          pageSize={10}
        />
      </AffCard>

      {/* Marketing assets placeholder */}
      <AffCard title="Marketing Assets" subtitle="Download banners, logos and promotional materials" accent="#F59E0B">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { size: '728×90', label: 'Leaderboard Banner' },
            { size: '300×250', label: 'Medium Rectangle' },
            { size: '160×600', label: 'Wide Skyscraper' },
            { size: '320×50', label: 'Mobile Banner' },
          ].map(b => (
            <div key={b.size} className="rounded-xl p-4 flex flex-col items-center gap-3 text-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
              <div className="w-full h-16 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.1))', border: '1px dashed var(--border-1)' }}>
                <span className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>{b.size}</span>
              </div>
              <div className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{b.label}</div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold w-full"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                Download
              </button>
            </div>
          ))}
        </div>
      </AffCard>
    </div>
  );
}
