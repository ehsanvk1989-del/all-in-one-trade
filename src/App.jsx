import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import MainSelectionPage from './pages/MainSelectionPage';
import Dashboard from './pages/Dashboard';
import WalletPage from './pages/WalletPage';
import SimpleTrade from './pages/SimpleTrade';
import CryptoFutures from './pages/CryptoFutures';
import ForexCommodities from './pages/ForexCommodities';
import OpenPositions from './pages/OpenPositions';
import TradeHistory from './pages/TradeHistory';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

function AppContent() {
  const { user, currentPage } = useApp();

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'selection': return <MainSelectionPage />;
      case 'dashboard': return <Dashboard />;
      case 'wallet': return <WalletPage />;
      case 'simple': return <SimpleTrade />;
      case 'crypto': return <CryptoFutures />;
      case 'forex': return <ForexCommodities />;
      case 'positions': return <OpenPositions />;
      case 'history': return <TradeHistory />;
      default: return <MainSelectionPage />;
    }
  };

  // Full-screen pages (no sidebar)
  const fullScreenPages = ['crypto', 'forex'];
  const isFullScreen = fullScreenPages.includes(currentPage);

  if (isFullScreen) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          {renderPage()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {renderPage()}
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
