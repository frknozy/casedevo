'use client';
import { use, useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cases, RARITY_COLORS, RARITY_LABELS, rollSkin, Skin, Rarity } from '@/lib/data';
import { useStore } from '@/store/useStore';

const ITEM_W = 160;
const ITEM_GAP = 6;
const STEP = ITEM_W + ITEM_GAP;
const STRIP_LEN = 80;
const WINNER_POS = 60;

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

function KnifeIcon({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
      style={{ filter: `drop-shadow(0 2px 10px ${color}80)` }}>
      <path d="M48 8 L16 40 L20 44 L24 48 L56 16 Z" fill={color} opacity="0.9" />
      <path d="M16 40 L12 52 L24 48 Z" fill={color} opacity="0.6" />
      <path d="M48 8 L56 16 L52 20 L44 12 Z" fill="white" opacity="0.3" />
    </svg>
  );
}

function SkinTile({ skin }: { skin: Skin }) {
  const c = RARITY_COLORS[skin.rarity];
  const isKnife = skin.weapon.startsWith('★');
  return (
    <div className="flex-shrink-0 rounded-xl overflow-hidden flex flex-col select-none"
      style={{
        width: ITEM_W,
        height: 140,
        background: `linear-gradient(180deg, ${c}40 0%, ${c}18 100%)`,
        border: `2px solid ${c}80`,
      }}>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: c }} />
        {isKnife ? (
          <KnifeIcon color={c} size={56} />
        ) : (
          <Image
            src={skin.image}
            alt={`${skin.weapon} | ${skin.name}`}
            width={110}
            height={80}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
            unoptimized
          />
        )}
      </div>
      <div className="px-1.5 pb-1.5 text-center">
        <div className="font-bold leading-tight truncate" style={{ fontSize: 9, color: c }}>{skin.weapon}</div>
        <div className="leading-tight truncate" style={{ fontSize: 8, color: 'var(--text-muted)' }}>{skin.name}</div>
        <div className="font-black text-yellow-400" style={{ fontSize: 10 }}>${skin.price.toFixed(2)}</div>
      </div>
    </div>
  );
}

interface SingleReel {
  key: number;
  strip: Skin[];
  winner: Skin | null;
  inventoryId: string | null;
  done: boolean;
}

