import React from 'react';
import {
  LayoutDashboard, Wallet, TrendingUp, BarChart3, LineChart,
  History, BookOpen, LogOut, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'positions', label: 'Open Positions', icon: BookOpen },
  { id: 'history', label: 'Trade History', icon: History },
  { divider: true },
  { id: 'simple', label: 'Simple Trade', icon: Zap, color: 'text-red-400' },
  { id: 'crypto', label: 'Crypto Futures', icon: BarChart3, color: 'text-blue-400' },
  { id: 'forex', label: 'Forex & Commodities', icon: LineChart, color: 'text-emerald-400' },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, user, logout } = useApp();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 z-30"
      style={{
        width: sidebarOpen ? '220px' : '64px',
        minWidth: sidebarOpen ? '220px' : '64px',
        background: 'rgba(10,10,10,0.97)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/5">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)' }}>
              <span className="text-black font-black text-sm">P</span>
            </div>
            <div>
              <div className="text-gold font-bold text-sm tracking-wide">PLUS TRADE</div>
              <div className="text-white/30 text-xs">Premium Platform</div>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)' }}>
            <span className="text-black font-black text-sm">P</span>
          </div>
        )}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/30 hover:text-white/70 transition-colors p-1 rounded"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapse toggle when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute -right-3 top-14 w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          if (item.divider) {
            return (
              <div key={idx} className="my-2 border-t border-white/5" />
            );
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
              <Icon size={16} className={isActive ? 'text-yellow-400' : (item.color || '')} />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="px-2 py-3 border-t border-white/5">
        {sidebarOpen && user && (
          <div className="mb-2 px-2">
            <div className="text-white/60 text-xs truncate">{user.email}</div>
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
