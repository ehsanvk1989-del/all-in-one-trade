// ─────────────────────────────────────────────────────────────────────────────
// Market Data & Pricing Console — initial configuration state.
// All values are local demo state; replace fetch calls with real API endpoints.
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_PROVIDERS = [
  {
    id: 'hfm', name: 'HFM', fullName: 'HF Markets', type: 'broker',
    enabled: true, status: 'connected',
    apiKey: 'hfm_live_k8x2p9mq4r7t', baseUrl: 'https://api.hfm.com/v2', wsUrl: 'wss://stream.hfm.com/ws',
    products: ['forex', 'simple'],
    latency: 12, uptime: 99.8, lastSeen: '2s ago', errorRate: 0.01, rateLimit: '1000/min', priority: 1,
  },
  {
    id: 'xm', name: 'XM', fullName: 'XM Group', type: 'broker',
    enabled: true, status: 'connected',
    apiKey: 'xm_api_x7k3m2n9p4', baseUrl: 'https://api.xm.com/v1', wsUrl: 'wss://feed.xm.com/ws',
    products: ['forex', 'simple'],
    latency: 18, uptime: 99.5, lastSeen: '5s ago', errorRate: 0.02, rateLimit: '800/min', priority: 2,
  },
  {
    id: 'fxpro', name: 'FxPro', fullName: 'FxPro Group', type: 'broker',
    enabled: false, status: 'disconnected',
    apiKey: '', baseUrl: 'https://api.fxpro.com/v3', wsUrl: 'wss://ws.fxpro.com',
    products: ['forex', 'simple'],
    latency: 0, uptime: 0, lastSeen: 'never', errorRate: 0, rateLimit: '600/min', priority: 3,
  },
  {
    id: 'binance', name: 'Binance', fullName: 'Binance Exchange', type: 'exchange',
    enabled: true, status: 'connected',
    apiKey: 'bn_live_9q7r2m4p8k', baseUrl: 'https://api.binance.com/api/v3', wsUrl: 'wss://stream.binance.com:9443/ws',
    products: ['crypto', 'simple'],
    latency: 8, uptime: 99.9, lastSeen: '1s ago', errorRate: 0.005, rateLimit: '1200/min', priority: 1,
  },
  {
    id: 'tradingview', name: 'TradingView', fullName: 'TradingView Data', type: 'data',
    enabled: true, status: 'connected',
    apiKey: 'tv_data_8k5x3n2m', baseUrl: 'https://data.tradingview.com/v2', wsUrl: '',
    products: ['crypto', 'forex', 'simple'],
    latency: 45, uptime: 99.2, lastSeen: '12s ago', errorRate: 0.03, rateLimit: '300/min', priority: 3,
  },
  {
    id: 'twelvedata', name: 'TwelveData', fullName: 'Twelve Data', type: 'data',
    enabled: true, status: 'connected',
    apiKey: 'td_live_7m2k9x4p', baseUrl: 'https://api.twelvedata.com', wsUrl: 'wss://ws.twelvedata.com',
    products: ['forex', 'crypto', 'simple'],
    latency: 32, uptime: 99.4, lastSeen: '8s ago', errorRate: 0.02, rateLimit: '800/day', priority: 2,
  },
  {
    id: 'finnhub', name: 'Finnhub', fullName: 'Finnhub.io', type: 'data',
    enabled: true, status: 'degraded',
    apiKey: 'fh_pub_x3k9m2p4', baseUrl: 'https://finnhub.io/api/v1', wsUrl: 'wss://ws.finnhub.io',
    products: ['forex', 'simple'],
    latency: 95, uptime: 98.1, lastSeen: '3m ago', errorRate: 0.08, rateLimit: '60/min', priority: 4,
  },
  {
    id: 'alphavantage', name: 'AlphaVantage', fullName: 'Alpha Vantage', type: 'data',
    enabled: false, status: 'disconnected',
    apiKey: '', baseUrl: 'https://www.alphavantage.co/query', wsUrl: '',
    products: ['forex', 'crypto'],
    latency: 0, uptime: 0, lastSeen: 'never', errorRate: 0, rateLimit: '500/day', priority: 5,
  },
  {
    id: 'custom', name: 'Custom', fullName: 'Custom Internal Feed', type: 'internal',
    enabled: false, status: 'disconnected',
    apiKey: '', baseUrl: '', wsUrl: '',
    products: ['crypto', 'forex', 'simple'],
    latency: 0, uptime: 0, lastSeen: 'never', errorRate: 0, rateLimit: 'unlimited', priority: 6,
  },
];

export const INITIAL_SOURCE_CONFIG = {
  crypto: { price: 'binance',     chart: 'binance',      orderBook: 'binance',     fallback: 'twelvedata' },
  forex:  { price: 'hfm',         chart: 'tradingview',  orderBook: 'hfm',         fallback: 'xm' },
  simple: { price: 'binance',     chart: 'tradingview',  orderBook: 'binance',     fallback: 'twelvedata' },
};