export default function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { balance, deductBalance, addToInventory, sellItem } = useStore();

  const [qty, setQty] = useState(1);
  const [fast, setFast] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<SingleReel[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [history, setHistory] = useState<Skin[]>([]);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reelsRef = useRef<SingleReel[]>([]);
  const animParamsRef = useRef<{ duration: number; easing: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timers.current.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => { reelsRef.current = reels; }, [reels]);

  // Apply reel animation after reels are committed to DOM.
  // Clearing animParamsRef inside the rAF (not the effect) makes this
  // StrictMode-safe: the double-invoke cancels raf1 but params survive,
  // so raf2 (from the second effect run) fires and applies the animation.
  useEffect(() => {
    if (!animParamsRef.current || reels.length === 0) return;
    const { duration, easing } = animParamsRef.current;

    const raf = requestAnimationFrame(() => {
      animParamsRef.current = null; // clear after we've started
      reels.forEach((_, idx) => {
        const el = reelRefs.current[idx];
        if (!el) return;
        const jitter = (Math.random() - 0.5) * ITEM_W * 0.45;
        const targetX = -(WINNER_POS * STEP + jitter);
        el.style.transition = `transform ${duration}ms ${easing}`;
        el.style.transform = `translateX(${targetX}px)`;
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [reels]);

  useEffect(() => {
    if (!allDone) return;
    const current = reelsRef.current;
    if (current.every(r => r.inventoryId !== null)) return;
    const updated = current.map(reel => {
      if (!reel.winner || reel.inventoryId !== null) return reel;
      return { ...reel, inventoryId: addToInventory(reel.winner), done: true };
    });
    setReels(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  const c = cases.find(x => x.id === id);
  const cost = (c?.price ?? 0) * qty;
  const canOpen = !!c && balance >= cost && !spinning && !allDone;

  const openCase = useCallback(() => {
    if (!c || !canOpen) return;
    if (!deductBalance(cost)) return;

    const duration = fast ? 700 : 5000;
    const easing = fast ? 'ease-out' : 'cubic-bezier(0.0, 0.0, 0.15, 1.0)';
    const newReels: SingleReel[] = [];

    for (let i = 0; i < qty; i++) {
      const winner = rollSkin(c.skins);
      newReels.push({ key: Date.now() + i, strip: buildStrip(c.skins, winner), winner, inventoryId: null, done: false });
    }

    // Store anim params before triggering re-render — useEffect reads them after DOM commits
    animParamsRef.current = { duration, easing };
    reelRefs.current = new Array(qty).fill(null);

    setReels(newReels);
    setSpinning(true);
    setAllDone(false);

    const t = setTimeout(() => {
      const wonSkins = newReels.map(r => r.winner).filter(Boolean) as Skin[];
      setSpinning(false);
      setAllDone(true);
      setHistory(prev => [...wonSkins, ...prev].slice(0, 10));
    }, duration + 300);

    timers.current.push(t);
  }, [c, canOpen, deductBalance, cost, fast, qty]);

  const resetAll = useCallback(() => {
    // Clear transforms on existing reel elements before unmounting
    reelRefs.current.forEach(el => {
      if (el) { el.style.transition = 'none'; el.style.transform = ''; }
    });
    setReels([]);
    setAllDone(false);
    setSpinning(false);
  }, []);

  const handleSell = (reel: SingleReel) => {
    if (!reel.winner || !reel.inventoryId || reel.inventoryId === 'sold') return;
    sellItem(reel.inventoryId, reel.winner.price);
    setReels(prev => prev.map(r => r.key === reel.key ? { ...r, inventoryId: 'sold' } : r));
  };

  const handleSellAll = () => {
    reels.forEach(reel => {
      if (reel.winner && reel.inventoryId && reel.inventoryId !== 'sold')
        sellItem(reel.inventoryId, reel.winner.price);
    });
    setReels(prev => prev.map(r => ({ ...r, inventoryId: 'sold' })));
  };

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
  const sortedSkins = [...c.skins].sort((a, b) => {
    const ord: Rarity[] = ['extraordinary', 'covert', 'classified', 'restricted', 'milspec', 'industrial', 'consumer'];
    return ord.indexOf(a.rarity) - ord.indexOf(b.rarity);
  });

  const totalWon = reels.reduce((s, r) => s + (r.winner?.price ?? 0), 0);
  const unsoldValue = reels
    .filter(r => r.inventoryId && r.inventoryId !== 'sold')
    .reduce((s, r) => s + (r.winner?.price ?? 0), 0);

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className="hover:text-white transition-colors" style={{ textDecoration: 'none' }}>Cases</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{c.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <div className="card p-5 text-center">
            {/* Case image */}
            <div className="w-36 h-36 mx-auto rounded-2xl flex items-center justify-center mb-4 animate-float overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})`, border: '1px solid rgba(255,255,255,0.08)' }}>
              <Image src={c.image} alt={c.name} width={128} height={128} className="object-contain" unoptimized />
            </div>
            <h1 className="text-lg font-black mb-0.5">{c.name}</h1>
            <div className="text-3xl font-black text-yellow-400 mb-5">${c.price.toFixed(2)}</div>

            {/* Quantity */}
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Quantity</div>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 5].map(q => (
                  <button key={q}
                    onClick={() => { setQty(q); resetAll(); }}
                    disabled={spinning}
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
            <div className="flex justify-center mb-5">
              <button onClick={() => setFast(f => !f)} disabled={spinning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: fast ? 'rgba(249,115,22,0.15)' : 'var(--bg-secondary)',
                  border: `1px solid ${fast ? '#f97316' : 'var(--border)'}`,
                  color: fast ? '#f97316' : 'var(--text-muted)',
                }}>
                ⚡ Fast Open {fast ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Action button */}
            <button
              onClick={allDone ? resetAll : openCase}
              disabled={!allDone && !canOpen}
              className="btn-primary w-full justify-center text-sm py-3 mb-2">
              {spinning ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg> Spinning...</>
              ) : allDone
                ? '🔄 Open Again'
                : `📦 Open${qty > 1 ? ` ${qty}x` : ''} — $${cost.toFixed(2)}`}
            </button>

            {!spinning && balance < cost && !allDone && (
              <p className="text-xs text-red-400 mt-1">
                Insufficient balance.{' '}
                <button onClick={() => window.dispatchEvent(new CustomEvent('open-deposit'))}
                  className="text-orange-400 underline cursor-pointer bg-transparent border-none p-0">
                  Deposit
                </button>
              </p>
            )}
          </div>

          {/* Session history */}
          {history.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Session</span>
                <span className="text-xs font-black text-yellow-400">${history.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
              </div>
              <div className="space-y-1.5">
                {history.slice(0, 8).map((s, i) => {
                  const clr = RARITY_COLORS[s.rarity];
                  const isKnife = s.weapon.startsWith('★');
                  return (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                      style={{ background: `${clr}10`, border: `1px solid ${clr}25` }}>
                      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
                        {isKnife ? (
                          <span style={{ fontSize: 16 }}>🔪</span>
                        ) : (
                          <Image src={s.image} alt={s.name} width={28} height={20} className="object-contain" unoptimized />
                        )}
                      </div>
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
        <div className="space-y-4">
          {/* Reels — only shown after clicking Open */}
          {reels.length > 0 && (
            <div className="space-y-3">
              {reels.map((reel, idx) => (
                <div key={reel.key} className="card overflow-hidden">
                  <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-semibold text-sm">
                      {qty > 1 ? `Case ${idx + 1}` : 'Opening Reel'}
                    </span>
                    {spinning && (
                      <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#f97316' }}>
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        Spinning...
                      </span>
                    )}
                  </div>

                  <div className="relative" style={{ background: 'var(--bg-secondary)', paddingTop: 12, paddingBottom: 12 }}>
                    {/* Top arrow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                      <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '12px solid #f97316' }} />
                    </div>
                    {/* Bottom arrow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                      <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '12px solid #f97316' }} />
                    </div>
                    {/* Center line */}
                    <div className="absolute inset-0 left-1/2 -translate-x-px w-0.5 z-20 pointer-events-none"
                      style={{ background: 'rgba(249,115,22,0.9)' }} />
                    {/* Highlight box */}
                    <div className="absolute inset-y-3 left-1/2 z-10 pointer-events-none rounded-xl"
                      style={{
                        width: ITEM_W + 8,
                        transform: `translateX(calc(-50% - 4px))`,
                        border: '2px solid rgba(249,115,22,0.65)',
                        background: 'rgba(249,115,22,0.06)',
                        boxShadow: '0 0 24px rgba(249,115,22,0.25)',
                      }} />

                    {/* Reel strip */}
                    <div className="overflow-hidden" style={{ height: 140, marginLeft: 12, marginRight: 12 }}>
                      <div
                        ref={el => { reelRefs.current[idx] = el; }}
                        className="flex"
                        style={{
                          gap: ITEM_GAP,
                          willChange: 'transform',
                          paddingLeft: `calc(50% - ${ITEM_W / 2}px)`,
                          paddingRight: `calc(50% - ${ITEM_W / 2}px)`,
                        }}>
                        {reel.strip.map((skin, i) => (
                          <SkinTile key={i} skin={skin} />
                        ))}
                      </div>
                    </div>

                    {/* Fade edges */}
                    <div className="absolute inset-y-3 left-3 w-28 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to right, var(--bg-secondary), transparent)' }} />
                    <div className="absolute inset-y-3 right-3 w-28 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to left, var(--bg-secondary), transparent)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results when all done */}
          {allDone && reels.length > 0 && (
            <div className="card p-5 animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">
                  🎉 {reels.length > 1 ? `Opened ${reels.length} cases!` : 'You got:'}
                </h3>
                {reels.length > 1 && (
                  <div className="text-right">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Value</div>
                    <div className="font-black text-yellow-400 text-xl">${totalWon.toFixed(2)}</div>
                  </div>
                )}
              </div>

              <div className={`grid gap-3 ${reels.length === 1 ? 'grid-cols-1' : reels.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
                {reels.map((reel) => {
                  if (!reel.winner) return null;
                  const clr = RARITY_COLORS[reel.winner.rarity];
                  const sold = reel.inventoryId === 'sold';
                  const isKnife = reel.winner.weapon.startsWith('★');
                  return (
                    <div key={reel.key} className="rounded-xl p-3 text-center transition-all"
                      style={{
                        background: `${clr}12`,
                        border: `2px solid ${sold ? 'var(--border)' : clr}`,
                        boxShadow: sold ? 'none' : `0 0 20px ${clr}25`,
                        opacity: sold ? 0.55 : 1,
                      }}>
                      <div className="h-20 flex items-center justify-center mb-2">
                        {isKnife ? (
                          <KnifeIcon color={clr} size={60} />
                        ) : (
                          <Image src={reel.winner.image} alt={reel.winner.name} width={90} height={65}
                            className="object-contain" style={{ filter: `drop-shadow(0 0 10px ${clr}80)` }} unoptimized />
                        )}
                      </div>
                      <div className="text-xs font-bold truncate mb-0.5" style={{ color: clr, fontSize: 9 }}>
                        {RARITY_LABELS[reel.winner.rarity].toUpperCase()}
                      </div>
                      <div className="font-bold truncate" style={{ fontSize: 10, color: 'var(--text-primary)' }}>
                        {reel.winner.weapon} | {reel.winner.name}
                      </div>
                      <div className="font-black text-yellow-400 text-sm my-1.5">${reel.winner.price.toFixed(2)}</div>
                      {!sold && reel.inventoryId ? (
                        <button onClick={() => handleSell(reel)}
                          className="w-full py-1 rounded-lg text-xs font-bold transition-all"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.28)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.15)')}>
                          Sell ${reel.winner.price.toFixed(2)}
                        </button>
                      ) : sold ? (
                        <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>✓ Sold</div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Action row */}
              <div className="flex gap-3 mt-4 flex-wrap">
                {reels.length === 1 ? (
                  <>
                    {reels[0].inventoryId && reels[0].inventoryId !== 'sold' && (
                      <button onClick={() => handleSell(reels[0])} className="btn-green">
                        💰 Sell for ${reels[0].winner?.price.toFixed(2)}
                      </button>
                    )}
                    <Link href="/inventory" className="btn-secondary" style={{ textDecoration: 'none' }}>📦 Inventory</Link>
                    <button onClick={resetAll} className="btn-secondary">🔄 Open Again</button>
                  </>
                ) : (
                  <>
                    {unsoldValue > 0 && (
                      <button onClick={handleSellAll} className="btn-green">
                        💰 Sell All (${unsoldValue.toFixed(2)})
                      </button>
                    )}
                    <Link href="/inventory" className="btn-secondary" style={{ textDecoration: 'none' }}>📦 Inventory</Link>
                    <button onClick={resetAll} className="btn-primary">🔄 Open Again</button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Case contents */}
          <div className="card p-5">
            <h2 className="font-bold text-base mb-4">
              Case Contents
              <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>({c.skins.length} items)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sortedSkins.map(skin => {
                const clr = RARITY_COLORS[skin.rarity];
                const isKnife = skin.weapon.startsWith('★');
                return (
                  <div key={skin.id} className="rounded-xl p-3 flex items-center gap-2.5 transition-all"
                    style={{ background: `${clr}10`, border: `1px solid ${clr}35` }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${clr}20`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${clr}10`)}>
                    <div className="w-14 h-12 flex-shrink-0 flex items-center justify-center">
                      {isKnife ? (
                        <KnifeIcon color={clr} size={36} />
                      ) : (
                        <Image src={skin.image} alt={`${skin.weapon} | ${skin.name}`}
                          width={52} height={38} className="object-contain" unoptimized />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate" style={{ color: clr, fontSize: 10 }}>{skin.weapon}</div>
                      <div className="font-semibold truncate" style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{skin.name}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{RARITY_LABELS[skin.rarity]}</div>
                      <div className="font-black text-yellow-400" style={{ fontSize: 11 }}>${skin.price.toFixed(2)}</div>
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
