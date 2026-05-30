import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users as UsersIcon, Wallet, ArrowDownToLine, ArrowUpFromLine,
  Activity, Layers, BarChart3, FileText, ShieldAlert, Server, ScrollText,
  Settings as SettingsIcon, LogOut, Bell, Search, ChevronLeft, ChevronRight, ShieldCheck,
  Database,
} from 'lucide-react';
import AdminLogin from './AdminLogin';
import {
  Dashboard, UsersSection, WalletsSection, DepositsSection, WithdrawalsSection,
  TradesSection, PositionsSection, AnalyticsSection, ReportsSection, RiskSection,
  SystemSection, AuditSection, SettingsSection,
} from './AdminSections';
import MarketDataConsole from './MarketDataConsole';
import { getPlatformStats } from './adminData';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'Users & Funds',
    items: [
      { id: 'users', label: 'Users', icon: UsersIcon },
      { id: 'wallets', label: 'Wallets', icon: Wallet },
      { id: 'deposits', label: 'Deposits', icon: ArrowDownToLine },
      { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine, badge: true },
    ],
  },
  {
    title: 'Trading',
    items: [
      { id: 'trades', label: 'Trades', icon: Activity },
      { id: 'positions', label: 'Positions', icon: Layers },
      { id: 'risk', label: 'Risk Monitoring', icon: ShieldAlert },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'market', label: 'Market Data', icon: Database },
      { id: 'system', label: 'System Monitoring', icon: Server },
      { id: 'audit', label: 'Audit Logs', icon: ScrollText },
      { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
];

const SECTION_LABELS = NAV_GROUPS.flatMap(g => g.items).reduce((acc, i) => { acc[i.id] = i.label; return acc; }, {});

const S = getPlatformStats();

function AdminSidebar({ active, onNavigate, collapsed, setCollapsed, onLogout }) {
  return (
    <aside className="flex flex-col h-screen sticky top-0 transition-all duration-300 flex-shrink-0"
      style={{ width: collapsed ? 70 : 240, background: 'var(--bg-base)', borderRight: '1px solid var(--border-0)' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>
              <span className="text-white font-black text-sm">P</span>
            </div>
            <div>
              <div className="text-gradient-brand font-bold text-sm tracking-widest">PLUS TRADE</div>
              <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-4)' }}><ShieldCheck size={9} /> ADMIN</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>
            <span className="text-white font-black text-sm">P</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.title}>
            {!collapsed && <div className="text-xs font-bold uppercase tracking-widest px-2 mb-1.5" style={{ color: 'var(--text-4)' }}>{group.title}</div>}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button key={item.id} onClick={() => onNavigate(item.id)} title={collapsed ? item.label : undefined}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150 relative"
                    style={{
                      background: isActive ? 'var(--brand-bg)' : 'transparent',
                      color: isActive ? 'var(--brand-light)' : 'var(--text-3)',
                      border: `1px solid ${isActive ? 'rgba(59,130,246,0.18)' : 'transparent'}`,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-1)'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; } }}>
                    <Icon size={16} style={{ color: isActive ? 'var(--brand)' : 'var(--text-3)', flexShrink: 0 }} />
                    {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                    {item.badge && S.pendingWithdrawalsCount > 0 && (
                      <span className={`${collapsed ? 'absolute top-1 right-1' : 'ml-auto'} px-1.5 py-0.5 rounded-full text-xs font-bold`}
                        style={{ background: 'var(--warn)', color: '#000', fontSize: collapsed ? 8 : 10, minWidth: collapsed ? 6 : 'auto', lineHeight: 1 }}>
                        {collapsed ? '' : S.pendingWithdrawalsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-3" style={{ borderTop: '1px solid var(--border-0)' }}>
        <button onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors mb-1"
          style={{ color: 'var(--text-3)', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-sm">Collapse</span></>}
        </button>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--red)', justifyContent: collapsed ? 'center' : 'flex-start' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={16} />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

function AdminHeader({ section }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 gap-4"
      style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-0)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{SECTION_LABELS[section]}</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: 'var(--green-bg)', border: '1px solid rgba(30,167,116,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>Live</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
          <Search size={13} style={{ color: 'var(--text-4)' }} />
          <input placeholder="Search…" className="bg-transparent outline-none text-xs w-32" style={{ color: 'var(--text-2)' }} />
        </div>
        <span className="hidden lg:block font-mono text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)', color: 'var(--text-3)' }}>
          {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <button className="relative p-2 rounded-lg" style={{ background: 'var(--bg-surface)', color: 'var(--text-3)' }}>
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warn)' }} />
        </button>
        <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-0)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}>A</div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-1)' }}>Administrator</div>
            <div className="text-xs leading-tight" style={{ color: 'var(--text-4)' }}>admin@gmail.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('pt_admin_authed') === '1');
  const [section, setSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const handleLogin = () => { sessionStorage.setItem('pt_admin_authed', '1'); setAuthed(true); };
  const handleLogout = () => { sessionStorage.removeItem('pt_admin_authed'); setAuthed(false); };

  // Scroll to top on section change
  useEffect(() => { document.getElementById('admin-content')?.scrollTo(0, 0); }, [section]);

  if (!authed) return <AdminLogin onSuccess={handleLogin} />;

  const renderSection = () => {
    switch (section) {
      case 'dashboard':   return <Dashboard onNavigate={setSection} />;
      case 'analytics':   return <AnalyticsSection />;
      case 'reports':     return <ReportsSection />;
      case 'users':       return <UsersSection />;
      case 'wallets':     return <WalletsSection />;
      case 'deposits':    return <DepositsSection />;
      case 'withdrawals': return <WithdrawalsSection />;
      case 'trades':      return <TradesSection />;
      case 'positions':   return <PositionsSection />;
      case 'risk':        return <RiskSection />;
      case 'market':      return <MarketDataConsole />;
      case 'system':      return <SystemSection />;
      case 'audit':       return <AuditSection />;
      case 'settings':    return <SettingsSection />;
      default:            return <Dashboard onNavigate={setSection} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      <AdminSidebar active={section} onNavigate={setSection} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader section={section} />
        <main id="admin-content" className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-7xl mx-auto animate-fade-in" key={section}>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
