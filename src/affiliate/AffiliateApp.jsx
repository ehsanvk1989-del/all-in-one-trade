import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ArrowDownToLine, DollarSign, BarChart3,
  Wallet, FileText, Link2, Settings, LogOut, Bell, ChevronLeft,
  ChevronRight, TrendingUp, Award, Sun, Moon,
} from 'lucide-react';
import AffiliateLogin from './AffiliateLogin';
import AffiliateDashboard    from './pages/AffiliateDashboard';
import AffiliateClients      from './pages/AffiliateClients';
import AffiliateDeposits     from './pages/AffiliateDeposits';
import AffiliateRebates      from './pages/AffiliateRebates';
import AffiliateLots         from './pages/AffiliateLots';
import AffiliatePayouts      from './pages/AffiliatePayouts';
import AffiliateReports      from './pages/AffiliateReports';
import AffiliateReferralTools from './pages/AffiliateReferralTools';
import AffiliateProfile      from './pages/AffiliateProfile';
import AffiliateTierPlan     from './pages/AffiliateTierPlan';
import { AFFILIATE_PROFILE, getAffiliateSummary } from './affiliateMockData';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard',        icon: LayoutDashboard },
      { id: 'reports',   label: 'Reports',          icon: FileText },
    ],
  },
  {
    title: 'Clients & Volume',
    items: [
      { id: 'clients',  label: 'Referred Clients',  icon: Users },
      { id: 'deposits', label: 'Deposits',          icon: ArrowDownToLine },
      { id: 'lots',     label: 'Trading Volume',    icon: BarChart3 },
    ],
  },
  {
    title: 'Earnings',
    items: [
      { id: 'rebates',  label: 'Rebates',           icon: DollarSign },
      { id: 'payouts',  label: 'Payouts',           icon: Wallet },
    ],
  },
  {
    title: 'Growth',
    items: [
      { id: 'tools',   label: 'Referral Tools',     icon: Link2 },
      { id: 'tiers',   label: 'Partner Program',    icon: Award },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile & Settings', icon: Settings },
    ],
  },
];

const LABELS = NAV_GROUPS.flatMap(g => g.items).reduce((acc, i) => { acc[i.id] = i.label; return acc; }, {});
const S = getAffiliateSummary();

