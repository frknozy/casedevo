'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/store/useStore';

export default function Header() {
  const pathname = usePathname();
  const { balance, addBalance } = useStore();
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Cases', icon: '📦' },
    { href: '/upgrade', label: 'Upgrade', icon: '⬆️' },
    { href: '/battle', label: 'Case Battle', icon: '⚔️' },
    { href: '/provably-fair', label: 'Provably Fair', icon: '🔐' },
  ];

  const handleDeposit = (amount: number) => {
    addBalance(amount);
    setShowDeposit(false);
    setDepositAmount('');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" style={{ textDecoration: 'none' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm select-none"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              CH
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:block">
              case<span className="gradient-text">hug</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Live dot */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs mr-1" style={{ color: 'var(--text-muted)' }}>
              <span className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'pulse 2s infinite' }} />
              LIVE
            </div>

            {/* Balance */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <span className="text-yellow-400">$</span>
              <span>{balance.toFixed(2)}</span>
            </div>

            {/* Deposit */}
            <button onClick={() => setShowDeposit(true)} className="btn-primary text-sm py-1.5 px-3">
              + Deposit
            </button>

            {/* Inventory */}
            <Link href="/inventory" className="btn-secondary text-sm py-1.5 px-3 no-underline hidden sm:flex">
              Inventory
            </Link>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onClick={() => setMobileOpen(!mobileOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: pathname === link.href ? '#f97316' : 'var(--text-secondary)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <Link href="/inventory" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              📥 Inventory
            </Link>
          </div>
        )}
      </header>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && setShowDeposit(false)}>
          <div className="card p-6 w-full max-w-sm animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black">Deposit Funds</h2>
              <button onClick={() => setShowDeposit(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[5, 10, 20, 50, 100, 250].map(amount => (
                <button key={amount} onClick={() => handleDeposit(amount)}
                  className="py-3 rounded-xl font-bold transition-all hover:scale-105"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#f97316')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div className="text-yellow-400 text-lg">${amount}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="number" min="1" value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="Custom amount..."
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onKeyDown={e => e.key === 'Enter' && handleDeposit(parseFloat(depositAmount) || 0)}
              />
              <button onClick={() => { const a = parseFloat(depositAmount); if (a > 0) handleDeposit(a); }}
                className="btn-primary text-sm">Add</button>
            </div>

            <div className="mt-4 p-3 rounded-lg text-center text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              🎮 Demo site — no real money involved
            </div>
          </div>
        </div>
      )}
    </>
  );
}
