'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

// Fake online count that slowly fluctuates
function useOnlineCount() {
  const [count, setCount] = useState(4097);
  useEffect(() => {
    const iv = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 7) - 3);
    }, 3000);
    return () => clearInterval(iv);
  }, []);
  return count.toLocaleString();
}

export default function Header() {
  const pathname = usePathname();
  const { balance, addBalance } = useStore();
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const onlineCount = useOnlineCount();

  useEffect(() => {
    const handler = () => setShowDeposit(true);
    window.addEventListener('open-deposit', handler);
    return () => window.removeEventListener('open-deposit', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Cases' },
    { href: '/upgrade', label: 'Upgrade' },
    { href: '/battle', label: 'Case Battle' },
    { href: '/provably-fair', label: 'Provably Fair' },
  ];

  const handleDeposit = (amount: number) => {
    if (amount <= 0) return;
    addBalance(amount);
    setShowDeposit(false);
    setDepositAmount('');
  };

  return (
    <>
      <header
        className="w-full z-50 border-b"
        style={{
          background: 'rgba(10,14,26,0.97)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" style={{ textDecoration: 'none' }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm select-none flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #dc4e0a)' }}
            >
              CH
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:block">
              case<span className="gradient-text">hug</span>
            </span>
          </Link>

          {/* Online count */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 online-pulse flex-shrink-0" />
            <span className="text-xs font-bold text-green-400 tabular-nums">{onlineCount}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>online</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Balance chip */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition-all"
              style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
              onClick={() => setShowDeposit(true)}
              title="Click to deposit"
            >
              <span className="text-yellow-400 text-base leading-none">$</span>
              <span className="text-yellow-300 tabular-nums">{balance.toFixed(2)}</span>
            </div>

            {/* Deposit CTA */}
            <button
              onClick={() => setShowDeposit(true)}
              className="btn-primary text-sm py-1.5 px-4 hidden sm:inline-flex"
            >
              + Deposit
            </button>

            {/* Inventory */}
            <Link
              href="/inventory"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventory
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t animate-slide-down"
            style={{ borderColor: 'var(--border)', background: 'rgba(10,14,26,0.98)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 online-pulse" />
              <span className="text-xs font-bold text-green-400">{onlineCount} online</span>
            </div>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-4 py-3.5 text-sm font-medium transition-colors border-b"
                style={{
                  color: pathname === link.href ? '#f97316' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  borderColor: 'var(--border)',
                  background: pathname === link.href ? 'rgba(249,115,22,0.06)' : 'transparent',
                }}
              >
                {pathname === link.href && (
                  <span className="w-1 h-4 rounded-full mr-3 flex-shrink-0" style={{ background: '#f97316' }} />
                )}
                {link.label}
              </Link>
            ))}
            <Link
              href="/inventory"
              className="flex items-center gap-2 px-4 py-3.5 text-sm font-medium"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventory
            </Link>
            <div className="px-4 py-3">
              <button onClick={() => { setShowDeposit(true); setMobileOpen(false); }}
                className="btn-primary w-full justify-center">
                + Deposit
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Deposit Modal */}
      {showDeposit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setShowDeposit(false)}
        >
          <div className="card p-6 w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black">Deposit Funds</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Select an amount or enter custom</p>
              </div>
              <button
                onClick={() => setShowDeposit(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[5, 10, 20, 50, 100, 250].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleDeposit(amount)}
                  className="py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.background = 'rgba(249,115,22,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                  }}
                >
                  <div className="text-yellow-400 text-lg">${amount}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="Custom amount…"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={e => e.key === 'Enter' && handleDeposit(parseFloat(depositAmount) || 0)}
              />
              <button
                onClick={() => handleDeposit(parseFloat(depositAmount) || 0)}
                className="btn-primary text-sm px-4"
              >
                Add
              </button>
            </div>

            <div
              className="mt-4 p-3 rounded-lg text-center text-xs"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
            >
              🎮 Demo site — no real money involved
            </div>
          </div>
        </div>
      )}
    </>
  );
}
