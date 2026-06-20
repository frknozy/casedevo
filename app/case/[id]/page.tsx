'use client';
import { use, useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { cases, RARITY_COLORS, RARITY_LABELS, rollSkin, Skin, Rarity } from '@/lib/data';
import { useStore } from '@/store/useStore';

const ITEM_W = 166;
const ITEM_GAP = 8;
const STEP = ITEM_W + ITEM_GAP;
const STRIP_LEN = 80;
const WINNER_POS = 60; // position of winner in strip

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

function buildStrip(skins: Skin[], winner: Skin): Skin[] {
  return Array.from({ length: STRIP_LEN }, (_, i) =>
    i === WINNER_POS ? winner : skins[Math.floor(Math.random() * skins.length)]
  );
}

function SkinTile({ skin }: { skin: Skin }) {
  const c = RARITY_COLORS[skin.rarity];
  return (
    <div className="flex-shrink-0 rounded-xl overflow-hidden flex flex-col"
      style={{
        width: ITEM_W, height: 148,
        background: `linear-gradient(180deg, ${c}20 0%, ${c}08 100%)`,
        border: `2px solid ${c}50`,
      }}>
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: c }} />
        <span className="text-5xl select-none">🔫</span>
      </div>
      <div className="px-2 pb-2 text-center">
        <div className="font-bold leading-tight truncate" style={{ fontSize: 10, color: c }}>{skin.weapon}</div>
        <div className="leading-tight truncate" style={{ fontSize: 9, color: 'var(--text-muted)' }}>{skin.name}</div>
        <div className="font-black text-yellow-400" style={{ fontSize: 11 }}>${skin.price.toFixed(2)}</div>
      </div>
    </div>
  );
}