export const INITIAL_SYMBOLS = [
  // Crypto Futures
  { id: 'BTC/USDT',  product: 'crypto', category: 'Major',     spread: 0.02,    spreadMarkup: 0.01,    minLotSize: 0.001, maxLeverage: 100, active: true,  maintenance: false },
  { id: 'ETH/USDT',  product: 'crypto', category: 'Major',     spread: 0.03,    spreadMarkup: 0.01,    minLotSize: 0.01,  maxLeverage: 75,  active: true,  maintenance: false },
  { id: 'SOL/USDT',  product: 'crypto', category: 'Major',     spread: 0.05,    spreadMarkup: 0.02,    minLotSize: 0.1,   maxLeverage: 50,  active: true,  maintenance: false },
  { id: 'BNB/USDT',  product: 'crypto', category: 'Major',     spread: 0.04,    spreadMarkup: 0.01,    minLotSize: 0.1,   maxLeverage: 50,  active: true,  maintenance: false },
  { id: 'XRP/USDT',  product: 'crypto', category: 'Alt',       spread: 0.06,    spreadMarkup: 0.02,    minLotSize: 1,     maxLeverage: 50,  active: true,  maintenance: false },
  { id: 'DOGE/USDT', product: 'crypto', category: 'Alt',       spread: 0.08,    spreadMarkup: 0.02,    minLotSize: 10,    maxLeverage: 25,  active: true,  maintenance: false },
  { id: 'ADA/USDT',  product: 'crypto', category: 'Alt',       spread: 0.06,    spreadMarkup: 0.02,    minLotSize: 10,    maxLeverage: 25,  active: true,  maintenance: false },
  { id: 'AVAX/USDT', product: 'crypto', category: 'Alt',       spread: 0.05,    spreadMarkup: 0.02,    minLotSize: 0.1,   maxLeverage: 50,  active: false, maintenance: true  },
  { id: 'DOT/USDT',  product: 'crypto', category: 'Alt',       spread: 0.07,    spreadMarkup: 0.03,    minLotSize: 1,     maxLeverage: 25,  active: true,  maintenance: false },
  { id: 'LINK/USDT', product: 'crypto', category: 'Alt',       spread: 0.06,    spreadMarkup: 0.02,    minLotSize: 1,     maxLeverage: 25,  active: true,  maintenance: false },
  // Forex & Commodities
  { id: 'EUR/USD',   product: 'forex',  category: 'Major',     spread: 0.00010, spreadMarkup: 0.00003, minLotSize: 0.01,  maxLeverage: 500, active: true,  maintenance: false },
  { id: 'GBP/USD',   product: 'forex',  category: 'Major',     spread: 0.00014, spreadMarkup: 0.00004, minLotSize: 0.01,  maxLeverage: 500, active: true,  maintenance: false },
  { id: 'USD/JPY',   product: 'forex',  category: 'Major',     spread: 0.012,   spreadMarkup: 0.003,   minLotSize: 0.01,  maxLeverage: 500, active: true,  maintenance: false },
  { id: 'AUD/USD',   product: 'forex',  category: 'Major',     spread: 0.00015, spreadMarkup: 0.00004, minLotSize: 0.01,  maxLeverage: 500, active: true,  maintenance: false },
  { id: 'USD/CHF',   product: 'forex',  category: 'Minor',     spread: 0.00012, spreadMarkup: 0.00003, minLotSize: 0.01,  maxLeverage: 200, active: true,  maintenance: false },
  { id: 'EUR/GBP',   product: 'forex',  category: 'Minor',     spread: 0.00013, spreadMarkup: 0.00004, minLotSize: 0.01,  maxLeverage: 200, active: true,  maintenance: false },
  { id: 'USD/CAD',   product: 'forex',  category: 'Minor',     spread: 0.00016, spreadMarkup: 0.00005, minLotSize: 0.01,  maxLeverage: 200, active: true,  maintenance: false },
  { id: 'XAU/USD',   product: 'forex',  category: 'Commodity', spread: 0.25,    spreadMarkup: 0.10,    minLotSize: 0.01,  maxLeverage: 200, active: true,  maintenance: false },
  { id: 'XAG/USD',   product: 'forex',  category: 'Commodity', spread: 0.03,    spreadMarkup: 0.01,    minLotSize: 0.1,   maxLeverage: 100, active: true,  maintenance: false },
  { id: 'OIL/USD',   product: 'forex',  category: 'Commodity', spread: 0.04,    spreadMarkup: 0.02,    minLotSize: 0.1,   maxLeverage: 100, active: true,  maintenance: false },
];

export const INITIAL_CHART_CONFIG = {
  crypto: { source: 'binance',     defaultTimeframe: '1h', theme: 'dark', indicators: true,  volume: true  },
  forex:  { source: 'tradingview', defaultTimeframe: '1h', theme: 'dark', indicators: true,  volume: false },
  simple: { source: 'tradingview', defaultTimeframe: '1d', theme: 'dark', indicators: false, volume: true  },
};

export const INITIAL_FALLBACK_RULES = [
  { id: 'fb1', product: 'crypto', assetClass: 'All Crypto',  primary: 'binance', secondary: 'twelvedata',  tertiary: 'tradingview', latencyThreshold: 200, errorThreshold: 5,  autoSwitch: true  },
  { id: 'fb2', product: 'forex',  assetClass: 'Major Pairs', primary: 'hfm',     secondary: 'xm',          tertiary: 'twelvedata',  latencyThreshold: 300, errorThreshold: 5,  autoSwitch: true  },
  { id: 'fb3', product: 'forex',  assetClass: 'Commodities', primary: 'hfm',     secondary: 'xm',          tertiary: 'finnhub',     latencyThreshold: 500, errorThreshold: 10, autoSwitch: true  },
  { id: 'fb4', product: 'simple', assetClass: 'Mixed',       primary: 'binance', secondary: 'tradingview', tertiary: 'finnhub',     latencyThreshold: 500, errorThreshold: 10, autoSwitch: false },
];
