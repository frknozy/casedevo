'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { cases, RARITY_COLORS, Rarity } from '@/lib/data';

const TAG_STYLES: Record<string, string> = {
  HOT: 'bg-red-500/20 text-red-400 border border-red-500/40',
  NEW: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  'BEST VALUE': 'bg-green-500/20 text-green-400 border border-green-500/40',
};

const CASE_ICONS: Record<string, string> = {
  revolution: '⭐', kilowatt: '⚡', 'dreams-nightmares': '🌙',
  fracture: '💎', prisma2: '🔮', snakebite: '🐍',
  recoil: '🎯', clutch: '✊', horizon: '🌅',
};
const CASE_GRADS: Record<string, [string, string]> = {
  revolution: ['#1a0a2e', '#3d1b7a'], kilowatt: ['#0a1a2e', '#0d3b7a'],
  'dreams-nightmares': ['#1a0a2e', '#4b0d80'], fracture: ['#2e0a0a', '#7a1a1a'],
  prisma2: ['#0a2e18', '#1a7a3b'], snakebite: ['#0a2e1a', '#0d6e2d'],
  recoil: ['#1a1a2e', '#2d2d7a'], clutch: ['#2e1a0a', '#7a3b0d'],
  horizon: ['#0a1a2e', '#0d4a7a'],
};

function RarityBar({ skins }: { skins: Array<{ rarity: Rarity }> }) {
  const counts: Record<string, number> = {};
  skins.forEach(s => { counts[s.rarity] = (counts[s.rarity] || 0) + 1; });
  const total = skins.length;
  return (
    <div className="flex h-1 w-full rounded-full overflow-hidden gap-px">
      {Object.entries(counts).map(([r, n]) => (
        <div key={r} style={{ width: `${(n / total) * 100}%`, background: RARITY_COLORS[r as Rarity] }} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [priceFilter, setPriceFilter] = useState('all');

  const filtered = useMemo(() => {
    let res = [...cases];
    if (search) res = res.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (priceFilter === 'under1') res = res.filter(c => c.price < 1);
    if (priceFilter === '1-3') res = res.filter(c => c.price >= 1 && c.price < 3);
    if (priceFilter === 'over3') res = res.filter(c => c.price >= 3);
    if (sort === 'price-asc') res.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') res.sort((a, b) => b.price - a.price);
    return res;
  }, [search, sort, priceFilter]);

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative rounded-2xl p-8 mb-10 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f1b2d 0%, #1a0a2e 50%, #0f1b2d 100%)',
        border: '1px solid var(--border)',
      }}>
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle at 15% 50%, #f97316 0%, transparent 45%), radial-gradient(circle at 85% 50%, #8847ff 0%, transparent 45%)',
        }} />
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.5)', color: '#f97316' }}>
            🔥 BEST CS2 CASE OPENING
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
            Open Cases,<br />
            <span className="gradient-text">Win Skins</span>
          </h1>
          <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
            Provably fair. Instant results. Thousands of skins waiting.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a href="#cases" className="btn-primary">Open Cases Now</a>
            <Link href="/provably-fair" className="btn-secondary no-underline text-sm">How It Works</Link>
          </div>
        </div>

        {/* Floating case icons */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2 opacity-80">
          {['⭐', '⚡', '💎', '🔮', '🐍'].map((icon, i) => (
            <div key={i} className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                animationDelay: `${i * 0.4}s`,
                animation: 'float 3s ease-in-out infinite',
              }}>
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* Stats ribbon */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: '📦', label: 'Cases Opened', value: '2,418,552' },
          { icon: '💰', label: 'Skins Won', value: '$8,241,039' },
          { icon: '👥', label: 'Active Players', value: '143,892' },
        ].map(stat => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className="font-black text-lg leading-none gradient-text">{stat.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div id="cases" className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg outline-none"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="all">All Prices</option>
          <option value="under1">Under $1</option>
          <option value="1-3">$1 – $3</option>
          <option value="over3">Over $3</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          className="text-sm px-3 py-2 rounded-lg outline-none"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="default">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} case{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cases grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(c => {
          const [from, to] = CASE_GRADS[c.id] || ['#1a1a2e', '#2d2d7a'];
          const icon = CASE_ICONS[c.id] || '📦';
          const topSkins = c.skins.filter(s => s.rarity === 'extraordinary' || s.rarity === 'covert');
          return (
            <Link key={c.id} href={`/case/${c.id}`} className="case-card card group relative overflow-hidden" style={{ textDecoration: 'none' }}>
              {c.tag && (
                <div className={`absolute top-2 right-2 z-10 text-xs font-bold px-2 py-0.5 rounded-full ${TAG_STYLES[c.tag]}`}>
                  {c.tag}
                </div>
              )}

              {/* Image */}
              <div className="relative h-44 flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(circle at center, rgba(249,115,22,0.2) 0%, transparent 70%)' }} />
                {/* Case image */}
                <div className="relative z-10 animate-float w-32 h-32 flex items-center justify-center">
                  <Image src={c.image} alt={c.name} width={128} height={128} className="object-contain drop-shadow-2xl" unoptimized />
                </div>
                {/* Glow lines */}
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${RARITY_COLORS['covert']}, transparent)` }} />
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1 truncate group-hover:text-orange-400 transition-colors">
                  {c.name}
                </h3>
                <RarityBar skins={c.skins} />

                {/* Top skins */}
                <div className="mt-2 flex gap-1 flex-wrap min-h-5">
                  {topSkins.slice(0, 2).map(s => (
                    <span key={s.id} className="text-xs px-1.5 py-0.5 rounded" style={{
                      background: `${RARITY_COLORS[s.rarity]}15`,
                      color: RARITY_COLORS[s.rarity],
                      border: `1px solid ${RARITY_COLORS[s.rarity]}30`,
                      fontSize: 10,
                    }}>
                      {s.weapon}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Price</div>
                    <div className="font-black text-xl text-yellow-400">${c.price.toFixed(2)}</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: 'white' }}>
                    Open →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="font-bold text-lg mb-1">No cases found</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
        </div>
      )}

      {/* How it works */}
      <div className="mt-16">
        <h2 className="text-2xl font-black mb-2 text-center">How It Works</h2>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>Start opening in under a minute</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '💳', title: 'Deposit Funds', desc: 'Add balance using any method. Minimum $1.', color: '#f97316' },
            { icon: '📦', title: 'Choose a Case', desc: 'Pick from our selection of official CS2 cases.', color: '#8847ff' },
            { icon: '🎉', title: 'Win & Cash Out', desc: 'Open cases, win skins, sell for instant balance.', color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} className="card p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}, transparent 70%)` }} />
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="text-xs font-black tracking-widest mb-2" style={{ color: s.color }}>STEP {i + 1}</div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '🔐', label: 'Provably Fair' },
          { icon: '⚡', label: 'Instant Results' },
          { icon: '💰', label: 'Best Prices' },
          { icon: '🎮', label: '8+ Games' },
        ].map(f => (
          <div key={f.label} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{f.icon}</span>
            <span className="font-semibold text-sm">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
