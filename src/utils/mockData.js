// Mock price data and utilities for the trading platform

export const SIMPLE_TRADE_ASSETS = [
  { symbol: 'XAUUSD', name: 'Gold', basePrice: 2310.50, icon: '🥇', spread: 0.30, pip: 0.01 },
  { symbol: 'OIL', name: 'Crude Oil', basePrice: 78.45, icon: '🛢️', spread: 0.05, pip: 0.01 },
  { symbol: 'EURUSD', name: 'EUR/USD', basePrice: 1.0842, icon: '💶', spread: 0.0002, pip: 0.0001 },
  { symbol: 'GBPUSD', name: 'GBP/USD', basePrice: 1.2720, icon: '💷', spread: 0.0003, pip: 0.0001 },
  { symbol: 'BTC', name: 'Bitcoin', basePrice: 67420.00, icon: '₿', spread: 15, pip: 0.01 },
  { symbol: 'ETH', name: 'Ethereum', basePrice: 3542.80, icon: 'Ξ', spread: 2, pip: 0.01 },
];

export const CRYPTO_FUTURES_ASSETS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', basePrice: 67420.00, icon: '₿', spread: 10, pip: 0.01 },
  { symbol: 'ETH/USDT', name: 'Ethereum', basePrice: 3542.80, icon: 'Ξ', spread: 1.5, pip: 0.01 },
  { symbol: 'SOL/USDT', name: 'Solana', basePrice: 148.20, icon: '◎', spread: 0.10, pip: 0.001 },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', basePrice: 0.1523, icon: 'Ð', spread: 0.0002, pip: 0.00001 },
];

export const FOREX_ASSETS = [
  { symbol: 'XAU/USD', name: 'Gold', basePrice: 2310.50, icon: '🥇', spread: 0.30, pip: 0.01 },
  { symbol: 'EUR/USD', name: 'Euro/USD', basePrice: 1.0842, icon: '€', spread: 0.0002, pip: 0.0001 },
  { symbol: 'GBP/USD', name: 'Sterling/USD', basePrice: 1.2720, icon: '£', spread: 0.0003, pip: 0.0001 },
  { symbol: 'USD/JPY', name: 'Dollar/Yen', basePrice: 154.32, icon: '¥', spread: 0.02, pip: 0.01 },
  { symbol: 'OIL', name: 'Crude Oil', basePrice: 78.45, icon: '🛢️', spread: 0.05, pip: 0.01 },
];

export const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50, 100];
export const SIMPLE_LEVERAGE_OPTIONS = [1, 5, 10, 20];

export const MOCK_DEPOSIT_ADDRESS = 'TRx8K9mWqL4cGHdPJnBkAoZvVy3sXeR2Fj';
export const MOCK_ERC20_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f4b2c3';
export const MOCK_BEP20_ADDRESS = 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2';

export function generatePrice(basePrice, volatility = 0.002) {
  const change = (Math.random() - 0.5) * 2 * volatility;
  return basePrice * (1 + change);
}

export function formatPrice(price, decimals = 2) {
  if (price >= 1000) return price.toFixed(2);
  if (price >= 100) return price.toFixed(2);
  if (price >= 10) return price.toFixed(3);
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(5);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateCandleData(basePrice, count = 50) {
  const candles = [];
  let currentPrice = basePrice * 0.95;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const open = currentPrice;
    const volatility = basePrice * 0.008;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);

    candles.push({
      time: now - i * 3600000,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000 + 200),
    });

    currentPrice = close;
  }

  return candles;
}

export function generateOrderBook(basePrice, depth = 8) {
  const asks = [];
  const bids = [];

  for (let i = 0; i < depth; i++) {
    asks.push({
      price: (basePrice + (i + 1) * basePrice * 0.0005).toFixed(2),
      size: (Math.random() * 5 + 0.1).toFixed(3),
      total: (Math.random() * 10 + 1).toFixed(3),
    });
    bids.push({
      price: (basePrice - (i + 1) * basePrice * 0.0005).toFixed(2),
      size: (Math.random() * 5 + 0.1).toFixed(3),
      total: (Math.random() * 10 + 1).toFixed(3),
    });
  }

  return { asks, bids };
}

export function generateRecentTrades(basePrice, count = 10) {
  const trades = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = basePrice + (Math.random() - 0.5) * basePrice * 0.002;
    trades.push({
      id: i,
      time: new Date(now - i * 15000).toLocaleTimeString(),
      price: parseFloat(price.toFixed(2)),
      size: (Math.random() * 2 + 0.01).toFixed(4),
      side,
    });
  }

  return trades;
}

export const MOCK_TRANSACTIONS = [
  { id: 1, type: 'deposit', amount: 5000, currency: 'USDT', network: 'TRC20', status: 'completed', date: '2024-01-15 09:23', txHash: 'TXabc123def456...' },
  { id: 2, type: 'deposit', amount: 2000, currency: 'USDT', network: 'ERC20', status: 'completed', date: '2024-01-10 14:45', txHash: 'TXxyz789uvw012...' },
  { id: 3, type: 'withdrawal', amount: 1500, currency: 'USDT', network: 'TRC20', status: 'completed', date: '2024-01-08 11:00', txHash: 'TXlmn345opq678...' },
];