function AffiliateSidebar({ active, onNavigate, collapsed, setCollapsed, onLogout, theme }) {
  const isLight = theme === 'light';
  return (
    <aside className="flex flex-col h-screen sticky top-0 transition-all duration-300 flex-shrink-0"
      style={{ width: collapsed ? 70 : 250, background: 'var(--bg-base)', borderRight: '1px solid var(--border-0)' }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}>
              <span className="text-white font-black text-sm">P</span>
            </div>
            <div>
              <div className="font-bold text-sm tracking-widest"
                style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PLUS TRADE
              </div>
              <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-4)' }}>
                <TrendingUp size={9} /> PARTNER PORTAL
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}>
            <span className="text-white font-black text-sm">P</span>
          </div>
        )}
      </div>

      {/* Affiliate info strip */}
      {!collapsed && (
        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-0)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
            style={{ background: isLight ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.06)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}>
              {AFFILIATE_PROFILE.name[0]}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-1)' }}>{AFFILIATE_PROFILE.name}</div>
              <div className="text-xs truncate" style={{ color: '#10B981' }}>{AFFILIATE_PROFILE.tier}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.title}>
            {!collapsed && (
              <div className="text-xs font-bold uppercase tracking-widest px-2 mb-1.5"
                style={{ color: 'var(--text-4)' }}>{group.title}</div>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button key={item.id} onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150"
                    style={{
                      background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
                      color: isActive ? '#10B981' : 'var(--text-3)',
                      border: `1px solid ${isActive ? 'rgba(16,185,129,0.25)' : 'transparent'}`,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = isLight ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = 'var(--text-1)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-3)';
                      }
                    }}>
                    <Icon size={16} style={{ color: isActive ? '#10B981' : 'var(--text-3)', flexShrink: 0 }} />
                    {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-0)' }}>
        <button onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors mb-1"
          style={{ color: 'var(--text-3)', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-sm">Collapse</span></>}
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-4)', justifyContent: collapsed ? 'center' : 'flex-start' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#EF4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}>
          <LogOut size={16} />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

function AffiliateHeader({ section, onNavigate, theme, onToggleTheme }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const isLight = theme === 'light';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 gap-4 flex-shrink-0"
      style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-0)', backdropFilter: 'blur(20px)' }}>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{LABELS[section]}</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
          <span className="text-xs font-medium" style={{ color: '#10B981' }}>Live</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick stats */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
          <div className="text-center">
            <div className="text-xs font-mono font-bold" style={{ color: '#10B981' }}>${S.thisMonthRebates.toFixed(0)}</div>
            <div className="text-xs" style={{ color: 'var(--text-4)', fontSize: 10 }}>Month Rebates</div>
          </div>
          <div className="h-6 w-px" style={{ background: 'var(--border-0)' }} />
          <div className="text-center">
            <div className="text-xs font-mono font-bold" style={{ color: '#3B82F6' }}>{S.activeClients}</div>
            <div className="text-xs" style={{ color: 'var(--text-4)', fontSize: 10 }}>Active Clients</div>
          </div>
        </div>

        <span className="hidden lg:block font-mono text-xs px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-3)' }}>
          {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>

        {/* Theme toggle */}
        <button onClick={onToggleTheme} title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="relative p-2 rounded-lg transition-all duration-200"
          style={{
            background: isLight ? 'rgba(16,185,129,0.09)' : 'var(--bg-surface)',
            border: `1px solid ${isLight ? 'rgba(16,185,129,0.25)' : 'var(--border-0)'}`,
            color: isLight ? '#10B981' : 'var(--text-3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; e.currentTarget.style.color = '#10B981'; }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = isLight ? 'rgba(16,185,129,0.25)' : 'var(--border-0)';
            e.currentTarget.style.color = isLight ? '#10B981' : 'var(--text-3)';
          }}>
          {isLight ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        <button className="relative p-2 rounded-lg"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-3)' }}>
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
        </button>

        <button onClick={() => onNavigate('profile')}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl transition-colors"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-0)'}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
            style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}>
            {AFFILIATE_PROFILE.name[0]}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-1)' }}>{AFFILIATE_PROFILE.name}</div>
            <div className="text-xs leading-tight" style={{ color: '#10B981' }}>{AFFILIATE_PROFILE.tier}</div>
          </div>
        </button>
      </div>
    </header>
  );
}

export default function AffiliateApp() {
  const [authed, setAuthed]       = useState(() => sessionStorage.getItem('pt_affiliate_authed') === '1');
  const [section, setSection]     = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme]         = useState(() => localStorage.getItem('pt_affiliate_theme') || 'dark');

  const handleLogin  = () => { sessionStorage.setItem('pt_affiliate_authed', '1'); setAuthed(true); };
  const handleLogout = () => { sessionStorage.removeItem('pt_affiliate_authed'); setAuthed(false); };
  const toggleTheme  = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pt_affiliate_theme', next);
  };

  useEffect(() => { document.getElementById('affiliate-content')?.scrollTo(0, 0); }, [section]);

  if (!authed) return <AffiliateLogin onSuccess={handleLogin} />;

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <AffiliateDashboard onNavigate={setSection} />;
      case 'clients':   return <AffiliateClients />;
      case 'deposits':  return <AffiliateDeposits />;
      case 'rebates':   return <AffiliateRebates />;
      case 'lots':      return <AffiliateLots />;
      case 'payouts':   return <AffiliatePayouts />;
      case 'reports':   return <AffiliateReports />;
      case 'tools':     return <AffiliateReferralTools />;
      case 'tiers':     return <AffiliateTierPlan />;
      case 'profile':   return <AffiliateProfile />;
      default:          return <AffiliateDashboard onNavigate={setSection} />;
    }
  };

  return (
    <div data-affiliate-theme={theme} className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-deep)' }}>
      <AffiliateSidebar
        active={section} onNavigate={setSection}
        collapsed={collapsed} setCollapsed={setCollapsed}
        onLogout={handleLogout} theme={theme}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AffiliateHeader
          section={section} onNavigate={setSection}
          theme={theme} onToggleTheme={toggleTheme}
        />
        <main id="affiliate-content" className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-7xl mx-auto animate-fade-in" key={section}>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
