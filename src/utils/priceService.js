/**
 * Real-time price service.
 *
 * Crypto  → Binance public WebSocket stream (no API key required)
 * Forex   → TwelveData REST polling every 30 s (free tier, API key required)
 *
 * Usage:
 *   import { startPriceService, subscribe } from './priceService';
 *   startPriceService();
 *   const unsub = subscribe(({ prices, statuses }) => { ... });
 *   // later: unsub();
 *
 * statuses[symbol]:
 *   'connecting'  – waiting for first data
 *   'live'        – real price received
 *   'unavailable' – data source failed or API key missing
 */

// ─── Binance ──────────────────────────────────────────────────────────────────
const BINANCE_WS_URL =
  'wss://stream.binance.com:9443/stream?streams=' +
  'btcusdt@miniTicker/ethusdt@miniTicker/solusdt@miniTicker/dogeusdt@miniTicker';

// Binance stream symbol (uppercase) → our app symbols
const BINANCE_MAP = {
  BTCUSDT: ['BTC', 'BTC/USDT'],
  ETHUSDT: ['ETH', 'ETH/USDT'],
  SOLUSDT: ['SOL/USDT'],
  DOGEUSDT: ['DOGE/USDT'],
};

const CRYPTO_SYMS = Object.values(BINANCE_MAP).flat();

// ─── TwelveData ───────────────────────────────────────────────────────────────
// TwelveData query symbols → our app symbols
const TWELVEDATA_MAP = {
  'XAU/USD': ['XAU/USD', 'XAUUSD'],
  'EUR/USD': ['EUR/USD', 'EURUSD'],
  'GBP/USD': ['GBP/USD', 'GBPUSD'],
  'USD/JPY': ['USD/JPY'],
  'WTI/USD': ['OIL'],
};

const TD_QUERY = Object.keys(TWELVEDATA_MAP).join(','); // comma-separated batch
const TD_BASE = 'https://api.twelvedata.com';
const TD_KEY = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_TWELVEDATA_API_KEY || '')
  : '';

const FOREX_SYMS = Object.values(TWELVEDATA_MAP).flat();

// ─── Internal state ───────────────────────────────────────────────────────────
const _prices = {};
const _statuses = {};
const _listeners = new Set();

function _notify() {
  const snap = { prices: { ..._prices }, statuses: { ..._statuses } };
  _listeners.forEach(fn => { try { fn(snap); } catch (_) {} });
}

function _setStatuses(syms, status) {
  syms.forEach(s => { _statuses[s] = status; });
}

// ─── Binance WebSocket ────────────────────────────────────────────────────────
let _ws = null;
let _wsReconnectTimer = null;

function _connectBinance() {
  if (_ws && (_ws.readyState === WebSocket.CONNECTING || _ws.readyState === WebSocket.OPEN)) return;
  clearTimeout(_wsReconnectTimer);
  _setStatuses(CRYPTO_SYMS, 'connecting');
  _notify();

  try {
    _ws = new WebSocket(BINANCE_WS_URL);
  } catch (e) {
    _setStatuses(CRYPTO_SYMS, 'unavailable');
    _notify();
    _wsReconnectTimer = setTimeout(_connectBinance, 8000);
    return;
  }

  _ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      const data = msg.data;
      if (!data || !data.s) return;

      const appSyms = BINANCE_MAP[data.s];
      if (!appSyms) return;

      const price = parseFloat(data.c);
      if (!price || price <= 0) return;

      appSyms.forEach(s => {
        _prices[s] = price;
        _statuses[s] = 'live';
      });
      _notify();
    } catch (_) {}
  };

  _ws.onerror = () => {
    _setStatuses(CRYPTO_SYMS, 'unavailable');
    _notify();
  };

  _ws.onclose = () => {
    // Reconnect with backoff
    _wsReconnectTimer = setTimeout(_connectBinance, 4000);
  };
}

// ─── TwelveData polling ───────────────────────────────────────────────────────
let _pollInterval = null;

function _tdKeyValid() {
  return TD_KEY && TD_KEY !== 'YOUR_TWELVEDATA_KEY_HERE' && TD_KEY.trim().length > 4;
}

async function _fetchForex() {
  if (!_tdKeyValid()) {
    _setStatuses(FOREX_SYMS, 'unavailable');
    _notify();
    return;
  }

  const url = `${TD_BASE}/price?symbol=${encodeURIComponent(TD_QUERY)}&apikey=${TD_KEY}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Multiple symbols → { "EUR/USD": { price: "1.0842" }, ... }
    // Check if we got a top-level error (e.g. invalid key)
    if (json.code && json.status === 'error') {
      console.warn('[priceService] TwelveData error:', json.message);
      _setStatuses(FOREX_SYMS, 'unavailable');
      _notify();
      return;
    }

    let updated = false;
    Object.entries(json).forEach(([tdSym, val]) => {
      const appSyms = TWELVEDATA_MAP[tdSym];
      if (!appSyms) return;

      if (!val || val.status === 'error') {
        appSyms.forEach(s => { _statuses[s] = 'unavailable'; });
        return;
      }

      const price = parseFloat(val.price);
      if (isNaN(price) || price <= 0) return;

      appSyms.forEach(s => {
        _prices[s] = price;
        _statuses[s] = 'live';
        updated = true;
      });
    });

    if (updated) _notify();
  } catch (err) {
    console.warn('[priceService] TwelveData fetch failed:', err.message);
    _setStatuses(FOREX_SYMS, 'unavailable');
    _notify();
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
let _started = false;

/** Call once at app startup. Safe to call multiple times. */
export function startPriceService() {
  if (_started) return;
  _started = true;

  _setStatuses([...CRYPTO_SYMS, ...FOREX_SYMS], 'connecting');

  // Crypto: real-time WebSocket
  _connectBinance();

  // Forex: immediate fetch + poll every 30 s
  _fetchForex();
  _pollInterval = setInterval(_fetchForex, 30000);
}

/**
 * Subscribe to price/status updates.
 * @param {function} fn - called with { prices, statuses }
 * @returns {function} unsubscribe function
 */
export function subscribe(fn) {
  _listeners.add(fn);
  // Immediately deliver current state so subscribers don't wait for next tick
  fn({ prices: { ..._prices }, statuses: { ..._statuses } });
  return () => _listeners.delete(fn);
}

export const CRYPTO_SYMBOLS = CRYPTO_SYMS;
export const FOREX_SYMBOLS = FOREX_SYMS;
