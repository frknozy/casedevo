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

  const navLinks = [
    { href: '/', label: 'Cases' },
    { href: '/upgrade', label: 'Upgrade' },
    { href: '/battle', label: 'Case Battle' },
    { href: '/provably-fair', label: 'Provably Fair' },
  ];

  const handleDeposit = (amount: number) => {
    addBalance(amount);
    setShowDeposit(false);
    setDepositAmount('');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              <span className="text-white font-black text-sm">CH</span>
            </div>
            <span className="font-black text-xl tracking-tight">
              case<span className="gradient-text">hug</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
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
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>LIVE</span>
            </div>

            {/* Balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1.003-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.547.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472a4.265 4.265 0 01.264-.521z" />
              </svg>
              <span className="font-semibold text-sm">${balance.toFixed(2)}</span>
            </div>

            {/* Deposit button */}
            <button
              onClick={() => setShowDeposit(true)}
              className="btn-primary text-sm py-1.5 px-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Deposit
            </button>

            {/* Inventory link */}
            <Link
              href="/inventory"
              className="btn-secondary text-sm py-1.5 px-4 no-underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventory
            </Link>
          </div>
        </div>
      </header>

      {/* Deposit Modal */}
      {showDeposit && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowDeposit(false)}
        >
          <div className="card p-6 w-full max-w-md animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Deposit Funds</h2>
              <button
                onClick={() => setShowDeposit(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Select an amount to add to your balance:
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[5, 10, 20, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDeposit(amount)}
                  className="card-hover p-3 text-center rounded-lg font-semibold transition-all hover:border-orange-500"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="text-yellow-400 text-lg">${amount}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Custom amount"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => {
                  const amount = parseFloat(depositAmount);
                  if (amount > 0) handleDeposit(amount);
                }}
                className="btn-primary text-sm"
              >
                Add
              </button>
            </div>

            <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
              This is a demo site. No real money is involved.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
