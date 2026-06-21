'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore, InventoryItem } from '@/store/useStore';
import { applyCaseOverrides, RARITY_COLORS, RARITY_LABELS, cases, Skin, Rarity } from '@/lib/data';

function buildSiteSkins(sourceCases = cases): Skin[] {
  return Object.values(sourceCases.flatMap(c => c.skins).reduce<Record<string, Skin>>((acc, s) => {
    if (!acc[s.id]) acc[s.id] = s;
    return acc;
  }, {})).sort((a, b) => a.price - b.price);
}

const RARITY_ORDER: Rarity[] = ['consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert', 'extraordinary'];
const UPGRADE_RETURN_RATE = 0.72;
const MAX_UPGRADE_CHANCE = 72;

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

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        EŞYAN
      </h3>

      {current ? (
        <div>
          <div className="h-32 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
            style={{
              background: `${clr}18`,
              border: `2px solid ${clr}55`,
            }}>
            <Image src={current.image} alt={`${current.weapon} | ${current.name}`}
              width={130} height={95} className="object-contain"
              style={{ filter: `drop-shadow(0 0 14px ${clr}80)` }} unoptimized />
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
            ⚠️ Bu eşya riske atılacak - başarısız olursan kaybedersin
          </div>
          <button onClick={() => setOpen(o => !o)} className="btn-secondary w-full text-sm py-2">
            {open ? 'Kapat' : 'Eşyayı Değiştir'}
          </button>
        </div>
      ) : (
        <>
          {inventory.length === 0 ? (
            <div className="h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <span className="text-3xl">📦</span>
              <span className="text-sm font-semibold">Envanterde eşya yok</span>
              <Link href="/" className="text-xs mt-1"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Kasa aç →
              </Link>
            </div>
          ) : (
            <button onClick={() => setOpen(o => !o)}
              className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
              style={{ borderColor: open ? '#f97316' : 'var(--border)', color: 'var(--text-muted)' }}>
              <span className="text-4xl">🎒</span>
              <span className="text-sm font-semibold">Envanterden seç</span>
              <span className="text-xs opacity-70">{inventory.length} eşya mevcut</span>
            </button>
          )}
        </>
      )}

      {open && inventory.length > 0 && (
        <div className="mt-3 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Envanterde ara..."
              className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
            {list.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Eşya bulunamadı</div>
            ) : list.map(item => {
              const c = RARITY_COLORS[item.rarity];
              const active = current?.inventoryId === item.inventoryId;
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
                    <Image src={item.image} alt={item.name} width={36} height={27}
                      className="object-contain" unoptimized />
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
  siteSkins,
  onSelect,
}: {
  current: Skin | null;
  minPrice: number;
  siteSkins: Skin[];
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

  const raritiesAvailable: Rarity[] = RARITY_ORDER.filter(r =>
    siteSkins.some(s => s.price > minPrice && s.rarity === r)
  );

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
        HEDEF SKIN
      </h3>

      {current ? (
        <div>
          <div className="h-32 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
            style={{
              background: `${clr}18`,
              border: `2px solid ${clr}55`,
            }}>
            <Image src={current.image} alt={`${current.weapon} | ${current.name}`}
              width={130} height={95} className="object-contain"
              style={{ filter: `drop-shadow(0 0 14px ${clr}80)` }} unoptimized />
          </div>
          <div className="text-sm font-bold truncate mb-0.5" style={{ color: clr }}>
            {current.weapon} | {current.name}
          </div>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {RARITY_LABELS[current.rarity]}{current.wear ? ` · ${current.wear}` : ''}
          </div>
          <div className="text-2xl font-black text-yellow-400 mb-3">${current.price.toFixed(2)}</div>
          <button onClick={() => setOpen(o => !o)} className="btn-secondary w-full text-sm py-2">
            {open ? 'Kapat' : 'Skin Değiştir'}
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(o => !o)}
          className="w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
          style={{ borderColor: open ? '#f97316' : 'var(--border)', color: 'var(--text-muted)' }}>
          <span className="text-4xl">🎯</span>
          <span className="text-sm font-semibold">Hedef skin seç</span>
          <span className="text-xs opacity-70">
            {minPrice > 0 ? `$${minPrice.toFixed(2)} değerinden yüksek olmalı` : 'Herhangi bir skin seç'}
          </span>
        </button>
      )}

      {open && (
        <div className="mt-3 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Skin ara..."
              className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none mb-2"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setRarityFilter('all')}
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: rarityFilter === 'all' ? '#f9731620' : 'transparent', color: rarityFilter === 'all' ? '#f97316' : 'var(--text-muted)', border: `1px solid ${rarityFilter === 'all' ? '#f9731655' : 'var(--border)'}` }}>
                Tümü
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
                {minPrice > 0 ? `$${minPrice.toFixed(2)} üzerinde skin bulunamadı` : 'Uygun skin bulunamadı'}
              </div>
            ) : list.map(skin => {
              const c = RARITY_COLORS[skin.rarity];
              const active = current?.id === skin.id;
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
                    <Image src={skin.image} alt={skin.name} width={36} height={27} className="object-contain" unoptimized />
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
  const { addToInventory, removeItem, caseOverrides, recordUpgrade, currentUser, currentUserId, hasHydrated } = useStore();
  
  const managedCases = useMemo(() => applyCaseOverrides(cases, caseOverrides), [caseOverrides]);
  const siteSkins = useMemo(() => buildSiteSkins(managedCases), [managedCases]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [targetSkin, setTargetSkin] = useState<Skin | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [wonSkin, setWonSkin] = useState<Skin | null>(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [spinChance, setSpinChance] = useState(0);

  const winChance = selectedItem && targetSkin && targetSkin.price > selectedItem.price
    ? Math.min(MAX_UPGRADE_CHANCE, Math.max(0.5, (selectedItem.price / targetSkin.price) * 100 * UPGRADE_RETURN_RATE))
    : 0;

  const multiplier = selectedItem && targetSkin && targetSkin.price > selectedItem.price
    ? (targetSkin.price / selectedItem.price)
    : 0;

  const canUpgrade = !!selectedItem && !!targetSkin
    && targetSkin.price > selectedItem.price
    && !spinning && result === null;
  const wheelChance = spinning || result ? spinChance : winChance;
  const wheelRadius = 64;
  const wheelCircumference = 2 * Math.PI * wheelRadius;
  const wheelGreenLength = (wheelChance / 100) * wheelCircumference;
  const wheelRedLength = Math.max(0, wheelCircumference - wheelGreenLength);
  const currentActivities = useMemo(() => currentUser?.activities ?? [], [currentUser?.activities]);

  const upgradeHistory = useMemo(
    () => currentActivities.filter((item) => item.type === 'upgrade').slice(0, 4),
    [currentActivities]
  );

  const upgradeSummary = useMemo(() => {
    const upgrades = currentActivities.filter((item) => item.type === 'upgrade');
    const wins = upgrades.filter((item) => (item.amount ?? 0) > 0 || item.message.includes('kazanıldı')).length;
    const losses = upgrades.length - wins;
    const net = upgrades.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { total: upgrades.length, wins, losses, net };
  }, [currentActivities]);

  const suggestedTargets = useMemo(() => {
    if (!selectedItem) return [];

    const presets = [
      { label: 'Güvenli', mult: 1.5 },
      { label: 'Keskin', mult: 2.2 },
      { label: 'YOLO', mult: 3.5 },
    ];

    return presets.map((preset) => {
      const targetPrice = selectedItem.price * preset.mult;
      const skin = siteSkins.find((candidate) => candidate.price >= targetPrice);
      return skin ? { ...preset, skin } : null;
    }).filter(Boolean) as Array<{ label: string; mult: number; skin: Skin }>;
  }, [selectedItem, siteSkins]);

  const doUpgrade = () => {
    if (!canUpgrade || !selectedItem || !targetSkin) return;

    const wageredItem = selectedItem;
    const upgradedSkin = targetSkin;
    const currentChance = winChance;
    const winDegrees = (currentChance / 100) * 360;
    const landAngle = Math.random() * 360;
    const won = landAngle < winDegrees;
    const fullSpins = (6 + Math.floor(Math.random() * 3)) * 360;

    // Remove the wagered item before the result animation completes.
    removeItem(wageredItem.inventoryId);
    setSelectedItem(null);

    setSpinning(true);
    setResult(null);
    setSpinChance(currentChance);
    setWheelAngle((prev) => {
      const currentModulo = ((prev % 360) + 360) % 360;
      const targetModulo = (360 - landAngle) % 360;
      const delta = (targetModulo - currentModulo + 360) % 360;
      return prev + fullSpins + delta;
    });

    setTimeout(() => {
      setSpinning(false);
      setResult(won ? 'win' : 'lose');
      if (won) {
        addToInventory(upgradedSkin);
        setWonSkin(upgradedSkin);
      }
      const netValue = won ? upgradedSkin.price - wageredItem.price : -wageredItem.price;
      recordUpgrade(
        won,
        won
          ? `${upgradedSkin.weapon} | ${upgradedSkin.name} yükseltmesi kazanıldı`
          : `${wageredItem.weapon} | ${wageredItem.name} yükseltmesi başarısız oldu`,
        netValue
      );
    }, 3400);
  };

  const reset = () => {
    setResult(null);
    setWonSkin(null);
    setTargetSkin(null);
    setSpinChance(0);
    setWheelAngle(prev => prev % 360);
  };

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12 text-center">
        <div className="card p-10">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full" style={{ background: 'rgba(249,115,22,0.22)' }} />
          <h1 className="text-3xl font-black">Yükseltme hazırlanıyor</h1>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12 text-center">
        <div className="card p-10">
          <h1 className="text-3xl font-black">Yükseltme için giriş yap</h1>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
            Envanterindeki eşyaları kullanarak yükseltme denemesi yapmak için kayıtlı hesap gerekir.
          </p>
          <Link href="/account" className="btn-primary mt-6" style={{ textDecoration: 'none' }}>Giriş / Kayıt</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 pb-8 pt-10"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(4,8,18,0.88), rgba(4,8,18,0.96)), radial-gradient(circle at 50% 24%, rgba(249,115,22,0.12), transparent 38%), url('/upgrade-premium-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.7), rgba(34,197,94,0.55), transparent)' }} />
      <div className="relative mx-auto max-w-[1180px]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em]"
              style={{ background: 'rgba(249,115,22,0.13)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>
              Upgrade Arena
            </div>
            <h1 className="text-3xl font-black text-white">Skin Yükselt</h1>
          </div>
          <div
            className="hidden min-w-[280px] max-w-[360px] rounded-2xl border p-3 md:block"
            style={{
              background: 'linear-gradient(180deg, rgba(12,18,34,0.86), rgba(6,10,22,0.78))',
              borderColor: 'rgba(255,255,255,0.09)',
              boxShadow: '0 14px 34px rgba(0,0,0,0.22)',
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                Arena Geçmişi
              </div>
              <div
                className="rounded-full px-2 py-0.5 text-[10px] font-black"
                style={{
                  color: upgradeSummary.net >= 0 ? '#22c55e' : '#ef4444',
                  background: upgradeSummary.net >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${upgradeSummary.net >= 0 ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.28)'}`,
                }}
              >
                {upgradeSummary.net >= 0 ? '+' : ''}${upgradeSummary.net.toFixed(2)}
              </div>
            </div>
            <div className="mb-2 grid grid-cols-3 gap-2 text-center">
              {[
                ['Deneme', upgradeSummary.total.toString(), '#f97316'],
                ['Kazanç', upgradeSummary.wins.toString(), '#22c55e'],
                ['Kayıp', upgradeSummary.losses.toString(), '#ef4444'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-xl px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{label}</div>
                  <div className="text-sm font-black" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {upgradeHistory.length === 0 ? (
                <div className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>Henüz yükseltme yok</div>
              ) : upgradeHistory.map((item) => {
                const wonItem = (item.amount ?? 0) > 0 || item.message.includes('kazanıldı');
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="min-w-0 truncate" style={{ color: wonItem ? '#86efac' : '#fca5a5' }}>
                      {wonItem ? 'Kazandı' : 'Kaybetti'} · {item.message}
                    </span>
                    <span className="shrink-0 font-black" style={{ color: (item.amount ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                      {(item.amount ?? 0) >= 0 ? '+' : ''}${(item.amount ?? 0).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Left: Inventory picker */}
        <InventoryPicker
          current={selectedItem}
          onSelect={item => { setSelectedItem(item); setResult(null); setWonSkin(null); }}
        />

        {/* Center: Wheel */}
        <div className="card p-5 flex flex-col items-center text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(12,18,34,0.92), rgba(6,10,22,0.95))',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 22px 60px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
          {/* Dial */}
          <div className="relative mb-4" style={{ width: 164, height: 164 }}>
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                filter: 'drop-shadow(0 0 22px rgba(0,0,0,0.45))',
                transform: `rotate(${wheelAngle}deg)`,
                transition: spinning
                  ? 'transform 3.4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                  : undefined,
              }}
            >
              <svg width="164" height="164" viewBox="0 0 164 164" aria-hidden="true">
                <circle
                  cx="82"
                  cy="82"
                  r={wheelRadius}
                  fill="none"
                  stroke="rgba(31,45,71,0.95)"
                  strokeWidth="28"
                />
                {wheelChance > 0 && (
                  <>
                    <circle
                      cx="82"
                      cy="82"
                      r={wheelRadius}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="28"
                      strokeDasharray={`${wheelGreenLength} ${wheelRedLength}`}
                      strokeDashoffset="0"
                      strokeLinecap="butt"
                      transform="rotate(-90 82 82)"
                    />
                    <circle
                      cx="82"
                      cy="82"
                      r={wheelRadius}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="28"
                      strokeDasharray={`${wheelRedLength} ${wheelGreenLength}`}
                      strokeDashoffset={-wheelGreenLength}
                      strokeLinecap="butt"
                      transform="rotate(-90 82 82)"
                    />
                  </>
                )}
              </svg>
            </div>
            <div className="absolute inset-[16px] rounded-full" style={{ background: 'var(--bg-card)', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.65)' }} />
            <div className="absolute inset-[34px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(15,23,42,0.95), rgba(5,8,18,0.98))' }} />

            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 rounded-full border-2 border-white/20"
                style={{ background: 'var(--bg-card)', boxShadow: '0 0 0 3px rgba(0,0,0,0.5)' }} />
            </div>

            <div
              className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 -translate-y-2"
              style={{
                borderLeft: '9px solid transparent',
                borderRight: '9px solid transparent',
                borderTop: '18px solid #f97316',
                filter: 'drop-shadow(0 0 9px rgba(249,115,22,0.95))',
              }}
            />
          </div>

          {/* Stats */}
          <div className="text-5xl font-black mb-1 leading-none"
            style={{ color: wheelChance >= 50 ? '#22c55e' : wheelChance >= 20 ? '#f59e0b' : wheelChance > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            {wheelChance > 0 ? `${wheelChance.toFixed(1)}%` : '—'}
          </div>
          <div className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            KAZANMA ŞANSI
          </div>

          {/* Progress bar */}
          <div className="w-full mb-4">
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-green-400">KAZAN</span>
              <span className="text-red-400">KAYBET</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: wheelChance > 0 ? '#ef4444' : '#1e2d47' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${wheelChance}%`, background: '#22c55e' }} />
            </div>
          </div>

          {/* Value comparison */}
          {selectedItem && targetSkin && targetSkin.price > selectedItem.price && (
            <div className="w-full p-3 rounded-xl mb-4 text-sm"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-center">
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>RİSK</div>
                  <div className="font-black text-red-400">${selectedItem.price.toFixed(2)}</div>
                </div>
                <div className="text-lg font-black" style={{ color: 'var(--text-muted)' }}>→</div>
                <div className="text-center">
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>KAZANÇ</div>
                  <div className="font-black text-green-400">${targetSkin.price.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>ÇARPAN</div>
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
                🎉 {wonSkin.weapon} | {wonSkin.name} kazandın!
              </div>
            </div>
          )}
          {result === 'lose' && (
            <div className="w-full animate-fade-up">
              <div className="p-3 rounded-xl mb-3 text-sm font-bold"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                💀 Bir dahaki sefere
              </div>
            </div>
          )}
        </div>

        {/* Right: Target skin picker */}
        <TargetPicker
          current={targetSkin}
          minPrice={selectedItem?.price ?? 0}
          siteSkins={siteSkins}
          onSelect={s => { setTargetSkin(s); setResult(null); setWonSkin(null); }}
        />
      </div>

      {/* Validation hint */}
      {selectedItem && targetSkin && targetSkin.price <= selectedItem.price && (
        <div className="mb-4 p-3 rounded-xl text-sm text-center"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          Hedef skin, riske attığın eşyadan daha değerli olmalı
        </div>
      )}

      {selectedItem && suggestedTargets.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div>
              <div className="text-xs font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>HIZLI HEDEFLER</div>
              <div className="text-lg font-black">Hızlı risk seçimleri</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedTargets.map((preset) => {
              const clr = RARITY_COLORS[preset.skin.rarity];
              const active = targetSkin?.id === preset.skin.id;
              return (
                <button
                  key={preset.label}
                  onClick={() => { setTargetSkin(preset.skin); setResult(null); setWonSkin(null); }}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background: active ? `${clr}18` : 'var(--bg-secondary)',
                    border: `1px solid ${active ? clr : 'var(--border)'}`,
                    boxShadow: active ? `0 0 18px ${clr}22` : 'none',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black" style={{ color: clr }}>{preset.label}</span>
                    <span className="text-xs font-bold text-yellow-400">{preset.mult.toFixed(1)}x</span>
                  </div>
                  <div className="text-sm font-bold truncate">{preset.skin.weapon}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{preset.skin.name}</div>
                  <div className="mt-2 text-sm font-black" style={{ color: clr }}>${preset.skin.price.toFixed(2)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {result ? (
          <>
            <button onClick={reset} className="btn-primary px-8 py-3">Tekrar Dene</button>
            <Link href="/inventory" className="btn-secondary px-8 py-3" style={{ textDecoration: 'none' }}>
              Envanteri Gör
            </Link>
          </>
        ) : (
          <>
            <button onClick={doUpgrade} disabled={!canUpgrade}
              className="btn-primary px-8 py-3 text-base">
              {spinning
                ? '🎰 Yükseltiliyor...'
                : canUpgrade
                  ? `Yükselt - %${winChance.toFixed(1)} şans`
                  : 'Yükseltmek için eşya ve hedef seç'}
            </button>
            <Link href="/" className="btn-secondary px-8 py-3" style={{ textDecoration: 'none' }}>← Geri</Link>
          </>
        )}
      </div>

      </div>
    </div>
  );
}
