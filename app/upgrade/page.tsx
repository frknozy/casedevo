'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore, InventoryItem } from '@/store/useStore';
import { RARITY_COLORS, RARITY_LABELS, cases, Skin, Rarity } from '@/lib/data';

// All site skins (deduplicated, sorted by price asc)
const siteSkins: Skin[] = Object.values(
  cases.flatMap(c => c.skins).reduce<Record<string, Skin>>((acc, s) => {
    if (!acc[s.id]) acc[s.id] = s;
    return acc;
  }, {})
).sort((a, b) => a.price - b.price);

const RARITY_ORDER: Rarity[] = ['consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert', 'extraordinary'];

function KnifeIcon({ color, size = 60 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
      style={{ filter: `drop-shadow(0 2px 10px ${color}80)` }}>
      <path d="M48 8 L16 40 L20 44 L24 48 L56 16 Z" fill={color} opacity="0.9" />
      <path d="M16 40 L12 52 L24 48 Z" fill={color} opacity="0.6" />
      <path d="M48 8 L56 16 L52 20 L44 12 Z" fill="white" opacity="0.3" />
    </svg>
  );
}

// Inventory item picker — shows user's own items
function InventoryPicker({
  current,
  onSelect,
}: {
  current: InventoryItem | null;
  onSelect: (item: InventoryItem) => void;
}) {
  const { inventory } = useStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const list = [...inventory]
    .sort((a, b) => b.price - a.price)
    .filter(i => !search || `${i.weapon} ${i.name}`.toLowerCase().includes(search.toLowerCase()));

  const clr = current ? RARITY_COLORS[current.rarity] : '#f97316';
  const isKnife = current?.weapon.startsWith('★');

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        YOUR ITEM
      </h3>

      {current ? (
        <div>
          <div className="h-32 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
            style={{
              background: `${clr}18`,
              border: `2px solid ${clr}55`,
            }}>
            {isKnife
              ? <KnifeIcon color={clr} size={72} />
              : <Image src={current.image} alt={`${current.weapon} | ${current.name}`}
                  width={130} height={95} className="object-contain"
                  style={{ filter: `drop-shadow(0 0 14px ${clr}80)` }} unoptimized />
            }
          </div>
          <div className="text-sm font-bold truncate mb-0.5" style={{ color: clr }}>
            {current.weapon} | {current.name}
          </div>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {RARITY_LABELS[current.rarity]}{current.wear ? ` · ${current.wear}` : ''}
          </div>
          <div className="text-2xl font-black text-yellow-400 mb-3">${current.price.toFixed(2)}</div>
          <div className="p-2 rounded-lg text-xs mb-3"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
            ⚠️ This item will be wagered — you lose it if you fail
          </div>
          <button onClick={() => setOpen(o => !o)} className="btn-secondary w-full text-sm py-2">
            {open ? 'Close' : 'Change Item'}
          </button>
        </div>
      ) : (
        <>
          {inventory.length === 0 ? (
            <div className="h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <span className="text-3xl">📦</span>
              <span className="text-sm font-semibold">No items in inventory</span>
              <Link href="/" className="text-xs mt-1"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Open cases →
              </Link>
            </div>
          ) : (
            <button onClick={() => setOpen(o => !o)}
              className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
              style={{ borderColor: open ? '#f97316' : 'var(--border)', color: 'var(--text-muted)' }}>
              <span className="text-4xl">🎒</span>
              <span className="text-sm font-semibold">Select from inventory</span>
              <span className="text-xs opacity-70">{inventory.length} item{inventory.length !== 1 ? 's' : ''} available</span>
            </button>
          )}
        </>
      )}

      {open && inventory.length > 0 && (
        <div className="mt-3 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search inventory…"
              className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
            {list.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No items found</div>
            ) : list.map(item => {
              const c = RARITY_COLORS[item.rarity];
              const active = current?.inventoryId === item.inventoryId;
              const knife = item.weapon.startsWith('★');
              return (
                <button key={item.inventoryId}
                  onClick={() => { onSelect(item); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center gap-3 p-2.5 text-left transition-all"
                  style={{
                    background: active ? `${c}18` : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: `3px solid ${c}`,
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
                  <div className="w-9 h-7 flex items-center justify-center flex-shrink-0">
                    {knife
                      ? <KnifeIcon color={c} size={26} />
                      : <Image src={item.image} alt={item.name} width={36} height={27}
                          className="object-contain" unoptimized />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate" style={{ color: c }}>
                      {item.weapon} | {item.name}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {RARITY_LABELS[item.rarity]}
                    </div>
                  </div>
                  <span className="text-sm font-black text-yellow-400 flex-shrink-0">
                    ${item.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Site catalog picker — for the target skin
function TargetPicker({
  current,
  minPrice,
  onSelect,
}: {
  current: Skin | null;
  minPrice: number;
  onSelect: (s: Skin) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');

  const list = siteSkins
    .filter(s => s.price > minPrice)
    .filter(s => rarityFilter === 'all' || s.rarity === rarityFilter)
    .filter(s => !search || `${s.weapon} ${s.name}`.toLowerCase().includes(search.toLowerCase()));

  const clr = current ? RARITY_COLORS[current.rarity] : '#f97316';
  const isKnife = current?.weapon.startsWith('★');

  const raritiesAvailable: Rarity[] = RARITY_ORDER.filter(r =>
    siteSkins.some(s => s.price > minPrice && s.rarity === r)
  );

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        TARGET SKIN
      </h3>

      {current ? (
        <div>
          <div className="h-32 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
            style={{
              background: `${clr}18`,
              border: `2px solid ${clr}55`,
            }}>
            {isKnife
              ? <KnifeIcon color={clr} size={72} />
              : <Image src={current.image} alt={`${current.weapon} | ${current.name}`}
                  width={130} height={95} className="object-contain"
                  style={{ filter: `drop-shadow(0 0 14px ${clr}80)` }} unoptimized />
            }
          </div>
          <div className="text-sm font-bold truncate mb-0.5" style={{ color: clr }}>
            {current.weapon} | {current.name}
          </div>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {RARITY_LABELS[current.rarity]}{current.wear ? ` · ${current.wear}` : ''}
          </div>
          <div className="text-2xl font-black text-yellow-400 mb-3">${current.price.toFixed(2)}</div>
          <button onClick={() => setOpen(o => !o)} className="btn-secondary w-full text-sm py-2">
            {open ? 'Close' : 'Change Skin'}
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(o => !o)}
          className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
          style={{ borderColor: open ? '#f97316' : 'var(--border)', color: 'var(--text-muted)' }}>
          <span className="text-4xl">🎯</span>
          <span className="text-sm font-semibold">Select target skin</span>
          <span className="text-xs opacity-70">
            {minPrice > 0 ? `Must be worth more than $${minPrice.toFixed(2)}` : 'Choose any skin'}
          </span>
        </button>
      )}

      {open && (
        <div className="mt-3 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search skins…"
              className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none mb-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setRarityFilter('all')}
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: rarityFilter === 'all' ? '#f9731620' : 'transparent', color: rarityFilter === 'all' ? '#f97316' : 'var(--text-muted)', border: `1px solid ${rarityFilter === 'all' ? '#f9731655' : 'var(--border)'}` }}>
                All
              </button>
              {raritiesAvailable.map(r => {
                const c = RARITY_COLORS[r];
                const active = rarityFilter === r;
                return (
                  <button key={r} onClick={() => setRarityFilter(r)}
                    className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                    style={{ background: active ? `${c}20` : 'transparent', color: active ? c : 'var(--text-muted)', border: `1px solid ${active ? c + '55' : 'var(--border)'}` }}>
                    {RARITY_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
            {list.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No skins available{minPrice > 0 ? ` above $${minPrice.toFixed(2)}` : ''}
              </div>
            ) : list.map(skin => {
              const c = RARITY_COLORS[skin.rarity];
              const active = current?.id === skin.id;
              const knife = skin.weapon.startsWith('★');
              return (
                <button key={skin.id}
                  onClick={() => { onSelect(skin); setOpen(false); setSearch(''); setRarityFilter('all'); }}
                  className="w-full flex items-center gap-3 p-2.5 text-left transition-all"
                  style={{
                    background: active ? `${c}18` : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: `3px solid ${c}`,
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
                  <div className="w-9 h-7 flex items-center justify-center flex-shrink-0">
                    {knife
                      ? <KnifeIcon color={c} size={26} />
                      : <Image src={skin.image} alt={skin.name} width={36} height={27} className="object-contain" unoptimized />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate" style={{ color: c }}>{skin.weapon} | {skin.name}</div>
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
  const { addToInventory, removeItem } = useStore();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [targetSkin, setTargetSkin] = useState<Skin | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [wonSkin, setWonSkin] = useState<Skin | null>(null);
  const [needleAngle, setNeedleAngle] = useState(0);

  const winChance = selectedItem && targetSkin && targetSkin.price > selectedItem.price
    ? Math.min(95, Math.max(1, (selectedItem.price / targetSkin.price) * 100))
    : 0;

  const multiplier = selectedItem && targetSkin && targetSkin.price > selectedItem.price
    ? (targetSkin.price / selectedItem.price)
    : 0;

  const canUpgrade = !!selectedItem && !!targetSkin
    && targetSkin.price > selectedItem.price
    && !spinning && result === null;

  const doUpgrade = () => {
    if (!canUpgrade || !selectedItem || !targetSkin) return;

    const won = Math.random() * 100 < winChance;

    // Convert win chance % → degrees. Green arc: 0° → winDegrees. Red: winDegrees → 360°.
    const winDegrees = (winChance / 100) * 360;
    const fullSpins = (6 + Math.floor(Math.random() * 3)) * 360;
    const landAngle = won
      ? winDegrees * 0.1 + Math.random() * winDegrees * 0.8  // safely inside green zone
      : winDegrees + 5 + Math.random() * (360 - winDegrees - 10);  // safely inside red zone

    // Remove item from inventory immediately — it's been wagered
    removeItem(selectedItem.inventoryId);
    setSelectedItem(null);

    setSpinning(true);
    setResult(null);
    setNeedleAngle(prev => prev + fullSpins + landAngle);

    setTimeout(() => {
      setSpinning(false);
      setResult(won ? 'win' : 'lose');
      if (won) {
        addToInventory(targetSkin);
        setWonSkin(targetSkin);
      }
    }, 3400);
  };

  const reset = () => {
    setResult(null);
    setWonSkin(null);
    setTargetSkin(null);
    setNeedleAngle(prev => prev % 360); // snap to landing position without animation
  };

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="max-w-[980px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Skin Upgrade</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Wager an item from your inventory for a chance to win a better skin. You lose the item either way.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Left: Inventory picker */}
        <InventoryPicker
          current={selectedItem}
          onSelect={item => { setSelectedItem(item); setResult(null); setWonSkin(null); }}
        />

        {/* Center: Wheel */}
        <div className="card p-5 flex flex-col items-center text-center">
          {/* Dial */}
          <div className="relative mb-4" style={{ width: 164, height: 164 }}>
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Track */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2d47" strokeWidth="14" />
              {/* Win arc */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="14"
                strokeDasharray={`${(winChance / 100) * circumference} ${circumference}`}
                style={{ transition: 'stroke-dasharray 0.6s ease' }} />
              {/* Lose arc */}
              {winChance > 0 && (
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="14"
                  strokeDasharray={`${((100 - winChance) / 100) * circumference} ${circumference}`}
                  strokeDashoffset={`${-(winChance / 100) * circumference}`}
                  style={{ transition: 'all 0.6s ease' }} />
              )}
            </svg>

            {/* Needle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transition: spinning ? 'transform 3.4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}>
              <div style={{
                width: 4,
                height: 54,
                background: 'linear-gradient(to bottom, white, rgba(255,255,255,0.4))',
                borderRadius: '2px 2px 0 0',
                transformOrigin: 'bottom center',
                marginTop: -4,
                boxShadow: '0 0 8px rgba(255,255,255,0.6)',
              }} />
            </div>

            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 rounded-full border-2 border-white/20"
                style={{ background: 'var(--bg-card)', boxShadow: '0 0 0 3px rgba(0,0,0,0.5)' }} />
            </div>

            {/* Win/lose marker at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rotate-45"
              style={{ background: '#f97316', boxShadow: '0 0 8px #f97316' }} />
          </div>

          {/* Stats */}
          <div className="text-5xl font-black mb-1 leading-none"
            style={{ color: winChance >= 50 ? '#22c55e' : winChance >= 20 ? '#f59e0b' : winChance > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            {winChance > 0 ? `${winChance.toFixed(1)}%` : '—'}
          </div>
          <div className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            WIN CHANCE
          </div>

          {/* Progress bar */}
          <div className="w-full mb-4">
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-green-400">WIN</span>
              <span className="text-red-400">LOSE</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: winChance > 0 ? '#ef4444' : '#1e2d47' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${winChance}%`, background: '#22c55e' }} />
            </div>
          </div>

          {/* Value comparison */}
          {selectedItem && targetSkin && targetSkin.price > selectedItem.price && (
            <div className="w-full p-3 rounded-xl mb-4 text-sm"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-center">
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>WAGER</div>
                  <div className="font-black text-red-400">${selectedItem.price.toFixed(2)}</div>
                </div>
                <div className="text-lg font-black" style={{ color: 'var(--text-muted)' }}>→</div>
                <div className="text-center">
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>WIN</div>
                  <div className="font-black text-green-400">${targetSkin.price.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>MULT</div>
                  <div className="font-black text-yellow-400">{multiplier.toFixed(2)}×</div>
                </div>
              </div>
            </div>
          )}

          {/* Result overlay */}
          {result === 'win' && wonSkin && (
            <div className="w-full animate-fade-up">
              <div className="p-3 rounded-xl mb-3 text-sm font-bold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)' }}>
                🎉 You won {wonSkin.weapon} | {wonSkin.name}!
              </div>
            </div>
          )}
          {result === 'lose' && (
            <div className="w-full animate-fade-up">
              <div className="p-3 rounded-xl mb-3 text-sm font-bold"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                💀 Better luck next time
              </div>
            </div>
          )}
        </div>

        {/* Right: Target skin picker */}
        <TargetPicker
          current={targetSkin}
          minPrice={selectedItem?.price ?? 0}
          onSelect={s => { setTargetSkin(s); setResult(null); setWonSkin(null); }}
        />
      </div>

      {/* Validation hint */}
      {selectedItem && targetSkin && targetSkin.price <= selectedItem.price && (
        <div className="mb-4 p-3 rounded-xl text-sm text-center"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          Target skin must be worth more than your wagered item
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {result ? (
          <>
            <button onClick={reset} className="btn-primary px-8 py-3">Try Again</button>
            <Link href="/inventory" className="btn-secondary px-8 py-3" style={{ textDecoration: 'none' }}>
              View Inventory
            </Link>
          </>
        ) : (
          <>
            <button onClick={doUpgrade} disabled={!canUpgrade}
              className="btn-primary px-8 py-3 text-base">
              {spinning
                ? '🎰 Upgrading...'
                : canUpgrade
                  ? `Upgrade — ${winChance.toFixed(1)}% chance`
                  : 'Select item & target to upgrade'}
            </button>
            <Link href="/" className="btn-secondary px-8 py-3" style={{ textDecoration: 'none' }}>← Back</Link>
          </>
        )}
      </div>

      {/* How it works */}
      <div className="card p-5 mt-8">
        <h3 className="font-bold mb-3">How Upgrade Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="flex gap-2"><span className="text-orange-400 font-bold">1.</span><span>Pick an item from your inventory to wager</span></div>
          <div className="flex gap-2"><span className="text-orange-400 font-bold">2.</span><span>Choose a higher-value skin as the target</span></div>
          <div className="flex gap-2"><span className="text-orange-400 font-bold">3.</span><span>Win chance = (wager ÷ target) × 100%, max 95%</span></div>
          <div className="flex gap-2"><span className="text-orange-400 font-bold">4.</span><span>Win → target added to inventory. Lose → item is gone</span></div>
        </div>
      </div>
    </div>
  );
}
