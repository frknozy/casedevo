'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { RARITY_COLORS, RARITY_LABELS, cases, Skin, Rarity } from '@/lib/data';

// Deduplicated skin list — defined outside component to avoid re-creation
const allSkins: Skin[] = Object.values(
  cases.flatMap(c => c.skins).reduce<Record<string, Skin>>((acc, s) => {
    if (!acc[s.id]) acc[s.id] = s;
    return acc;
  }, {})
).sort((a, b) => a.price - b.price);

const RARITY_ORDER: Rarity[] = ['consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert', 'extraordinary'];

interface SkinPickerProps {
  title: string;
  current: Skin | null;
  onSelect: (s: Skin) => void;
  filter?: (s: Skin) => boolean;
}

function SkinPicker({ title, current, onSelect, filter }: SkinPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const list = allSkins
    .filter(filter ?? (() => true))
    .filter(s => !search || `${s.weapon} ${s.name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{title}</h3>

      {current ? (
        <div>
          <div className="h-32 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
            style={{
              background: `${RARITY_COLORS[current.rarity]}15`,
              border: `2px solid ${RARITY_COLORS[current.rarity]}50`,
            }}>
            <Image src={current.image} alt={`${current.weapon} | ${current.name}`} width={130} height={95} className="object-contain" style={{ filter: `drop-shadow(0 0 12px ${RARITY_COLORS[current.rarity]}80)` }} unoptimized />
          </div>
          <div className="text-sm font-bold truncate" style={{ color: RARITY_COLORS[current.rarity] }}>
            {current.weapon} | {current.name}
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{RARITY_LABELS[current.rarity]}</div>
          <div className="text-2xl font-black text-yellow-400 mb-3">${current.price.toFixed(2)}</div>
          <button onClick={() => setOpen(o => !o)} className="btn-secondary w-full text-sm py-2">
            {open ? 'Close' : 'Change Skin'}
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(o => !o)}
          className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
          style={{ borderColor: open ? '#f97316' : 'var(--border)', color: 'var(--text-muted)' }}>
          <span className="text-4xl">+</span>
          <span className="text-sm font-semibold">Select Skin</span>
        </button>
      )}

      {open && (
        <div className="mt-3 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
            {list.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No skins found</div>
            ) : list.map(skin => {
              const clr = RARITY_COLORS[skin.rarity];
              const isActive = current?.id === skin.id;
              return (
                <button key={skin.id}
                  onClick={() => { onSelect(skin); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center gap-3 p-2.5 text-left transition-all"
                  style={{
                    background: isActive ? `${clr}20` : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}>
                  <Image src={skin.image} alt={skin.name} width={32} height={24} className="object-contain flex-shrink-0" unoptimized />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate" style={{ color: clr }}>{skin.weapon} | {skin.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{RARITY_LABELS[skin.rarity]}</div>
                  </div>
                  <span className="text-sm font-black text-yellow-400 flex-shrink-0">${skin.price.toFixed(2)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UpgradePage() {
  const { balance, deductBalance, addBalance, addToInventory } = useStore();
  const [inputSkin, setInputSkin] = useState<Skin | null>(null);
  const [targetSkin, setTargetSkin] = useState<Skin | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [needleAngle, setNeedleAngle] = useState(0);
  const needleRef = useRef<HTMLDivElement>(null);

  const successChance = inputSkin && targetSkin && targetSkin.price > inputSkin.price
    ? Math.min(95, Math.max(1, (inputSkin.price / targetSkin.price) * 100))
    : 0;

  const canUpgrade = !!inputSkin && !!targetSkin && targetSkin.price > inputSkin.price
    && balance >= inputSkin.price && !spinning && result === null;

  const doUpgrade = () => {
    if (!canUpgrade || !inputSkin || !targetSkin) return;
    if (!deductBalance(inputSkin.price)) return;

    setSpinning(true);
    setResult(null);

    const won = Math.random() * 100 < successChance;
    // Win zone: 0 → successChance degrees. Lose zone: successChance → 360.
    // We want needle to land in the appropriate zone.
    const finalAngle = won
      ? 360 * 6 + successChance * 0.5 * (Math.random()) // land in green zone
      : 360 * 6 + successChance + (100 - successChance) * Math.random(); // land in red zone

    setNeedleAngle(prev => prev + finalAngle);

    setTimeout(() => {
      setSpinning(false);
      setResult(won ? 'win' : 'lose');
      if (won) {
        addBalance(targetSkin.price);
        addToInventory(targetSkin);
      }
    }, 3200);
  };

  const resetUpgrade = () => {
    setResult(null);
    setInputSkin(null);
    setTargetSkin(null);
    setNeedleAngle(0);
  };

  const circumference = 2 * Math.PI * 40; // r=40

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">⬆️ Skin Upgrade</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Risk your skin for a chance at something better. The lower the value difference, the higher your chance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Input skin */}
        <SkinPicker
          title="YOUR SKIN"
          current={inputSkin}
          onSelect={s => { setInputSkin(s); setResult(null); }}
        />

        {/* Upgrade wheel */}
        <div className="card p-5 flex flex-col items-center justify-center text-center">
          {/* SVG dial */}
          <div className="relative mb-4" style={{ width: 160, height: 160 }}>
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background ring */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2d47" strokeWidth="14" />
              {/* Win arc (green) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="14"
                strokeDasharray={`${(successChance / 100) * circumference} ${circumference}`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }} />
              {/* Lose arc (red) */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="14"
                strokeDasharray={`${((100 - successChance) / 100) * circumference} ${circumference}`}
                strokeDashoffset={`${-(successChance / 100) * circumference}`}
                style={{ transition: 'all 0.5s ease' }} />
            </svg>

            {/* Needle */}
            <div className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}>
              <div className="w-1 rounded-full"
                style={{
                  height: 52,
                  background: 'white',
                  transformOrigin: 'bottom center',
                  marginTop: -4,
                  boxShadow: '0 0 6px rgba(255,255,255,0.8)',
                }} />
            </div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-white/30"
                style={{ background: 'var(--bg-card)' }} />
            </div>
          </div>

          {/* Chance display */}
          <div className="text-4xl font-black mb-1"
            style={{ color: successChance >= 50 ? '#22c55e' : successChance >= 20 ? '#f59e0b' : '#ef4444' }}>
            {successChance > 0 ? `${successChance.toFixed(1)}%` : '—'}
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Win Chance</div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-400">WIN</span>
              <span className="text-red-400">LOSE</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ef4444' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${successChance}%`, background: '#22c55e' }} />
            </div>
          </div>

          {/* Result */}
          {result === 'win' && (
            <div className="mt-4 px-4 py-2 rounded-xl text-sm font-bold animate-fade-up"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)' }}>
              🎉 You Won! +${targetSkin?.price.toFixed(2)}
            </div>
          )}
          {result === 'lose' && (
            <div className="mt-4 px-4 py-2 rounded-xl text-sm font-bold animate-fade-up"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
              💀 You Lost −${inputSkin?.price.toFixed(2)}
            </div>
          )}
        </div>

        {/* Target skin */}
        <SkinPicker
          title="TARGET SKIN"
          current={targetSkin}
          filter={s => !inputSkin || s.price > inputSkin.price}
          onSelect={s => { setTargetSkin(s); setResult(null); }}
        />
      </div>

      {/* Validation messages */}
      {inputSkin && targetSkin && targetSkin.price <= inputSkin.price && (
        <div className="mb-4 p-3 rounded-xl text-sm text-center"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          Target skin must have a higher value than your skin
        </div>
      )}
      {inputSkin && balance < inputSkin.price && (
        <div className="mb-4 p-3 rounded-xl text-sm text-center"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          Insufficient balance to upgrade this skin
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {result ? (
          <>
            <button onClick={resetUpgrade} className="btn-primary px-8 py-3">Try Again</button>
            <Link href="/inventory" className="btn-secondary px-8 py-3" style={{ textDecoration: 'none' }}>View Inventory</Link>
          </>
        ) : (
          <>
            <button onClick={doUpgrade} disabled={!canUpgrade}
              className="btn-primary px-8 py-3 text-base">
              {spinning
                ? '🎰 Upgrading...'
                : canUpgrade
                  ? `⬆️ Upgrade (${successChance.toFixed(1)}% chance)`
                  : '⬆️ Select skins to upgrade'}
            </button>
            <Link href="/" className="btn-secondary px-8 py-3" style={{ textDecoration: 'none' }}>← Back</Link>
          </>
        )}
      </div>

      {/* Info box */}
      <div className="card p-5 mt-8">
        <h3 className="font-bold mb-3">How Upgrade Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="flex gap-2"><span>1.</span><span>Select a skin you want to upgrade</span></div>
          <div className="flex gap-2"><span>2.</span><span>Choose a higher-value target skin</span></div>
          <div className="flex gap-2"><span>3.</span><span>Win chance = (input ÷ target) × 100%</span></div>
          <div className="flex gap-2"><span>4.</span><span>Win → receive target skin. Lose → skin is gone</span></div>
        </div>
      </div>
    </div>
  );
}
