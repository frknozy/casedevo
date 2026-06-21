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
  return new Intl.NumberFormat('en-US').format(count);
}

export default function Header() {
  const pathname = usePathname();
  const { balance, currentUser, currentUserId, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const onlineCount = useOnlineCount();
  const isAdmin = currentUser?.role === 'admin';

  const navLinks = [
    { href: '/', label: 'Kasalar' },
    { href: '/upgrade', label: 'Yükselt' },
    { href: '/battle', label: 'Kasa Savaşı' },
    { href: '/provably-fair', label: 'Provably Fair' },
    { href: currentUser ? '/profile' : '/account', label: currentUser ? 'Profil' : 'Hesap' },
  ];

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
              className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-orange-500/20"
              style={{ background: 'linear-gradient(135deg, #ff7a18 0%, #f43f5e 54%, #7c3aed 100%)' }}
            >
              <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/24 blur-sm" />
              <span className="relative flex h-full w-full items-center justify-center text-sm font-black text-white">
                CD
              </span>
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:block">
              case<span className="gradient-text">devo</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 online-pulse flex-shrink-0" />
              <span className="text-xs font-bold text-green-400 tabular-nums">{onlineCount}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>çevrimiçi</span>
            </div>

            <Link
              href="/#promos"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                textDecoration: 'none',
                color: '#bef264',
                background: 'rgba(190,242,100,0.08)',
                border: '1px solid rgba(190,242,100,0.22)',
              }}
            >
              <span>🎁</span>
              Günlük Bonus
            </Link>
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
            {currentUser && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
                title="Mevcut bakiye"
              >
                <span className="text-yellow-400 text-base leading-none">$</span>
                <span className="text-yellow-300 tabular-nums">{balance.toFixed(2)}</span>
              </div>
            )}

            {currentUser && (
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
                Envanter
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.32)',
                  color: '#fb923c',
                  textDecoration: 'none',
                }}
              >
                Admin
              </Link>
            )}

            {currentUser ? (
              <button
                onClick={logout}
                className="hidden lg:inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                title={`${currentUser.username} hesabından çık`}
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                  style={{ background: currentUser.avatarColor }}
                >
                  {currentUser.username[0]?.toUpperCase()}
                </span>
                Çıkış
              </button>
            ) : (
              <Link
                href="/account"
                className="hidden lg:inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                Giriş
              </Link>
            )}

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
              <span className="text-xs font-bold text-green-400">{onlineCount} çevrimiçi</span>
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
                onClick={() => setMobileOpen(false)}
              >
                {pathname === link.href && (
                  <span className="w-1 h-4 rounded-full mr-3 flex-shrink-0" style={{ background: '#f97316' }} />
                )}
                {link.label}
              </Link>
            ))}
            {currentUser && (
              <Link
                href="/inventory"
                className="flex items-center gap-2 px-4 py-3.5 text-sm font-medium"
                style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                onClick={() => setMobileOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Envanter
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-3.5 text-sm font-medium"
                style={{ color: '#fb923c', textDecoration: 'none' }}
                onClick={() => setMobileOpen(false)}
              >
                Admin
              </Link>
            )}
            {currentUser ? (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="mx-4 mb-2 rounded-lg px-4 py-3 text-left text-sm font-semibold"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {currentUser.username} hesabından çık
              </button>
            ) : (
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-3.5 text-sm font-medium"
                style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                onClick={() => setMobileOpen(false)}
              >
                Giriş / Kayıt
              </Link>
            )}
            {currentUser && (
              <div className="mx-4 mb-3 rounded-lg px-4 py-3 text-sm font-bold text-yellow-300"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                Bakiye: ${balance.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
