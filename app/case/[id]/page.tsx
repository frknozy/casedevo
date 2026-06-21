'use client';
import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { applyCaseOverrides, cases, formatChance, getCaseSkinChance, RARITY_COLORS, RARITY_LABELS, rollSkin, Skin, Rarity } from '@/lib/data';
import { useStore } from '@/store/useStore';

const ITEM_W = 160;
const ITEM_GAP = 6;
const STEP = ITEM_W + ITEM_GAP;
const STRIP_LEN = 80;
const WINNER_POS = 60;
// Compact reel sizing. Revert by restoring the previous larger values.
const REEL_TILE_H = 124;
const REEL_IMAGE_H = 68;
const REEL_PANEL_Y = 12;
const EMPTY_REEL_H = 170;

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

function buildPreviewStrip(skins: Skin[], offset: number): Skin[] {
  return Array.from({ length: 10 }, (_, i) => skins[(i + offset * 3) % skins.length]);
}

function SkinTile({ skin }: { skin: Skin }) {
  const c = RARITY_COLORS[skin.rarity];
  return (
    <div className="flex-shrink-0 rounded-xl overflow-hidden flex flex-col select-none"
      style={{
        width: ITEM_W,
        height: REEL_TILE_H,
        background: `linear-gradient(180deg, ${c}40 0%, ${c}18 100%)`,
        border: `2px solid ${c}80`,
      }}>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: c }} />
        <Image
          src={skin.image}
          alt={`${skin.weapon} | ${skin.name}`}
          width={110}
          height={REEL_IMAGE_H}
          className="object-contain"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
          unoptimized
        />
      </div>
      <div className="px-1.5 pb-1.5 text-center">
        <div className="font-bold leading-tight truncate" style={{ fontSize: 8, color: c }}>{skin.weapon}</div>
        <div className="leading-tight truncate" style={{ fontSize: 7, color: 'var(--text-muted)' }}>{skin.name}</div>
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

type BrowserAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function applyReelTransform(el: HTMLDivElement, x: number, duration?: number, easing?: string) {
  const transform = `translate3d(${x}px, 0, 0)`;
  el.style.transition = duration && easing ? `transform ${duration}ms ${easing}` : 'none';
  el.style.transform = transform;
  el.style.webkitTransform = transform;
}

