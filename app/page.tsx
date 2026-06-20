'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { cases, RARITY_COLORS, Rarity } from '@/lib/data';

const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  HOT:         { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.4)' },
  NEW:         { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.4)' },
  'BEST VALUE':{ bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.4)' },
};

const CASE_GRADS: Record<string, [string, string]> = {
  revolution:          ['#1a0a2e', '#3d1b7a'],
  kilowatt:            ['#0a1a2e', '#0d3b7a'],
  'dreams-nightmares': ['#1a0a2e', '#4b0d80'],
  fracture:            ['#2e0a0a', '#7a1a1a'],
  prisma2:             ['#0a2e18', '#1a7a3b'],
  snakebite:           ['#0a2e1a', '#0d6e2d'],
  recoil:              ['#1a1a2e', '#2d2d7a'],
  clutch:              ['#2e1a0a', '#7a3b0d'],
  horizon:             ['#0a1a2e', '#0d4a7a'],
};

function RarityBar({ skins }: { skins: Array<{ rarity: Rarity }> }) {
  const counts: Record<string, number> = {};
  skins.forEach(s => { counts[s.rarity] = (counts[s.rarity] || 0) + 1; });
  const total = skins.length;
  const order: Rarity[] = ['extraordinary','covert','classified','restricted','milspec','industrial','consumer'];
  return (
    <div className="flex h-1 w-full rounded-full overflow-hidden gap-px">
      {order.filter(r => counts[r]).map(r => (
        <div
          key={r}
          style={{ width: `${(counts[r] / total) * 100}%`, background: RARITY_COLORS[r] }}
        />
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
    if (priceFilter === '1-3')    res = res.filter(c => c.price >= 1 && c.price < 3);
    if (priceFilter === 'over3')  res = res.filter(c => c.price >= 3);
    if (sort === 'price-asc')  res.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') res.sort((a, b) => b.price - a.price);
    return res;
  }, [search, sort, priceFilter]);

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">

      {/* ── Hero ── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8"
        style={{
          background: 'linear-gradient(135deg, #0c1526 0%, #16082a 40%, #0c1526 100%)',
          border: '1px solid var(--border)',
          minHeight: 200,
        }}
      >
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage:
              'radial-gradient(ellipse 50% 70% at 10% 50%, rgba(249,115,22,0.18) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 70% at 90% 50%, rgba(136,71,255,0.18) 0%, transparent 60%)',
          }} />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative z-10 flex items-center justify-between px-8 py-10 gap-6">
          <div className="max-w-md">
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(249,115,22,0.15)',
                border: '1px solid rgba(249,115,22,0.4)',
                color: '#fb923c',
              }}
            >
              🔥 BEST CS2 CASE OPENING
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 leading-[1.1]">
              Open Cases,<br />
              <span className="gradient-text">Win Skins</span>
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Provably fair · Instant results · Thousands of skins waiting
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a href="#cases" className="btn-primary">Open Cases Now</a>
              <Link href="/provably-fair" className="btn-secondary no-underline text-sm" style={{ textDecoration: 'none' }}>
                How It Works
              </Link>
            </div>
          </div>

          {/* Floating case preview */}
          <div className="hidden lg:flex flex-col gap-3">
            {cases.slice(0, 3).map((c, i) => (
              <div
                key={c.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  animationDelay: `${i * 0.4}s`,
                  animation: 'float 3s ease-in-out infinite',
                }}
              >
                <Image src={c.image} alt={c.name} width={36} height={36} className="object-contain" unoptimized />
                <div>
                  <div className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                  <div className="text-xs font-black text-yellow-400">${c.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="relative z-10 border-t grid grid-cols-3 divide-x"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {[
            { icon: '📦', label: 'Cases Opened', value: '2,418,552' },
            { icon: '💰', label: 'Skins Won',    value: '$8,241,039' },
            { icon: '👥', label: 'Active Players', value: '143,892' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2.5 px-6 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-xl flex-shrink-0">{stat.icon}</span>
              <div>
                <div className="font-black text-base gradient-text stat-value">{stat.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div id="cases" className="mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search — takes available space */}
          <div className="relative" style={{ minWidth: 220, flex: '1 1 220px', maxWidth: 400 }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cases…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Price filter */}
          <select
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="text-sm px-3 py-2.5 rounded-xl outline-none flex-shrink-0"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Prices</option>
            <option value="under1">Under $1</option>
            <option value="1-3">$1 – $3</option>
            <option value="over3">Over $3</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            className="text-sm px-3 py-2.5 rounded-xl outline-none flex-shrink-0"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="default">Default Order</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>

          <span className="text-sm font-semibold ml-auto flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} case{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Case Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(c => {
          const [from, to] = CASE_GRADS[c.id] || ['#1a1a2e', '#2d2d7a'];
          const topSkins = c.skins.filter(s => s.rarity === 'extraordinary' || s.rarity === 'covert');
          const tag = c.tag ? TAG_STYLES[c.tag] : null;

          return (
            <Link
              key={c.id}
              href={`/case/${c.id}`}
              className="case-card group relative overflow-hidden rounded-xl flex flex-col"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
              }}
            >
              {/* Tag */}
              {tag && (
                <div
                  className="absolute top-2.5 right-2.5 z-10 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}
                >
                  {c.tag}
                </div>
              )}

              {/* Case image area */}
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  height: 168,
                  background: `linear-gradient(145deg, ${from} 0%, ${to} 100%)`,
                }}
              >
                {/* Hover radial glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at center, rgba(249,115,22,0.22) 0%, transparent 70%)' }}
                />

                {/* Case image */}
                <div className="relative z-10 animate-float">
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={130}
                    height={130}
                    className="object-contain drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
                    unoptimized
                  />
                </div>

                {/* Bottom rarity line */}
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                  background: `linear-gradient(90deg, transparent, ${RARITY_COLORS['covert']}60, transparent)`,
                }} />
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-sm mb-1.5 truncate group-hover:text-orange-400 transition-colors">
                  {c.name}
                </h3>

                <RarityBar skins={c.skins} />

                {/* Top skin badges */}
                <div className="mt-2 flex gap-1 flex-wrap min-h-[18px]">
                  {topSkins.slice(0, 2).map(s => (
                    <span
                      key={s.id}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: `${RARITY_COLORS[s.rarity]}12`,
                        color: RARITY_COLORS[s.rarity],
                        border: `1px solid ${RARITY_COLORS[s.rarity]}28`,
                        fontSize: 9,
                        fontWeight: 700,
                      }}
                    >
                      {s.weapon}
                    </span>
                  ))}
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between mt-auto pt-3">
                  <span className="font-black text-xl text-yellow-400">${c.price.toFixed(2)}</span>
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-bold transition-all translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: 'white' }}
                  >
                    Open →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-16 text-center mt-4">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-bold text-lg mb-1">No cases found</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
        </div>
      )}

      {/* ── How it works ── */}
      <div className="mt-16">
        <h2 className="text-2xl font-black mb-1 text-center">How It Works</h2>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
          Start opening in under a minute
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '💳', title: 'Deposit Funds',   desc: 'Add balance instantly. No minimums, no fees.',         color: '#f97316' },
            { icon: '📦', title: 'Choose a Case',   desc: 'Pick from official CS2 cases with real item pools.',   color: '#8847ff' },
            { icon: '🎉', title: 'Win & Cash Out',  desc: 'Open cases, win skins, sell directly for balance.',    color: '#22c55e' },
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

      {/* ── Trust badges ── */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '🔐', label: 'Provably Fair' },
          { icon: '⚡', label: 'Instant Results' },
          { icon: '💰', label: 'Best Prices' },
          { icon: '🎮', label: 'CS2 Official Cases' },
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
