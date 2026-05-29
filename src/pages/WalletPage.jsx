import React, { useState } from 'react';
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, Copy, CheckCircle,
  RefreshCw, ChevronDown, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, MOCK_DEPOSIT_ADDRESS, MOCK_ERC20_ADDRESS, MOCK_BEP20_ADDRESS } from '../utils/mockData';

const NETWORKS = [
  { id: 'TRC20', label: 'TRC20', chain: 'TRON', address: MOCK_DEPOSIT_ADDRESS, fee: '1 USDT', time: '~2 min' },
  { id: 'ERC20', label: 'ERC20', chain: 'Ethereum', address: MOCK_ERC20_ADDRESS, fee: '5 USDT', time: '~5 min' },
  { id: 'BEP20', label: 'BEP20', chain: 'BSC', address: MOCK_BEP20_ADDRESS, fee: '0.5 USDT', time: '~1 min' },
];

function QRCodePlaceholder({ address }) {
  // Generate a simple visual QR-like placeholder
  const cells = Array.from({ length: 11 }, (_, row) =>
    Array.from({ length: 11 }, (_, col) => {
      // Corners
      if ((row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3)) return 'dark';
      // Center data
      return Math.random() > 0.5 ? 'dark' : 'light';
    })
  );

  return (
    <div className="inline-block p-3 rounded-xl" style={{ background: '#fff' }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(11, 1fr)', gap: '2px' }}>
        {cells.map((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              className="w-4 h-4 rounded-sm"
              style={{ background: cell === 'dark' ? '#000' : '#fff' }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
      style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
    >
      {copied ? (
        <><CheckCircle size={13} className="text-green-500" /><span className="text-green-500 text-xs">Copied!</span></>
      ) : (
        <><Copy size={13} className="text-yellow-500" /><span className="text-yellow-500 text-xs">Copy</span></>
      )}
    </button>
  );
}

export default function WalletPage() {
  const { wallet, deposit, withdraw } = useApp();
  const [activeTab, setActiveTab] = useState('deposit');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState('TRC20');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const network = NETWORKS.find(n => n.id === selectedNetwork);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 10) { setErrorMsg('Minimum deposit is 10 USDT'); return; }
    setIsProcessing(true);
    setErrorMsg('');
    await new Promise(r => setTimeout(r, 1500));
    deposit(amount);
    setSuccessMsg(`Successfully deposited ${amount} USDT`);
    setDepositAmount('');
    setIsProcessing(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 10) { setErrorMsg('Minimum withdrawal is 10 USDT'); return; }
    if (amount > wallet.usdt) { setErrorMsg('Insufficient balance'); return; }
    if (!withdrawAddress || withdrawAddress.length < 20) { setErrorMsg('Invalid withdrawal address'); return; }
    setIsProcessing(true);
    setErrorMsg('');
    await new Promise(r => setTimeout(r, 1500));
    withdraw(amount);
    setSuccessMsg(`Withdrawal of ${amount} USDT initiated`);
    setWithdrawAmount('');
    setWithdrawAddress('');
    setIsProcessing(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const QUICK_AMOUNTS = [100, 500, 1000, 5000];

  return (
    <div className="flex-1 overflow-y-auto p-5 animate-fade-in">
      {/* Balance card */}
      <div className="relative rounded-2xl p-6 mb-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(26,26,26,0.98), rgba(17,17,17,0.98))',
          border: '1px solid rgba(201,168,76,0.15)',
          boxShadow: '0 0 40px rgba(201,168,76,0.05)',
        }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-5"
          style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={14} className="text-yellow-500" />
              <span className="text-white/40 text-xs uppercase tracking-wider">Total Wallet Balance</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold font-mono text-gradient-gold">
                {formatCurrency(wallet.usdt)}
              </span>
              <span className="text-yellow-500 font-bold text-lg mb-1">USDT</span>
            </div>
            <div className="text-white/30 text-sm mt-1">≈ ${formatCurrency(wallet.usdt)} USD</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('deposit')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: activeTab === 'deposit' ? 'linear-gradient(135deg, #9a7a35, #c9a84c)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'deposit' ? '#000' : '#fff',
              }}
            >
              <ArrowDownCircle size={16} />
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: activeTab === 'withdraw' ? 'rgba(230,57,70,0.9)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
              }}
            >
              <ArrowUpCircle size={16} />
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left panel: Deposit / Withdraw form */}
        <div className="card-premium rounded-xl p-5">
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-5">
            <div className={`nav-tab ${activeTab === 'deposit' ? 'active' : ''}`} onClick={() => setActiveTab('deposit')}>
              Deposit
            </div>
            <div className={`nav-tab ${activeTab === 'withdraw' ? 'active' : ''}`} onClick={() => setActiveTab('withdraw')}>
              Withdraw
            </div>
          </div>

          {/* Success/Error messages */}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
              style={{ background: 'var(--green-bg)', border: '1px solid rgba(30,167,116,0.3)' }}>
              <CheckCircle size={14} style={{ color: 'var(--green)' }} />
              <span className="text-sm" style={{ color: 'var(--green)' }}>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
              style={{ background: 'var(--red-bg)', border: '1px solid rgba(212,67,51,0.3)' }}>
              <AlertCircle size={14} style={{ color: 'var(--red)' }} />
              <span className="text-sm" style={{ color: 'var(--red)' }}>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'deposit' ? (
            <div className="space-y-4">
              {/* Network selector */}
              <div>
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 block">Network</label>
                <div className="grid grid-cols-3 gap-2">
                  {NETWORKS.map(n => (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNetwork(n.id)}
                      className="py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: selectedNetwork === n.id ? 'rgba(201,168,76,0.10)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedNetwork === n.id ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        color: selectedNetwork === n.id ? '#c9a84c' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {n.id}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-white/30">
                  <span>Chain: {network?.chain}</span>
                  <span>Fee: {network?.fee}</span>
                  <span>Time: {network?.time}</span>
                </div>
              </div>

              {/* Deposit address */}
              <div>
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 block">
                  USDT Deposit Address
                </label>
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="font-mono text-xs text-white/60 flex-1 truncate">
                    {network?.address}
                  </div>
                  <CopyButton text={network?.address || ''} />
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center py-2">
                <QRCodePlaceholder address={network?.address || ''} />
              </div>

              {/* Amount */}
              <div>
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={e => { setDepositAmount(e.target.value); setErrorMsg(''); }}
                  placeholder="Enter amount..."
                  className="input-dark"
                />
                <div className="flex gap-2 mt-2">
                  {QUICK_AMOUNTS.map(a => (
                    <button
                      key={a}
                      onClick={() => setDepositAmount(a.toString())}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      ${a}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDeposit}
                disabled={isProcessing}
                className="btn-gold w-full py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><RefreshCw size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <><ArrowDownCircle size={16} /> Confirm Deposit</>
                )}
              </button>

              <p className="text-white/20 text-xs text-center">
                Demo platform only. No real funds will be transferred.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Network selector */}
              <div>
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 block">Network</label>
                <div className="grid grid-cols-3 gap-2">
                  {NETWORKS.map(n => (
                    <button
                      key={n.id}
                      onClick={() => setWithdrawNetwork(n.id)}
                      className="py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: withdrawNetwork === n.id ? 'rgba(201,168,76,0.10)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${withdrawNetwork === n.id ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        color: withdrawNetwork === n.id ? '#c9a84c' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {n.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Withdrawal Address
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={e => { setWithdrawAddress(e.target.value); setErrorMsg(''); }}
                  placeholder="Enter USDT address..."
                  className="input-dark font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => { setWithdrawAmount(e.target.value); setErrorMsg(''); }}
                  placeholder="Enter amount..."
                  className="input-dark"
                />
                <div className="flex justify-between text-xs mt-1.5">
                  <span className="text-white/30">Available: {formatCurrency(wallet.usdt)} USDT</span>
                  <button
                    className="text-yellow-500 hover:underline"
                    onClick={() => setWithdrawAmount(wallet.usdt.toFixed(2))}
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg flex items-start gap-2"
                style={{ background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.15)' }}>
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-white/40">
                  Withdrawal fee: {NETWORKS.find(n => n.id === withdrawNetwork)?.fee}.
                  Demo platform — no real transactions.
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={isProcessing}
                className="btn-sell w-full py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><RefreshCw size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <><ArrowUpCircle size={16} /> Confirm Withdrawal</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right panel: Transaction history */}
        <div className="card-premium rounded-xl p-5">
          <div className="text-white font-semibold mb-4">Transaction History</div>

          {wallet.transactions.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-8">No transactions yet</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {wallet.transactions.map((tx, i) => (
                <div key={tx.id || i}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: tx.type === 'deposit' ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                    {tx.type === 'deposit'
                      ? <ArrowDownCircle size={16} style={{ color: 'var(--green)' }} />
                      : <ArrowUpCircle size={16} style={{ color: 'var(--red)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-1)' }}>{tx.type}</span>
                      <span className="badge-gold text-xs">{tx.network}</span>
                    </div>
                    <div className="text-xs font-mono truncate mt-0.5" style={{ color: 'var(--text-3)' }}>{tx.txHash}</div>
                    <div className="text-xs" style={{ color: 'var(--text-4)' }}>{tx.date}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-sm" style={{ color: tx.type === 'deposit' ? 'var(--green)' : 'var(--red)' }}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)} USDT
                    </div>
                    <div className="text-xs" style={{ color: tx.status === 'completed' ? 'var(--green)' : 'var(--gold)' }}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