export default function CasePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { balance, deductBalance, addBalance, addToInventory, caseOverrides, recordCaseOpen, users, currentUserId, hasHydrated } = useStore();
  const currentUser = users.find((user) => user.id === currentUserId);

  const [qty, setQty] = useState(1);
  const [fast, setFast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<SingleReel[]>([]);
  const [allDone, setAllDone] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reelsRef = useRef<SingleReel[]>([]);
  const animParamsRef = useRef<{ duration: number; easing: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => {
      pendingTimers.forEach(t => clearTimeout(t));
      soundTimers.current.forEach(t => clearTimeout(t));
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => { reelsRef.current = reels; }, [reels]);

  // Apply reel animation after reels are committed to DOM.
  // Clearing animParamsRef inside the rAF (not the effect) makes this
  // StrictMode-safe: the double-invoke cancels raf1 but params survive,
  // so raf2 (from the second effect run) fires and applies the animation.
  useLayoutEffect(() => {
    if (!animParamsRef.current || reels.length === 0) return;
    const { duration, easing } = animParamsRef.current;

    const raf1 = requestAnimationFrame(() => {
      reels.forEach((_, idx) => {
        const el = reelRefs.current[idx];
        if (!el) return;
        applyReelTransform(el, 0);
      });
      const raf2 = requestAnimationFrame(() => {
        animParamsRef.current = null;
        reels.forEach((_, idx) => {
          const el = reelRefs.current[idx];
          if (!el) return;
          const jitter = (Math.random() - 0.5) * ITEM_W * 0.45;
          const targetX = -(WINNER_POS * STEP + jitter);
          applyReelTransform(el, targetX, duration, easing);
        });
      });
      timers.current.push(setTimeout(() => cancelAnimationFrame(raf2), duration + 100));
    });

    return () => cancelAnimationFrame(raf1);
  }, [reels]);

  const managedCases = useMemo(() => applyCaseOverrides(cases, caseOverrides), [caseOverrides]);
  const c = managedCases.find(x => x.id === id);
  const cost = (c?.price ?? 0) * qty;
  const canOpen = !!currentUser && !!c && balance >= cost && !spinning && !allDone;

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtor = window.AudioContext || (window as BrowserAudioWindow).webkitAudioContext;
      if (!AudioCtor) return null;
      audioCtxRef.current = new AudioCtor();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => undefined);
    }
    return audioCtxRef.current;
  }, []);

  const playBlip = useCallback((frequency: number, duration = 0.045, volume = 0.055, type: OscillatorType = 'triangle') => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(60, frequency * 0.72), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }, [getAudioContext, soundEnabled]);

  const playFinishSound = useCallback(() => {
    if (!soundEnabled) return;
    playBlip(520, 0.09, 0.07, 'sine');
    const t1 = setTimeout(() => playBlip(780, 0.11, 0.065, 'sine'), 85);
    const t2 = setTimeout(() => playBlip(1040, 0.14, 0.055, 'triangle'), 170);
    soundTimers.current.push(t1, t2);
  }, [playBlip, soundEnabled]);

  const scheduleOpeningSound = useCallback((duration: number, reelCount: number) => {
    if (!soundEnabled) return;
    soundTimers.current.forEach(t => clearTimeout(t));
    soundTimers.current = [];
    playBlip(180, 0.08, 0.06, 'sawtooth');

    let elapsed = 0;
    const tick = () => {
      if (elapsed >= duration) return;
      const progress = elapsed / duration;
      const nextDelay = Math.round(46 + progress * (fast ? 42 : 150));
      const freq = 920 - progress * 420 + Math.random() * 90 + reelCount * 8;
      playBlip(freq, 0.026 + progress * 0.018, 0.032, 'square');
      elapsed += nextDelay;
      const timer = setTimeout(tick, nextDelay);
      soundTimers.current.push(timer);
    };

    const firstTick = setTimeout(tick, 55);
    const finish = setTimeout(playFinishSound, duration + 120);
    soundTimers.current.push(firstTick, finish);
  }, [fast, playBlip, playFinishSound, soundEnabled]);

  const openCase = useCallback(() => {
    if (!currentUser || !c || !canOpen) return;
    if (!deductBalance(cost)) return;

    const duration = fast ? 700 : 5000;
    const easing = fast ? 'ease-out' : 'cubic-bezier(0.0, 0.0, 0.15, 1.0)';
    const newReels: SingleReel[] = [];

    for (let i = 0; i < qty; i++) {
      const winner = rollSkin(c.skins, c.price, currentUser.caseWinBoostPercent ?? 0);
      newReels.push({ key: Date.now() + i, strip: buildStrip(c.skins, winner), winner, inventoryId: null, done: false });
    }

    // Store anim params before triggering re-render — useEffect reads them after DOM commits
    animParamsRef.current = { duration, easing };
    reelRefs.current = new Array(qty).fill(null);

    setReels(newReels);
    setSpinning(true);
    setAllDone(false);
    setResultsOpen(false);
    scheduleOpeningSound(duration, qty);

    const t = setTimeout(() => {
      recordCaseOpen(c.name, cost, newReels.map((reel) => reel.winner).filter(Boolean) as Skin[]);
      setSpinning(false);
      setAllDone(true);
      setResultsOpen(true);
    }, duration + 300);

    timers.current.push(t);
  }, [c, currentUser, canOpen, deductBalance, cost, fast, qty, recordCaseOpen, scheduleOpeningSound]);

  const keepPendingInInventory = useCallback(() => {
    const current = reelsRef.current;
    let changed = false;
    const updated = current.map(reel => {
      if (!reel.winner || reel.inventoryId === 'sold' || reel.inventoryId) return reel;
      changed = true;
      return { ...reel, inventoryId: addToInventory(reel.winner), done: true };
    });
    if (changed) setReels(updated);
    setResultsOpen(false);
  }, [addToInventory]);

  const resetAll = useCallback(() => {
    keepPendingInInventory();
    // Clear transforms on existing reel elements before unmounting
    reelRefs.current.forEach(el => {
      if (el) applyReelTransform(el, 0);
    });
    setReels([]);
    setAllDone(false);
    setSpinning(false);
    setResultsOpen(false);
  }, [keepPendingInInventory]);

  const handleSell = (reel: SingleReel) => {
    if (!reel.winner || reel.inventoryId === 'sold') return;
    if (!reel.inventoryId) addBalance(reel.winner.price);
    setReels(prev => prev.map(r => r.key === reel.key ? { ...r, inventoryId: 'sold', done: true } : r));
  };

  const handleKeep = (reel: SingleReel) => {
    if (!reel.winner || reel.inventoryId) return;
    const inventoryId = addToInventory(reel.winner);
    setReels(prev => prev.map(r => r.key === reel.key ? { ...r, inventoryId, done: true } : r));
  };

  const handleSellAll = () => {
    const pendingTotal = reels.reduce((sum, reel) => {
      if (!reel.winner || reel.inventoryId === 'sold' || reel.inventoryId) return sum;
      return sum + reel.winner.price;
    }, 0);
    if (pendingTotal > 0) addBalance(pendingTotal);
    setReels(prev => prev.map(r => (r.inventoryId ? r : { ...r, inventoryId: 'sold', done: true })));
    setResultsOpen(false);
  };

  const handleKeepAll = () => {
    keepPendingInInventory();
  };

  if (!hasHydrated) return (
    <div className="flex h-96 items-center justify-center text-center">
      <div className="card p-8">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full" style={{ background: 'rgba(249,115,22,0.22)' }} />
        <h2 className="text-xl font-bold">Kasa hazırlanıyor</h2>
      </div>
    </div>
  );

  if (!c) return (
    <div className="flex items-center justify-center h-96 text-center">
      <div>
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-3">Kasa bulunamadı</h2>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>← Kasalara Dön</Link>
      </div>
    </div>
  );

  const [from, to] = CASE_GRADS[c.id] || ['#1a1a2e', '#2d2d7a'];
  const sortedSkins = [...c.skins].sort((a, b) => {
    const ord: Rarity[] = ['extraordinary', 'covert', 'classified', 'restricted', 'milspec', 'industrial', 'consumer'];
    return ord.indexOf(a.rarity) - ord.indexOf(b.rarity);
  });
  const previewReels = Array.from({ length: qty }, (_, idx) => buildPreviewStrip(c.skins, idx));

  const unsoldValue = reels
    .filter(r => !r.inventoryId)
    .reduce((s, r) => s + (r.winner?.price ?? 0), 0);

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/case-opening-premium-bg.png')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(5,8,18,0.58) 0%, rgba(6,9,20,0.78) 32%, rgba(5,8,18,0.94) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 18%, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.08) 26%, transparent 52%), radial-gradient(circle at 78% 10%, rgba(56,189,248,0.16) 0%, transparent 30%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: 'linear-gradient(180deg, rgba(6,10,20,0.9), transparent)' }}
      />

      <div
        className="relative z-10 mx-auto py-6"
        style={{
          width: 'min(calc(100% - 3rem), 1680px)',
        }}
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:text-white transition-colors" style={{ textDecoration: 'none' }}>Kasalar</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{c.name}</span>
        </nav>

        <div className="space-y-4">
          <div
            className="relative overflow-hidden rounded-[30px] border"
            style={{
              background: `linear-gradient(135deg, rgba(8,12,24,0.88) 0%, ${from}42 46%, ${to}24 100%)`,
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 26px 80px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl" style={{ background: `${to}55` }} />
            <div className="absolute right-12 top-6 hidden opacity-25 md:block">
              <Image src={c.image} alt="" width={250} height={250} className="object-contain" unoptimized />
            </div>
            <div className="relative px-5 py-5 md:px-7 md:py-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div
                    className="hidden h-24 w-24 flex-shrink-0 items-center justify-center rounded-[26px] md:flex"
                    style={{
                      background: `linear-gradient(145deg, ${from}88, rgba(5,8,18,0.86))`,
                      border: '1px solid rgba(255,255,255,0.14)',
                      boxShadow: `0 0 44px ${to}44`,
                    }}
                  >
                    <Image src={c.image} alt={c.name} width={84} height={84} className="object-contain" unoptimized />
                  </div>
                  <div className="space-y-2">
                  <div
                    className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em]"
                    style={{ background: 'rgba(249,115,22,0.13)', color: '#fed7aa', border: '1px solid rgba(249,115,22,0.28)' }}
                  >
                    Premium Opening Arena
                  </div>
                  <div>
                    <h1 className="text-3xl font-black md:text-5xl" style={{ letterSpacing: '-0.04em' }}>
                      {c.name}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                      Neon sahne, reel odağı ve canlı sonuç paneliyle premium kasa açılışı.
                    </p>
                  </div>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
                  <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>Kasa Fiyatı</div>
                    <div className="mt-1 text-2xl font-black text-yellow-400">${c.price.toFixed(2)}</div>
                  </div>
                  <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                      {currentUser ? 'Bakiye' : 'Hesap'}
                    </div>
                    <div className="mt-1 text-2xl font-black">
                      {currentUser ? `$${balance.toFixed(2)}` : 'Giriş gerekli'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reels — only shown after clicking Open */}
          {reels.length > 0 && (
            <div className="space-y-3">
              {reels.map((reel, idx) => (
                <div
                  key={reel.key}
                  className="overflow-hidden rounded-[26px] border"
                  style={{
                    background: 'linear-gradient(180deg, rgba(8,13,26,0.92), rgba(6,9,20,0.96))',
                    borderColor: 'rgba(255,255,255,0.1)',
                    boxShadow: '0 22px 54px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  {spinning && (
                    <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <span className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>Reel {idx + 1}</span>
                      <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#f97316' }}>
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        Çevriliyor...
                      </span>
                    </div>
                  )}

                  <div
                    className="relative"
                    style={{
                      background: 'linear-gradient(180deg, rgba(10,18,34,0.88), rgba(4,8,18,0.98))',
                      paddingTop: REEL_PANEL_Y,
                      paddingBottom: REEL_PANEL_Y,
                    }}
                  >
                    <div
                      className="px-3"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `1fr ${ITEM_W + 8}px 1fr`,
                        alignItems: 'stretch',
                      }}
                    >
                      <div
                        className="overflow-hidden"
                        style={{
                          gridColumn: '1 / -1',
                          gridRow: 1,
                          height: REEL_TILE_H,
                          position: 'relative',
                        }}
                      >
                        <div
                          ref={el => { reelRefs.current[idx] = el; }}
                          className="flex"
                          style={{
                            gap: ITEM_GAP,
                            width: 'max-content',
                            willChange: 'transform',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            paddingLeft: `calc(50% - ${ITEM_W / 2}px)`,
                            paddingRight: `calc(50% - ${ITEM_W / 2}px)`,
                            transform: 'translate3d(0, 0, 0)',
                            WebkitTransform: 'translate3d(0, 0, 0)',
                          }}
                        >
                          {reel.strip.map((skin, i) => (
                            <SkinTile key={i} skin={skin} />
                          ))}
                        </div>
                      </div>

                      <div
                        className="pointer-events-none"
                        style={{
                          gridColumn: 2,
                          gridRow: 1,
                          position: 'relative',
                          zIndex: 3,
                          borderLeft: '2px solid rgba(249,115,22,0.92)',
                          borderRight: '2px solid rgba(249,115,22,0.92)',
                          borderRadius: 18,
                          background: 'linear-gradient(180deg, rgba(249,115,22,0.08), rgba(56,189,248,0.04))',
                          boxShadow: '0 0 0 1px rgba(249,115,22,0.24), 0 0 34px rgba(249,115,22,0.22)',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: '50%',
                            width: 2,
                            marginLeft: -1,
                            background: 'rgba(249,115,22,0.96)',
                            boxShadow: '0 0 8px rgba(249,115,22,0.4)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Fade edges */}
                    <div className="absolute left-3 w-24 pointer-events-none z-10"
                      style={{ top: REEL_PANEL_Y, bottom: REEL_PANEL_Y, background: 'linear-gradient(to right, rgba(4,8,18,0.98), transparent)' }} />
                    <div className="absolute right-3 w-24 pointer-events-none z-10"
                      style={{ top: REEL_PANEL_Y, bottom: REEL_PANEL_Y, background: 'linear-gradient(to left, rgba(4,8,18,0.98), transparent)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {reels.length === 0 && (
            <div className="space-y-3">
              {previewReels.map((previewStrip, idx) => (
                <div
                  key={`preview-${idx}`}
                  className="overflow-hidden rounded-[26px] border"
                  style={{
                    background: 'linear-gradient(180deg, rgba(8,13,26,0.9), rgba(5,8,18,0.96))',
                    borderColor: 'rgba(255,255,255,0.1)',
                    boxShadow: '0 22px 54px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  <div
                    className="relative flex items-center overflow-hidden px-3"
                    style={{
                      minHeight: EMPTY_REEL_H,
                      background: 'linear-gradient(180deg, rgba(10,18,34,0.84) 0%, rgba(4,8,18,0.98) 100%)',
                    }}
                  >
                    <div
                      className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2"
                      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.35) 25%, rgba(249,115,22,0.7) 50%, rgba(249,115,22,0.35) 75%, transparent 100%)' }}
                    />
                    <div
                      className="w-full"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `1fr ${ITEM_W + 8}px 1fr`,
                        alignItems: 'stretch',
                        paddingTop: REEL_PANEL_Y,
                        paddingBottom: REEL_PANEL_Y,
                      }}
                    >
                      <div
                        className="overflow-hidden"
                        style={{
                          gridColumn: '1 / -1',
                          gridRow: 1,
                          height: REEL_TILE_H,
                          position: 'relative',
                        }}
                      >
                        <div
                          className="flex"
                          style={{
                            gap: ITEM_GAP,
                            width: 'max-content',
                            paddingLeft: `calc(50% - ${ITEM_W / 2}px)`,
                            paddingRight: `calc(50% - ${ITEM_W / 2}px)`,
                          }}
                        >
                          {previewStrip.map((skin, previewIdx) => (
                            <SkinTile key={`${skin.id}-${previewIdx}`} skin={skin} />
                          ))}
                        </div>
                      </div>

                      <div
                        className="pointer-events-none"
                        style={{
                          gridColumn: 2,
                          gridRow: 1,
                          position: 'relative',
                          zIndex: 3,
                          borderLeft: '2px solid rgba(249,115,22,0.72)',
                          borderRight: '2px solid rgba(249,115,22,0.72)',
                          borderRadius: 18,
                          background: 'linear-gradient(180deg, rgba(249,115,22,0.08), rgba(56,189,248,0.04))',
                          boxShadow: '0 0 0 1px rgba(249,115,22,0.18), 0 0 28px rgba(249,115,22,0.16)',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: '50%',
                            width: 2,
                            marginLeft: -1,
                            background: 'rgba(249,115,22,0.82)',
                            boxShadow: '0 0 8px rgba(249,115,22,0.3)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="absolute left-3 w-24 pointer-events-none z-10"
                      style={{ top: REEL_PANEL_Y, bottom: REEL_PANEL_Y, background: 'linear-gradient(to right, rgba(4,8,18,0.98), transparent)' }} />
                    <div className="absolute right-3 w-24 pointer-events-none z-10"
                      style={{ top: REEL_PANEL_Y, bottom: REEL_PANEL_Y, background: 'linear-gradient(to left, rgba(4,8,18,0.98), transparent)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            className="overflow-hidden rounded-[28px] border"
            style={{
              background: 'linear-gradient(180deg, rgba(8,13,26,0.9), rgba(5,8,18,0.96))',
              borderColor: 'rgba(255,255,255,0.1)',
              boxShadow: '0 22px 64px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div>
                <span className="text-sm font-black">Açılış Kontrolleri</span>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Miktarı seç, sahneyi hazırla, kasayı aç.</div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setSoundEnabled(value => !value)}
                  disabled={spinning}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-all"
                  style={{
                    background: soundEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${soundEnabled ? 'rgba(34,197,94,0.34)' : 'rgba(255,255,255,0.08)'}`,
                    color: soundEnabled ? '#86efac' : 'var(--text-muted)',
                  }}
                >
                  <span>{soundEnabled ? '🔊' : '🔇'}</span>
                  Ses {soundEnabled ? 'Açık' : 'Kapalı'}
                </button>
                <button
                  onClick={() => setFast(f => !f)}
                  disabled={spinning}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-all"
                  style={{
                    background: fast ? 'rgba(249,115,22,0.16)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${fast ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    color: fast ? '#fb923c' : 'var(--text-muted)',
                  }}
                >
                  <span>⚡</span>
                  Hızlı Açılış {fast ? 'Açık' : 'Kapalı'}
                </button>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div
                  className="relative overflow-hidden rounded-[24px] border p-4 md:p-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full blur-3xl"
                    style={{ background: 'rgba(249,115,22,0.16)' }}
                  />
                  <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl border"
                        style={{
                          background: 'radial-gradient(circle at 50% 20%, rgba(251,191,36,0.18), rgba(15,23,42,0.85) 70%)',
                          borderColor: 'rgba(251,191,36,0.22)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                        }}
                      >
                        <Image src={c.image} alt="" width={58} height={42} className="object-contain drop-shadow-xl" unoptimized />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: '#fb923c' }}>
                          Premium Açılış
                        </div>
                        <div className="mt-1 text-lg font-black text-white">
                          {c.name}
                        </div>
                        <div className="mt-1 max-w-xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                          Sahneyi seç, açılış sayısını belirle ve drop akışına gerçek zamanlı kaydet.
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 5].map(q => (
                        <button
                          key={q}
                          onClick={() => { setQty(q); resetAll(); }}
                          disabled={spinning}
                          className="h-14 w-14 rounded-2xl px-0 text-base font-black transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
                          style={{
                            background: qty === q
                              ? 'linear-gradient(135deg, rgba(249,115,22,0.98), rgba(251,191,36,0.84))'
                              : 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))',
                            border: `1px solid ${qty === q ? 'rgba(251,146,60,0.7)' : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: qty === q ? '0 14px 34px rgba(249,115,22,0.28), inset 0 1px 0 rgba(255,255,255,0.18)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                            color: qty === q ? '#fff' : 'var(--text-secondary)',
                          }}
                        >
                          {q}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      ['Canlı kayıt', 'Kazanç üst şeride düşer'],
                      ['Güvenli akış', 'Sonuç hesapta saklanır'],
                      ['Hız kontrolü', fast ? 'Hızlı açılış aktif' : 'Standart animasyon'],
                    ].map(([title, desc]) => (
                      <div
                        key={title}
                        className="rounded-2xl border px-4 py-3"
                        style={{ background: 'rgba(0,0,0,0.22)', borderColor: 'rgba(255,255,255,0.08)' }}
                      >
                        <div className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>{title}</div>
                        <div className="mt-1 text-sm font-semibold text-white">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-[24px] border p-4"
                  style={{
                    background: 'linear-gradient(145deg, rgba(251,146,60,0.12), rgba(8,13,26,0.84) 48%, rgba(0,0,0,0.28))',
                    borderColor: 'rgba(251,146,60,0.18)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.26)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                      Açılış Maliyeti
                    </div>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-4xl font-black text-yellow-400">${cost.toFixed(2)}</span>
                      <span className="pb-1 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                        {qty} kasa
                      </span>
                    </div>
                  </div>

                  {!currentUser ? (
                    <Link
                      href="/account"
                      className="group relative mt-3 flex min-h-20 items-center justify-center overflow-hidden rounded-2xl px-6 py-4 text-center text-base font-black text-white transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 44%, #dc2626 100%)',
                        boxShadow: '0 18px 44px rgba(249,115,22,0.34)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        textDecoration: 'none',
                      }}
                    >
                      <span className="relative inline-flex items-center justify-center gap-2">
                        <Image src={c.image} alt="" width={30} height={30} className="object-contain" unoptimized />
                        Giriş Yap ve Kasa Aç
                      </span>
                    </Link>
                  ) : (
                    <button
                      onClick={allDone ? resetAll : openCase}
                      disabled={!allDone && !canOpen}
                      className="group relative mt-3 flex min-h-20 w-full items-center justify-center overflow-hidden rounded-2xl px-6 py-4 text-base font-black text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                      style={{
                        background: allDone
                          ? 'linear-gradient(135deg, #1d4ed8, #4338ca)'
                          : 'linear-gradient(135deg, #fbbf24 0%, #f97316 42%, #dc2626 100%)',
                        boxShadow: allDone
                          ? '0 16px 36px rgba(59,130,246,0.24)'
                          : '0 20px 48px rgba(249,115,22,0.38), inset 0 1px 0 rgba(255,255,255,0.22)',
                        border: '1px solid rgba(255,255,255,0.14)',
                      }}
                    >
                      <span
                        className="pointer-events-none absolute inset-0 opacity-70 transition-transform duration-500 group-hover:translate-x-8"
                        style={{ background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.3) 35%, transparent 70%)' }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        {spinning ? (
                          <>
                            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Çevriliyor...
                          </>
                        ) : allDone ? (
                          <>
                            <Image src={c.image} alt="" width={28} height={28} className="object-contain" unoptimized />
                            Tekrar Aç
                          </>
                        ) : (
                          <>
                            <Image src={c.image} alt="" width={32} height={32} className="object-contain drop-shadow-lg" unoptimized />
                            {qty > 1 ? `${qty} Kasa` : 'Kasa'} Aç - ${cost.toFixed(2)}
                          </>
                        )}
                      </span>
                    </button>
                  )}

                  {!currentUser && (
                    <p className="mt-3 text-sm leading-6 text-orange-300">
                      Kasa açmak için önce hesap oluşturman veya giriş yapman gerekir.
                    </p>
                  )}

                  {currentUser && !spinning && balance < cost && !allDone && (
                    <p className="mt-3 text-sm leading-6 text-red-400">
                      Yetersiz bakiye. Bakiye ekleme işlemi yalnızca admin panelinden yapılabilir.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Case contents */}
          <div
            className="relative overflow-hidden rounded-[28px] border p-5 md:p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(13,21,38,0.94), rgba(8,13,26,0.98))',
              borderColor: 'rgba(59,130,246,0.22)',
              boxShadow: '0 22px 58px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.9), rgba(249,115,22,0.8), transparent)' }}
            />
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.26em]" style={{ color: '#60a5fa' }}>
                  Drop Havuzu
                </div>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Kasa İçeriği
                  <span className="ml-2 text-base font-semibold" style={{ color: 'var(--text-muted)' }}>({c.skins.length} eşya)</span>
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                  En nadir ödüller öne alınır; oran, nadirlik ve fiyat her kartta görünür.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(sortedSkins.map((skin) => skin.rarity))).map(rarity => (
                  <span
                    key={rarity}
                    className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
                    style={{
                      background: `${RARITY_COLORS[rarity]}12`,
                      borderColor: `${RARITY_COLORS[rarity]}36`,
                      color: RARITY_COLORS[rarity],
                    }}
                  >
                    {RARITY_LABELS[rarity]}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sortedSkins.map(skin => {
                const clr = RARITY_COLORS[skin.rarity];
                return (
                  <div
                    key={skin.id}
                    className="group relative min-h-[126px] overflow-hidden rounded-2xl border p-3.5 transition-all hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${clr}16 0%, rgba(8,13,26,0.94) 48%, rgba(255,255,255,0.035) 100%)`,
                      borderColor: `${clr}3d`,
                      boxShadow: `inset 0 -2px 0 ${clr}70`,
                    }}
                  >
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl opacity-70"
                      style={{ background: `${clr}24` }}
                    />
                    <div className="relative flex h-full items-center gap-4">
                      <div
                        className="relative flex h-24 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(255,255,255,0.08), rgba(0,0,0,0.18) 68%)',
                          borderColor: `${clr}26`,
                        }}
                      >
                      <div
                        className="absolute left-2 top-2 rounded-full px-2 py-1 text-[9px] font-black"
                        style={{ background: 'rgba(0,0,0,0.55)', color: '#dbe4ff', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {formatChance(getCaseSkinChance(c.skins, skin, c.price))}%
                      </div>
                      <Image src={skin.image} alt={`${skin.weapon} | ${skin.name}`}
                        width={92} height={64} className="object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-110" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black" style={{ color: clr }}>{skin.weapon}</div>
                        <div className="mt-1 truncate text-sm font-bold text-white">{skin.name}</div>
                        <div className="mt-1 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{RARITY_LABELS[skin.rarity]}</div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full px-2.5 py-1 text-xs font-black text-yellow-300" style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.18)' }}>
                            ${skin.price.toFixed(2)}
                          </span>
                          <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]" style={{ background: `${clr}14`, color: clr, border: `1px solid ${clr}26` }}>
                            Drop
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {resultsOpen && allDone && reels.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-md">
          <div
            className="relative w-full overflow-hidden rounded-[24px] border"
            style={{
              maxWidth: reels.length >= 5 ? 1040 : reels.length >= 3 ? 820 : 640,
              background: 'linear-gradient(180deg, rgba(9,13,26,0.985) 0%, rgba(7,10,22,0.99) 100%)',
              borderColor: 'rgba(255,255,255,0.1)',
              boxShadow: '0 22px 70px rgba(0,0,0,0.52)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-20"
              style={{ background: 'radial-gradient(circle at top, rgba(249,115,22,0.12) 0%, rgba(59,130,246,0.08) 35%, transparent 72%)' }}
            />

            <div className="relative flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-sm font-black text-white">Açılış Sonucu</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{reels.length} eşya kazandın</div>
              </div>
              <button
                onClick={handleKeepAll}
                className="rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)' }}
              >
                Kapat
              </button>
            </div>

            <div className="max-h-[58vh] overflow-y-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {reels.map((reel) => {
                  if (!reel.winner) return null;
                  const clr = RARITY_COLORS[reel.winner.rarity];
                  const sold = reel.inventoryId === 'sold';
                  const kept = !!reel.inventoryId && reel.inventoryId !== 'sold';
                  return (
                    <div
                      key={reel.key}
                      className="overflow-hidden rounded-[18px] p-2.5"
                      style={{
                        background: `linear-gradient(180deg, rgba(255,255,255,0.02) 0%, ${clr}10 100%)`,
                        border: `1px solid ${sold ? 'rgba(255,255,255,0.08)' : `${clr}55`}`,
                        boxShadow: sold ? 'none' : `0 0 18px ${clr}1f`,
                        opacity: sold ? 0.62 : 1,
                      }}
                    >
                      <div
                        className="mb-2 flex h-16 items-center justify-center rounded-2xl px-2"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%)' }}
                      >
                        <Image
                          src={reel.winner.image}
                          alt={reel.winner.name}
                          width={64}
                          height={44}
                          className="object-contain"
                          style={{ filter: `drop-shadow(0 0 11px ${clr}66)` }}
                          unoptimized
                        />
                      </div>
                      <div className="truncate text-xs font-black leading-tight" style={{ color: clr }}>{reel.winner.weapon}</div>
                      <div className="mt-0.5 truncate text-[11px] font-semibold leading-tight" style={{ color: 'var(--text-secondary)' }}>{reel.winner.name}</div>
                      <div className="mt-1 text-xs font-black text-yellow-400">${reel.winner.price.toFixed(2)}</div>

                      <div className="mt-2 flex gap-1.5">
                        {!sold && !kept && (
                          <>
                            <button
                              onClick={() => handleSell(reel)}
                              className="flex-1 rounded-full px-2 py-2 text-xs font-black transition-all"
                              style={{ background: 'rgba(34,197,94,0.14)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.28)' }}
                            >
                              Sat
                            </button>
                            <button
                              onClick={() => handleKeep(reel)}
                              className="flex-1 rounded-full px-2 py-2 text-xs font-black transition-all"
                              style={{ background: 'rgba(59,130,246,0.14)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.28)' }}
                            >
                              Envanter
                            </button>
                          </>
                        )}
                        {sold && (
                          <div className="w-full rounded-full px-2 py-2 text-center text-xs font-bold" style={{ background: 'rgba(34,197,94,0.12)', color: '#86efac' }}>
                            Satıldı
                          </div>
                        )}
                        {kept && (
                          <div className="w-full rounded-full px-2 py-2 text-center text-xs font-bold" style={{ background: 'rgba(59,130,246,0.12)', color: '#93c5fd' }}>
                            Envantere eklendi
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex flex-wrap gap-2">
                {unsoldValue > 0 && (
                  <>
                    <button
                      onClick={handleSellAll}
                      className="rounded-full px-4 py-2.5 text-xs font-black text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', boxShadow: '0 14px 30px rgba(34,197,94,0.24)' }}
                    >
                      Hepsini Sat (${unsoldValue.toFixed(2)})
                    </button>
                    <button
                      onClick={handleKeepAll}
                      className="rounded-full px-4 py-2.5 text-xs font-black text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 14px 30px rgba(59,130,246,0.22)' }}
                    >
                      Envantere Ekle
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
