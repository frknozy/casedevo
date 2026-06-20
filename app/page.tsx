'use client';
import Link from 'next/link';
import { cases } from '@/lib/data';
import { RARITY_COLORS, Rarity } from '@/lib/data';

const TAG_STYLES: Record<string, string> = {
  HOT: 'bg-red-500/20 text-red-400 border border-red-500/30',
  NEW: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'BEST VALUE': 'bg-green-500/20 text-green-400 border border-green-500/30',
};

function CaseRarityBar({ rarities }: { rarities: Rarity[] }) {
  const counts: Record<string, number> = {};
  rarities.forEach((r) => { counts[r] = (counts[r] || 0) + 1; });
  const total = rarities.length;
  const entries = Object.entries(counts);

  return (
    <div className="flex h-1 w-full rounded-full overflow-hidden mt-2">
      {entries.map(([rarity, count]) => (
        <div
          key={rarity}
          style={{
            width: `${(count / total) * 100}%`,
            background: RARITY_COLORS[rarity as Rarity],
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      {/* Hero banner */}
      <div
        className="relative rounded-2xl p-8 mb-10 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f1b2d 0%, #1a0a2e 50%, #0f1b2d 100%)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8847ff 0%, transparent 50%)',
        }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)', color: '#f97316' }}>
            🔥 HOT THIS WEEK
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Open CS2 Cases,
            <br />
            <span className="gradient-text">Win Rare Skins</span>
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            The fairest case opening experience. Provably fair &amp; instant payouts.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="#cases" className="btn-primary">
              Open Cases Now
            </Link>
            <Link href="/provably-fair" className="btn-secondary">
              How it Works
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {[
            { label: 'Cases Opened', value: '2.4M+' },
            { label: 'Skins Won', value: '$8.2M+' },
            { label: 'Players', value: '143K+' },
          ].map((stat) => (
            <div key={stat.label} className="text-right">
              <div className="text-2xl font-black gradient-text">{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cases grid */}
      <div id="cases">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Available Cases</h2>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {cases.length} cases available
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/case/${c.id}`}
              className="case-card card group relative overflow-hidden"
              style={{ textDecoration: 'none' }}
            >
              {/* Tag */}
              {c.tag && (
                <div className={`absolute top-2 right-2 z-10 text-xs font-bold px-2 py-0.5 rounded-full ${TAG_STYLES[c.tag]}`}>
                  {c.tag}
                </div>
              )}

              {/* Image area */}
              <div
                className="relative h-40 flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d1220, #1a2236)' }}
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'radial-gradient(circle at center, rgba(249,115,22,0.15) 0%, transparent 70%)' }}
                />
                {/* Case icon placeholder */}
                <div className="animate-float text-7xl select-none">📦</div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-orange-400 transition-colors">
                  {c.name}
                </h3>

                {/* Rarity bar */}
                <CaseRarityBar rarities={c.skins.map((s) => s.rarity)} />

                {/* Top skin preview */}
                <div className="mt-2 flex items-center gap-1.5">
                  {c.skins
                    .filter((s) => s.rarity === 'extraordinary' || s.rarity === 'covert')
                    .slice(0, 3)
                    .map((skin) => (
                      <span
                        key={skin.id}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: `${RARITY_COLORS[skin.rarity]}20`,
                          color: RARITY_COLORS[skin.rarity],
                          border: `1px solid ${RARITY_COLORS[skin.rarity]}30`,
                        }}
                      >
                        {skin.weapon}
                      </span>
                    ))}
                </div>

                {/* Price & open btn */}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Price</div>
                    <div className="font-black text-lg text-yellow-400">${c.price.toFixed(2)}</div>
                  </div>
                  <div
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all opacity-0 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white' }}
                  >
                    Open
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '💰', title: 'Deposit Funds', desc: 'Add balance to your account to start opening cases.' },
            { icon: '📦', title: 'Choose a Case', desc: 'Browse our selection of CS2 cases and pick your favorite.' },
            { icon: '🎉', title: 'Win Skins', desc: 'Open cases and win rare CS2 skins. Sell them for instant balance.' },
          ].map((step, i) => (
            <div key={i} className="card p-6 text-center">
              <div className="text-4xl mb-3">{step.icon}</div>
              <div className="text-sm font-bold uppercase tracking-wider mb-2 gradient-text">{`Step ${i + 1}`}</div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
