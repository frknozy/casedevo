'use client';
import { use, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { cases, RARITY_COLORS, RARITY_LABELS, rollSkin, Skin, Rarity } from '@/lib/data';
import { useStore } from '@/store/useStore';

const ITEM_W = 166;
const ITEM_GAP = 8;
const STEP = ITEM_W + ITEM_GAP;
const VISIBLE = 7;
const STRIP_LEN = 80;

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

function buildStrip(skins: Skin[], winner: Skin, winnerPos: number): Skin[] {
  return Array.from({ length: STRIP_LEN }, (_, i) =>
    i === winnerPos ? winner : skins[Math.floor(Math.random() * skins.length)]
  );
}

function SkinTile({ skin, highlight }: { skin: Skin; highlight?: boolean }) {
  const c = RARITY_COLORS[skin.rarity];
  return (
    <div className="flex-shrink-0 rounded-xl overflow-hidden flex flex-col"
      style={{
        width: ITEM_W, height: 148,
        background: `linear-gradient(180deg, ${c}18 0%, ${c}06 100%)`,
        border: `2px solid ${highlight ? c : c + '35'}`,
        boxShadow: highlight ? `0 0 24px ${c}60` : undefined,
        transition: 'all 0.2s',
      }}>
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: c }} />
        <span className="text-5xl select-none">🔫</span>
      </div>
      <div className="px-2 pb-2 text-center">
        <div className="font-semibold leading-tight" style={{ fontSize: 9, color: c }}>
          {skin.weapon}
        </div>
        <div className="leading-tight" style={{ fontSize: 8, color: 'var(--text-muted)' }}>
          {skin.name}
        </div>
        <div className="font-black text-yellow-400" style={{ fontSize: 11 }}>
          ${skin.price.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const c = cases.find(x => x.id === id);
  const { balance, deductBalance, addToInventory, sellItem, inventory } = useStore();

  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<Skin | null>(null);
  const [strip, setStrip] = useState<Skin[]>([]);
  const [qty, setQty] = useState(1);
  const [fast, setFast] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<Skin[]>([]);
  const reelRef = useRef<HTMLDivElement>(null);

  if (!c) return (
    <div className="flex items-center justify-center h-96 text-center">
      <div>
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-2">Case not found</h2>
        <Link href="/" className="btn-primary">Back</Link>
      </div>
    </div>
  );

  const cost = c.price * qty;
  const canOpen = balance >= cost && !spinning;
  const [from, to] = CASE_GRADS[c.id] || ['#1a1a2e', '#2d2d7a'];
  const icon = CASE_ICONS[c.id] || '📦';

  const open = useCallback(() => {
    if (!canOpen) return;
    if (!deductBalance(cost)) return;

    setWon(null);
    setShowResult(false);

    const winnerPos = STRIP_LEN - 12;
    const winner = rollSkin(c.skins);
    const newStrip = buildStrip(c.skins, winner, winnerPos);
    setStrip(newStrip);

    if (reelRef.current) {
      reelRef.current.style.transition = 'none';
      reelRef.current.style.transform = 'translateX(0)';
    }

    setSpinning(true);
    const duration = fast ? 600 : 5000;
    const easing = fast ? 'ease-out' : 'cubic-bezier(0.12, 0.0, 0.0, 1.0)';

    const target = winnerPos * STEP - (VISIBLE * STEP) / 2 + STEP / 2 + (Math.random() - 0.5) * ITEM_W * 0.4;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (reelRef.current) {
          reelRef.current.style.transition = `transform ${duration}ms ${easing}`;
          reelRef.current.style.transform = `translateX(${-target}px)`;
        }
      });
    });

    setTimeout(() => {
      setSpinning(false);
      setWon(winner);
      setShowResult(true);
      addToInventory(winner);
      setHistory(prev => [winner, ...prev.slice(0, 9)]);
    }, duration + 300);
  }, [canOpen, c, deductBalance, addToInventory, cost, fast]);

  const reset = () => {
    setShowResult(false);
    setWon(null);
    setStrip([]);
    if (reelRef.current) {
      reelRef.current.style.transition = 'none';
      reelRef.current.style.transform = 'translateX(0)';
    }
  };

  const sortedSkins = [...c.skins].sort((a, b) => {
    const ord: Rarity[] = ['extraordinary', 'covert', 'classified', 'restricted', 'milspec', 'industrial', 'consumer'];
    return ord.indexOf(a.rarity) - ord.indexOf(b.rarity);
  });

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className="hover:text-white transition-colors">Cases</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{c.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Case card */}
          <div className="card p-5 text-center">
            <div className="w-40 h-40 mx-auto rounded-2xl flex items-center justify-center text-7xl mb-4 animate-float"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})`, border: '1px solid rgba(255,255,255,0.1)' }}>
              {icon}
            </div>
            <h1 className="text-xl font-black mb-1">{c.name}</h1>
            <div className="text-3xl font-black text-yellow-400 mb-4">${c.price.toFixed(2)}</div>

            {/* Qty */}
            <div className="mb-3">
              <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>QUANTITY</div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 5].map(q => (
                  <button key={q} onClick={() => { setQty(q); reset(); }}
                    className="w-10 h-10 rounded-lg font-bold text-sm transition-all"
                    style={{
                      background: qty === q ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'var(--bg-secondary)',
                      border: `1px solid ${qty === q ? '#f97316' : 'var(--border)'}`,
                      color: qty === q ? 'white' : 'var(--text-secondary)',
                    }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Fast mode */}
            <div className="flex justify-center mb-4">
              <button onClick={() => setFast(!fast)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: fast ? 'rgba(249,115,22,0.15)' : 'var(--bg-secondary)',
                  border: `1px solid ${fast ? '#f97316' : 'var(--border)'}`,
                  color: fast ? '#f97316' : 'var(--text-muted)',
                }}>
                ⚡ Fast Mode {fast ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Open btn */}
            <button
              onClick={showResult ? reset : open}
              disabled={!showResult && !canOpen}
              className="btn-primary w-full justify-center text-base py-3 mb-2">
              {spinning ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>Rolling...</>
              ) : showResult ? '🔄 Open Again' : (
                `📦 Open${qty > 1 ? ` ${qty}x` : ''} — $${cost.toFixed(2)}`
              )}
            </button>

            {balance < cost && !spinning && (
              <p className="text-xs text-red-400 mt-1">Insufficient balance. <Link href="/" className="text-orange-400 underline">Deposit</Link></p>
            )}
          </div>

          {/* Session history */}
          {history.length > 0 && (
            <div className="card p-4">
              <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>SESSION HISTORY</div>
              <div className="space-y-1.5">
                {history.slice(0, 5).map((s, i) => {
                  const clr = RARITY_COLORS[s.rarity];
                  return (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg"
                      style={{ background: `${clr}10`, border: `1px solid ${clr}20` }}>
                      <span className="text-lg">🔫</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: clr }}>{s.weapon} | {s.name}</div>
                      </div>
                      <div className="text-xs font-bold text-yellow-400">${s.price.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
                Total won: <span className="text-yellow-400 font-bold">${history.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="space-y-5">
          {/* Reel */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <span className="font-semibold text-sm">Opening Reel</span>
              <div className="flex items-center gap-3">
                {spinning && <span className="text-xs font-semibold animate-pulse" style={{ color: '#f97316' }}>● Spinning...</span>}
              </div>
            </div>

            <div className="relative py-4" style={{ background: 'var(--bg-secondary)' }}>
              {/* Center marker */}
              <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-px pointer-events-none z-20" style={{ background: 'rgba(249,115,22,0.6)' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="w-0 h-0" style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '12px solid #f97316' }} />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="w-0 h-0" style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '12px solid #f97316' }} />
              </div>

              {/* Center highlight box */}
              <div className="absolute inset-y-4 left-1/2 z-10 pointer-events-none rounded-xl"
                style={{
                  width: ITEM_W + 4,
                  transform: `translateX(calc(-50% - 2px))`,
                  border: '2px solid rgba(249,115,22,0.4)',
                  background: 'rgba(249,115,22,0.05)',
                  boxShadow: '0 0 20px rgba(249,115,22,0.2)',
                }} />

              {/* Reel container */}
              <div className="overflow-hidden mx-4" style={{ height: 148 }}>
                {strip.length > 0 ? (
                  <div ref={reelRef} className="flex gap-2" style={{ willChange: 'transform', paddingLeft: `calc(50% - ${ITEM_W / 2}px)` }}>
                    {strip.map((skin, i) => <SkinTile key={i} skin={skin} />)}
                  </div>
                ) : (
                  <div className="flex gap-2 items-center" style={{ paddingLeft: `calc(50% - ${ITEM_W / 2}px)` }}>
                    {sortedSkins.slice(0, 10).map((skin, i) => <SkinTile key={i} skin={skin} />)}
                  </div>
                )}
              </div>

              {/* Fade sides */}
              <div className="absolute inset-y-4 left-4 w-32 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to right, var(--bg-secondary), transparent)' }} />
              <div className="absolute inset-y-4 right-4 w-32 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to left, var(--bg-secondary), transparent)' }} />
            </div>
          </div>

          {/* Winner result */}
          {showResult && won && (() => {
            const clr = RARITY_COLORS[won.rarity];
            const lastInventory = inventory[0];
            return (
              <div className="card p-6 text-center animate-fade-up"
                style={{ border: `2px solid ${clr}`, boxShadow: `0 0 40px ${clr}35`, background: `linear-gradient(135deg, ${clr}12 0%, var(--bg-card) 100%)` }}>
                <div className="text-5xl mb-3">🎉</div>
                <div className="text-sm font-bold mb-1" style={{ color: clr }}>{RARITY_LABELS[won.rarity]}</div>
                <h2 className="text-2xl font-black mb-1">{won.weapon} | {won.name}</h2>
                {won.wear && <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{won.wear}</div>}
                <div className="text-4xl font-black text-yellow-400 mb-5">${won.price.toFixed(2)}</div>
                <div className="flex gap-3 justify-center">
                  {lastInventory && (
                    <button onClick={() => { sellItem(lastInventory.inventoryId, won.price); reset(); }} className="btn-green">
                      💰 Sell ${won.price.toFixed(2)}
                    </button>
                  )}
                  <Link href="/inventory" className="btn-secondary no-underline">View Inventory</Link>
                  <button onClick={reset} className="btn-secondary">Open Again</button>
                </div>
              </div>
            );
          })()}

          {/* Contents */}
          <div className="card p-5">
            <h2 className="font-bold text-lg mb-4">Case Contents <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({c.skins.length} items)</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedSkins.map(skin => {
                const clr = RARITY_COLORS[skin.rarity];
                return (
                  <div key={skin.id} className="rounded-xl p-3 flex items-center gap-3 transition-all hover:scale-[1.02]"
                    style={{ background: `${clr}10`, border: `1px solid ${clr}30` }}>
                    <div className="text-3xl flex-shrink-0">🔫</div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: clr }}>{skin.weapon}</div>
                      <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>{skin.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{RARITY_LABELS[skin.rarity]}</div>
                      <div className="font-bold text-sm text-yellow-400">${skin.price.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
