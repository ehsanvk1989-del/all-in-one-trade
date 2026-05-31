import React, { useState } from 'react';
import { User, Shield, Bell, CreditCard, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { AffCard, AffPageHeader } from '../affiliateUI';
import { AFFILIATE_PROFILE } from '../affiliateMockData';

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ width: 36, height: 20, background: value ? '#10B981' : 'var(--bg-surface)', border: `1px solid ${value ? '#10B981' : 'var(--border-1)'}` }}>
      <span className="absolute rounded-full transition-transform duration-200"
        style={{ width: 14, height: 14, top: 2, left: 2, background: value ? '#fff' : 'var(--text-4)', transform: value ? 'translateX(16px)' : 'translateX(0)' }} />
    </button>
  );
}

const TABS = [
  { id: 'profile',   label: 'Profile',          icon: User },
  { id: 'commission',label: 'Commission Plan',   icon: CreditCard },
  { id: 'payment',   label: 'Payment Method',   icon: CreditCard },
  { id: 'security',  label: 'Security',          icon: Shield },
];

export default function AffiliateProfile() {
  const [tab, setTab] = useState('profile');
  const [notifs, setNotifs] = useState({ rebates: true, payouts: true, deposits: true, weekly: false, marketing: false });
  const [twoFA, setTwoFA] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <AffPageHeader title="Profile & Settings" subtitle="Manage your affiliate account settings, commission plan and security" />

      {/* Hero card */}
      <div className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}>
          {AFFILIATE_PROFILE.name[0]}
        </div>
        <div className="flex-1">
          <div className="font-extrabold text-xl" style={{ color: 'var(--text-1)' }}>{AFFILIATE_PROFILE.name}</div>
          <div className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{AFFILIATE_PROFILE.email}</div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
              ★ {AFFILIATE_PROFILE.tier}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>Partner ID: {AFFILIATE_PROFILE.partnerId}</span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>Member since {AFFILIATE_PROFILE.registeredDate}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>Referral Code</div>
          <div className="font-mono font-black text-xl" style={{ color: '#10B981' }}>{AFFILIATE_PROFILE.referralCode}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto" style={{ borderBottom: '1px solid var(--border-0)' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative flex-shrink-0"
              style={{ color: tab === t.id ? '#10B981' : 'var(--text-3)', background: tab === t.id ? 'rgba(16,185,129,0.08)' : 'transparent', borderRadius: '8px 8px 0 0' }}>
              <Icon size={14} />{t.label}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#10B981' }} />}
            </button>
          );
        })}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AffCard title="Personal Information" accent="#10B981">
            <div className="space-y-4">
              {[
                { label: 'Full Name',   val: AFFILIATE_PROFILE.name,      editable: true },
                { label: 'Email',       val: AFFILIATE_PROFILE.email,     editable: false },
                { label: 'Partner ID',  val: AFFILIATE_PROFILE.partnerId, editable: false },
                { label: 'Member Since',val: AFFILIATE_PROFILE.registeredDate, editable: false },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>{f.label}</label>
                  <input defaultValue={f.val} disabled={!f.editable} className="input-dark text-sm w-full"
                    style={{ padding: '0.6rem 0.75rem', opacity: f.editable ? 1 : 0.6 }} />
                </div>
              ))}
              <button onClick={handleSave}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #10B981, #3B82F6)', color: saved ? '#10B981' : '#fff' }}>
                {saved ? <><Check size={14} /> Saved</> : 'Save Changes'}
              </button>
            </div>
          </AffCard>

          <AffCard title="Notification Preferences" accent="#3B82F6">
            <div className="space-y-4">
              {[
                { key: 'rebates',   label: 'Rebate Alerts',          desc: 'Notify when new rebates are credited' },
                { key: 'payouts',   label: 'Payout Notifications',    desc: 'Notify on payout approval and processing' },
                { key: 'deposits',  label: 'Client Deposit Alerts',   desc: 'Notify when a referred client deposits' },
                { key: 'weekly',    label: 'Weekly Summary',          desc: 'Receive weekly performance digest email' },
                { key: 'marketing', label: 'Marketing Updates',       desc: 'Receive promotional campaign materials' },
              ].map(n => (
                <div key={n.key} className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: '1px solid var(--border-0)' }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{n.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>{n.desc}</div>
                  </div>
                  <Toggle value={notifs[n.key]} onChange={v => setNotifs(p => ({ ...p, [n.key]: v }))} />
                </div>
              ))}
            </div>
          </AffCard>
        </div>
      )}

      {/* Commission tab */}
      {tab === 'commission' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AffCard title="Your Commission Plan" accent="#10B981">
            <div className="rounded-xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10B981' }}>Active Plan</div>
              <div className="text-2xl font-extrabold" style={{ color: 'var(--text-1)' }}>{AFFILIATE_PROFILE.commissionPlan}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Tier: {AFFILIATE_PROFILE.tier}</div>
            </div>
            <div className="space-y-2">
              {[
                { product: 'Crypto Futures',        rate: '$5.00', lots: 'Per lot traded' },
                { product: 'Forex & Commodities',   rate: '$6.00', lots: 'Per lot traded' },
                { product: 'Simple Trade',           rate: '$3.00', lots: 'Per lot traded' },
              ].map(r => (
                <div key={r.product} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{r.product}</div>
                    <div className="text-xs" style={{ color: 'var(--text-4)' }}>{r.lots}</div>
                  </div>
                  <div className="font-mono font-extrabold text-lg" style={{ color: '#10B981' }}>{r.rate}</div>
                </div>
              ))}
            </div>
          </AffCard>

          <AffCard title="Plan Details" accent="#3B82F6">
            <div className="space-y-3">
              {[
                ['Commission Type', 'Revenue Share (CPS)'],
                ['Calculation Base', 'Per lot traded by client'],
                ['Payment Currency', 'USDT'],
                ['Payout Frequency', 'Monthly'],
                ['Minimum Payout', '$50.00'],
                ['Negative Carryover', 'No'],
                ['Sub-affiliate', 'Not included'],
                ['Tier Upgrade', 'At $5,000 lifetime earnings'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-0)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-4)' }}>{label}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{value}</span>
                </div>
              ))}
            </div>
          </AffCard>
        </div>
      )}

      {/* Payment tab */}
      {tab === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AffCard title="Payment Method" accent="#10B981">
            <div className="space-y-4">
              {[
                { label: 'Payment Method', val: AFFILIATE_PROFILE.paymentMethod },
                { label: 'Wallet Network', val: 'TRC20 (TRON Network)' },
                { label: 'Payout Schedule', val: AFFILIATE_PROFILE.payoutSchedule },
                { label: 'Minimum Payout', val: '$50.00 USDT' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>{f.label}</label>
                  <input defaultValue={f.val} className="input-dark text-sm w-full" style={{ padding: '0.6rem 0.75rem' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>Wallet Address</label>
                <div className="flex gap-2">
                  <input defaultValue={AFFILIATE_PROFILE.walletAddress} className="input-dark text-sm font-mono flex-1" style={{ padding: '0.6rem 0.75rem' }} />
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-4)' }}>Changing your wallet address requires identity verification and 48h processing time.</p>
              </div>
              <button onClick={handleSave}
                className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #10B981, #3B82F6)', color: saved ? '#10B981' : '#fff' }}>
                {saved ? <><Check size={14} /> Saved</> : 'Update Payment Details'}
              </button>
            </div>
          </AffCard>

          <AffCard title="Payout History Preview" accent="#3B82F6">
            <div className="space-y-3">
              {['May 2025 — Pending $341', 'Apr 2025 — Approved $512', 'Mar 2025 — Paid $489', 'Feb 2025 — Paid $378', 'Jan 2025 — Paid $444'].map(p => {
                const [period, statusRaw] = p.split(' — ');
                const statusWord = statusRaw.split(' ')[0].toLowerCase();
                const amount = statusRaw.split(' ')[1];
                const color = statusWord === 'paid' ? '#10B981' : statusWord === 'approved' ? '#3B82F6' : '#F59E0B';
                return (
                  <div key={p} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{period}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold" style={{ color }}>{amount}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: `${color}20`, color }}>{statusWord}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </AffCard>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AffCard title="Change Password" accent="#EF4444">
            <div className="space-y-4">
              {[
                { label: 'Current Password', show: showOld, setShow: setShowOld },
                { label: 'New Password',     show: showNew, setShow: setShowNew },
                { label: 'Confirm Password', show: showNew, setShow: setShowNew },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>{f.label}</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-4)' }} />
                    <input type={f.show ? 'text' : 'password'} className="input-dark text-sm w-full"
                      style={{ padding: '0.6rem 2.5rem' }} placeholder="••••••••••" />
                    <button type="button" onClick={() => f.setShow(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>
                      {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleSave}
                className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: saved ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.9)', color: saved ? '#10B981' : '#fff' }}>
                {saved ? <><Check size={14} /> Password Updated</> : 'Update Password'}
              </button>
            </div>
          </AffCard>

          <AffCard title="Security Settings" accent="#7C3AED">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Two-Factor Authentication</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>Add an extra layer of security with an authenticator app.</div>
                  {twoFA && <div className="text-xs mt-2 font-semibold" style={{ color: '#10B981' }}>✓ 2FA Enabled</div>}
                </div>
                <Toggle value={twoFA} onChange={setTwoFA} />
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>Active Sessions</div>
                {[
                  { device: 'Chrome · Windows 11', location: 'Dubai, UAE', time: 'Now · Current session', active: true },
                  { device: 'Safari · iPhone 15', location: 'Dubai, UAE', time: '3 hours ago', active: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i === 0 ? '1px solid var(--border-0)' : 'none' }}>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{s.device}</div>
                      <div className="text-xs" style={{ color: 'var(--text-4)' }}>{s.location} · {s.time}</div>
                    </div>
                    {s.active
                      ? <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>Active</span>
                      : <button className="text-xs font-semibold" style={{ color: '#EF4444' }}>Revoke</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          </AffCard>
        </div>
      )}
    </div>
  );
}