export default function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { balance, deductBalance, addToInventory, sellItem, inventory } = useStore();

  // ALL hooks must be before any conditional return
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<Skin | null>(null);
  const [wonInventoryId, setWonInventoryId] = useState<string | null>(null);
  const [strip, setStrip] = useState<Skin[]>([]);
  const [reelKey, setReelKey] = useState(0); // force remount reel on reset
  const [qty, setQty] = useState(1);
  const [fast, setFast] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<Skin[]>([]);
  const reelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const c = cases.find(x => x.id === id);

  const cost = (c?.price ?? 0) * qty;
  const canOpen = !!c && balance >= cost && !spinning;

  const openCase = useCallback(() => {
    if (!c || !canOpen) return;
    if (!deductBalance(cost)) return;

    setWon(null);
    setWonInventoryId(null);
    setShowResult(false);
    setStrip([]);

    const winner = rollSkin(c.skins);
    const newStrip = buildStrip(c.skins, winner);

    // Remount the reel div so transform resets cleanly
    setReelKey(k => k + 1);
    setStrip(newStrip);
    setSpinning(true);

    const duration = fast ? 700 : 5000;
    const easing = fast ? 'ease-out' : 'cubic-bezier(0.12, 0.0, 0.0, 1.0)';
    // Centering: item 0 is centered via paddingLeft. To center item WINNER_POS, translate by WINNER_POS * STEP
    const jitter = (Math.random() - 0.5) * ITEM_W * 0.45;
    const targetX = -(WINNER_POS * STEP + jitter);

    // Two rAFs to ensure DOM has rendered the new strip before we start the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (reelRef.current) {
          reelRef.current.style.transition = `transform ${duration}ms ${easing}`;
          reelRef.current.style.transform = `translateX(${targetX}px)`;
        }
      });
    });

    timerRef.current = setTimeout(() => {
      setSpinning(false);
      setWon(winner);
      setShowResult(true);
      const invId = addToInventory(winner); // store returns the generated inventoryId
      setWonInventoryId(invId);
      setHistory(prev => [winner, ...prev.slice(0, 9)]);
    }, duration + 300);
  }, [c, canOpen, deductBalance, addToInventory, cost, fast]);

  const resetReel = useCallback(() => {
    setShowResult(false);
    setWon(null);
    setWonInventoryId(null);
    setStrip([]);
    setReelKey(k => k + 1);
  }, []);

  if (!c) return (
    <div className="flex items-center justify-center h-96 text-center">
      <div>
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-3">Case not found</h2>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>← Back to Cases</Link>
      </div>
    </div>
  );

  const [from, to] = CASE_GRADS[c.id] || ['#1a1a2e', '#2d2d7a'];
  const icon = CASE_ICONS[c.id] || '📦';
  const sortedSkins = [...c.skins].sort((a, b) => {
    const ord: Rarity[] = ['extraordinary', 'covert', 'classified', 'restricted', 'milspec', 'industrial', 'consumer'];
    return ord.indexOf(a.rarity) - ord.indexOf(b.rarity);
  });

  // Track the exact item won by its inventoryId
  const wonInvItem = wonInventoryId && wonInventoryId !== 'sold'
    ? inventory.find(i => i.inventoryId === wonInventoryId)
    : null;

  const handleSell = () => {
    if (!won || !wonInventoryId || wonInventoryId === 'sold') return;
    sellItem(wonInventoryId, won.price);
    setWonInventoryId('sold');
    resetReel();
  };

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className="hover:text-white transition-colors" style={{ textDecoration: 'none' }}>Cases</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{c.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <div className="card p-5 text-center">
            {/* Case image */}
            <div className="w-36 h-36 mx-auto rounded-2xl flex items-center justify-center text-6xl mb-4 animate-float"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})`, border: '1px solid rgba(255,255,255,0.08)' }}>
              {icon}
            </div>
            <h1 className="text-lg font-black mb-0.5">{c.name}</h1>
            <div className="text-3xl font-black text-yellow-400 mb-5">${c.price.toFixed(2)}</div>

            {/* Quantity */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2 tracking-widest" style={{ color: 'var(--text-muted)' }}>QUANTITY</div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 5].map(q => (
                  <button key={q}
                    onClick={() => { setQty(q); resetReel(); }}
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
              <button onClick={() => setFast(f => !f)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: fast ? 'rgba(249,115,22,0.15)' : 'var(--bg-secondary)',
                  border: `1px solid ${fast ? '#f97316' : 'var(--border)'}`,
                  color: fast ? '#f97316' : 'var(--text-muted)',
                }}>
                ⚡ Fast Mode {fast ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Main action button */}
            <button
              onClick={showResult ? resetReel : openCase}
              disabled={!showResult && !canOpen}
              className="btn-primary w-full justify-center text-sm py-3 mb-2">
              {spinning ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Rolling...
                </>
              ) : showResult
                ? '🔄 Open Again'
                : `📦 Open${qty > 1 ? ` ${qty}x` : ''} — $${cost.toFixed(2)}`}
            </button>

            {!spinning && balance < cost && !showResult && (
              <p className="text-xs text-red-400 mt-1">
                Insufficient balance.{' '}
                <button onClick={() => {
                  // trigger deposit modal by dispatching custom event
                  window.dispatchEvent(new CustomEvent('open-deposit'));
                }} className="text-orange-400 underline cursor-pointer bg-transparent border-none p-0">
                  Deposit
                </button>
              </p>
            )}
          </div>

          {/* Session history */}
          {history.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>SESSION HISTORY</span>
                <span className="text-xs font-bold text-yellow-400">${history.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
              </div>
              <div className="space-y-1.5">
                {history.slice(0, 6).map((s, i) => {
                  const clr = RARITY_COLORS[s.rarity];
                  return (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg"
                      style={{ background: `${clr}10`, border: `1px solid ${clr}25` }}>
                      <span className="text-base flex-shrink-0">🔫</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: clr, fontSize: 10 }}>{s.weapon} | {s.name}</div>
                      </div>
                      <div className="text-xs font-black text-yellow-400 flex-shrink-0">${s.price.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Main ── */}
        <div className="space-y-5">
          {/* Reel */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <span className="font-semibold text-sm">Opening Reel</span>
              {spinning && (
                <span className="text-xs font-semibold" style={{ color: '#f97316' }}>
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1.5" style={{ animation: 'pulse 1s infinite' }} />
                  Spinning...
                </span>
              )}
            </div>

            <div className="relative" style={{ background: 'var(--bg-secondary)', paddingTop: 16, paddingBottom: 16 }}>
              {/* Top arrow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div style={{ width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '14px solid #f97316' }} />
              </div>
              {/* Bottom arrow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div style={{ width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: '14px solid #f97316' }} />
              </div>
              {/* Center vertical line */}
              <div className="absolute inset-0 left-1/2 -translate-x-px w-0.5 z-20 pointer-events-none"
                style={{ background: 'rgba(249,115,22,0.7)' }} />
              {/* Center highlight box */}
              <div className="absolute inset-y-4 left-1/2 z-10 pointer-events-none rounded-xl"
                style={{
                  width: ITEM_W + 6,
                  transform: `translateX(calc(-50% - 3px))`,
                  border: '2px solid rgba(249,115,22,0.5)',
                  background: 'rgba(249,115,22,0.06)',
                  boxShadow: '0 0 24px rgba(249,115,22,0.25)',
                }} />

              {/* Reel strip */}
              <div className="overflow-hidden" style={{ height: 148, marginLeft: 16, marginRight: 16 }}>
                <div
                  key={reelKey}
                  ref={reelRef}
                  className="flex"
                  style={{
                    gap: ITEM_GAP,
                    willChange: 'transform',
                    // Padding so item[0]'s center aligns with container center
                    paddingLeft: `calc(50% - ${ITEM_W / 2}px)`,
                    paddingRight: `calc(50% - ${ITEM_W / 2}px)`,
                  }}>
                  {(strip.length > 0 ? strip : sortedSkins).map((skin, i) => (
                    <SkinTile key={i} skin={skin} />
                  ))}
                </div>
              </div>

              {/* Fade edges */}
              <div className="absolute inset-y-4 left-4 w-28 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to right, var(--bg-secondary), transparent)' }} />
              <div className="absolute inset-y-4 right-4 w-28 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to left, var(--bg-secondary), transparent)' }} />
            </div>
          </div>

          {/* Winner card */}
          {showResult && won && (() => {
            const clr = RARITY_COLORS[won.rarity];
            return (
              <div className="card p-6 text-center animate-fade-up"
                style={{ border: `2px solid ${clr}`, boxShadow: `0 0 50px ${clr}30, 0 0 100px ${clr}10`, background: `linear-gradient(135deg, ${clr}12, var(--bg-card) 60%)` }}>
                <div className="text-5xl mb-3">🎉</div>
                <div className="text-xs font-black tracking-widest mb-2" style={{ color: clr }}>
                  {RARITY_LABELS[won.rarity].toUpperCase()}
                </div>
                <h2 className="text-2xl font-black mb-1">{won.weapon} | {won.name}</h2>
                {won.wear && <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{won.wear}</p>}
                <div className="text-4xl font-black text-yellow-400 mb-5">${won.price.toFixed(2)}</div>
                <div className="flex gap-3 justify-center flex-wrap">
                  {wonInvItem && wonInventoryId !== 'sold' && (
                    <button onClick={handleSell} className="btn-green">
                      💰 Sell for ${won.price.toFixed(2)}
                    </button>
                  )}
                  <Link href="/inventory" className="btn-secondary" style={{ textDecoration: 'none' }}>
                    📦 Inventory
                  </Link>
                  <button onClick={resetReel} className="btn-secondary">
                    🔄 Open Again
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Case contents */}
          <div className="card p-5">
            <h2 className="font-bold text-base mb-4">
              Case Contents
              <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>({c.skins.length} items)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedSkins.map(skin => {
                const clr = RARITY_COLORS[skin.rarity];
                return (
                  <div key={skin.id} className="rounded-xl p-3 flex items-center gap-2.5 transition-all"
                    style={{
                      background: `${clr}10`,
                      border: `1px solid ${clr}35`,
                      cursor: 'default',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${clr}20`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${clr}10`)}>
                    <span className="text-2xl flex-shrink-0">🔫</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: clr, fontSize: 10 }}>{skin.weapon}</div>
                      <div className="font-semibold truncate" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{skin.name}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{RARITY_LABELS[skin.rarity]}</div>
                      <div className="font-black text-yellow-400" style={{ fontSize: 12 }}>${skin.price.toFixed(2)}</div>
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
