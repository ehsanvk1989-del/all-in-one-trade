import React from 'react';
import {
  LayoutDashboard, Wallet, TrendingUp, BarChart3, LineChart,
  History, BookOpen, LogOut, ChevronLeft, ChevronRight, Zap,
  User, Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'positions', label: 'Open Positions', icon: BookOpen },
  { id: 'history', label: 'Trade History', icon: History },
  { divider: true },
  { id: 'simple', label: 'Simple Trade', icon: Zap },
  { id: 'crypto', label: 'Crypto Futures', icon: BarChart3 },
  { id: 'forex', label: 'Forex & Commodities', icon: LineChart },
  { divider: true },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, user, logout } = useApp();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 z-30"
      style={{
        width: sidebarOpen ? '220px' : '64px',
        minWidth: sidebarOpen ? '220px' : '64px',
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border-0)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
        {sidebarOpen && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-light))' }}>
              <span className="text-white font-black text-sm">P</span>
            </div>
            <div>
              <div className="text-brand font-bold text-sm tracking-widest">PLUS TRADE</div>
              <div className="text-xs" style={{ color: 'var(--text-4)' }}>Premium Platform</div>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-light))' }}>
            <span className="text-white font-black text-sm">P</span>
          </div>
        )}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="transition-colors p-1 rounded"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapse toggle when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute -right-3 top-14 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-1)', color: 'var(--text-3)' }}
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          if (item.divider) {
            return <div key={idx} className="my-2" style={{ borderTop: '1px solid var(--border-0)' }} />;
          }

          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <div
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--brand-light)' : 'var(--text-3)' }} />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="px-2 py-3" style={{ borderTop: '1px solid var(--border-0)' }}>
        {sidebarOpen && user && (
          <div className="mb-2 px-2">
            <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{user.email}</div>
          </div>
        )}
        <div
          className="sidebar-item"
          onClick={logout}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut size={16} />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </div>
      </div>
    </aside>
  );
}
