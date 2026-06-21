'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore, InventoryItem } from '@/store/useStore';
import { RARITY_COLORS, RARITY_LABELS, Rarity } from '@/lib/data';

type SortOpt = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'rarity';

const RARITY_ORDER: Rarity[] = ['extraordinary', 'covert', 'classified', 'restricted', 'milspec', 'industrial', 'consumer'];

export default function InventoryPage() {
  const { inventory, balance, sellItem, sellSelected, sellAll, currentUser, currentUserId, hasHydrated } = useStore();
  
  const [sort, setSort] = useState<SortOpt>('newest');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    let res = [...inventory];
    if (rarityFilter !== 'all') res = res.filter(i => i.rarity === rarityFilter);
    if (search.trim()) res = res.filter(i =>
      `${i.weapon} ${i.name}`.toLowerCase().includes(search.toLowerCase())
    );
    switch (sort) {
      case 'newest':     res.sort((a, b) => b.openedAt.localeCompare(a.openedAt)); break;
      case 'oldest':     res.sort((a, b) => a.openedAt.localeCompare(b.openedAt)); break;
      case 'price-high': res.sort((a, b) => b.price - a.price); break;
      case 'price-low':  res.sort((a, b) => a.price - b.price); break;
      case 'rarity':     res.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)); break;
    }
    return res;
  }, [inventory, sort, rarityFilter, search]);

  const totalValue = inventory.reduce((s, i) => s + i.price, 0);
  const selectedList = sorted.filter(i => selected.has(i.inventoryId));
  const selectedValue = selectedList.reduce((s, i) => s + i.price, 0);
  const bestItem = inventory.reduce<InventoryItem | null>((best, i) => (!best || i.price > best.price) ? i : best, null);
  const raritiesPresent = ['all', ...RARITY_ORDER.filter(r => inventory.some(i => i.rarity === r))];

  const toggleSelect = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (selected.size === sorted.length && sorted.length > 0) setSelected(new Set());
    else setSelected(new Set(sorted.map(i => i.inventoryId)));
  };

  const handleSellSelected = () => {
    sellSelected([...selected]);
    setSelected(new Set());
  };

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12 text-center">
        <div className="card p-10">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full" style={{ background: 'rgba(249,115,22,0.22)' }} />
          <h1 className="text-3xl font-black">Envanter hazırlanıyor</h1>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12 text-center">
        <div className="card p-10">
          <h1 className="text-3xl font-black">Envanter için giriş yap</h1>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
            Kazandığın skinleri, bakiye bilgisini ve satış işlemlerini görmek için kayıtlı hesap gerekir.
          </p>
          <Link href="/account" className="btn-primary mt-6" style={{ textDecoration: 'none' }}>Giriş / Kayıt</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1">Envanter</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {inventory.length} eşya · Toplam değer&nbsp;
            <span className="text-yellow-400 font-bold">${totalValue.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selected.size > 0 && (
            <button onClick={handleSellSelected} className="btn-green text-sm">
              💰 Seçilenleri Sat (${selectedValue.toFixed(2)})
            </button>
          )}
          {inventory.length > 0 && (
            <button onClick={() => { sellAll(); setSelected(new Set()); }} className="btn-secondary text-sm">
              Tümünü Sat (${totalValue.toFixed(2)})
            </button>
          )}
          <Link href="/" className="btn-primary text-sm" style={{ textDecoration: 'none' }}>
            + Kasa Aç
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Toplam Eşya', value: inventory.length.toString(), icon: '📦' },
          { label: 'Toplam Değer', value: `$${totalValue.toFixed(2)}`, icon: '💰', gold: true },
          { label: 'Bakiye', value: `$${balance.toFixed(2)}`, icon: '💳' },
          { label: 'En İyi Eşya', value: bestItem ? `$${bestItem.price.toFixed(2)}` : '—', icon: '⭐', gold: true },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              <div className={`font-black text-xl leading-none ${s.gold ? 'text-yellow-400' : ''}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {inventory.length === 0 ? (
        <div className="card p-20 text-center">
          <div className="text-7xl mb-5">📦</div>
          <h2 className="text-2xl font-bold mb-2">Envanterin boş</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>Skin kazanmak için birkaç kasa aç!</p>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>Kasaları İncele</Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="card p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Skin ara..."
                  className="pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: 200 }} />
              </div>

              {/* Sort */}
              <select value={sort} onChange={e => setSort(e.target.value as SortOpt)}
                className="text-sm px-3 py-2 rounded-lg outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="newest">Önce En Yeni</option>
                <option value="oldest">Önce En Eski</option>
                <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                <option value="rarity">Nadirliğe Göre</option>
              </select>

              {/* Select all */}
              <button onClick={toggleAll}
                className="text-sm px-3 py-2 rounded-lg transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                {selected.size === sorted.length && sorted.length > 0 ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </button>

              <span className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>
                {selected.size > 0
                  ? `${selected.size} seçildi · $${selectedValue.toFixed(2)}`
                  : `${sorted.length} eşya`}
              </span>
            </div>

            {/* Rarity filter */}
            <div className="flex gap-2 flex-wrap mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              {raritiesPresent.map(r => {
                const clr = r === 'all' ? '#f97316' : RARITY_COLORS[r as Rarity];
                const active = rarityFilter === r;
                const count = r === 'all' ? inventory.length : inventory.filter(i => i.rarity === r).length;
                return (
                  <button key={r} onClick={() => setRarityFilter(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize"
                    style={{
                      background: active ? `${clr}20` : 'var(--bg-secondary)',
                      color: active ? clr : 'var(--text-muted)',
                      border: `1px solid ${active ? clr + '55' : 'var(--border)'}`,
                    }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: clr, display: 'inline-block', flexShrink: 0 }} />
                    {r === 'all' ? 'Tümü' : RARITY_LABELS[r as Rarity]}
                    <span className="text-xs opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-lg font-semibold mb-1">Filtrelerle eşleşen eşya yok</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aramayı veya nadirlik filtresini değiştir</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sorted.map(item => {
                const clr = RARITY_COLORS[item.rarity];
                const isSel = selected.has(item.inventoryId);
                return (
                  <div key={item.inventoryId}
                    className="rounded-2xl overflow-hidden cursor-pointer transition-all select-none group"
                    onClick={() => toggleSelect(item.inventoryId)}
                    style={{
                      background: `${clr}0c`,
                      border: `2px solid ${isSel ? clr : clr + '30'}`,
                      boxShadow: isSel ? `0 0 24px ${clr}30` : undefined,
                      transform: isSel ? 'scale(1.02)' : undefined,
                    }}>
                    {/* Image area */}
                    <div className="relative flex items-center justify-center"
                      style={{ height: 148, background: `linear-gradient(180deg, ${clr}18 0%, transparent 100%)` }}>
                      {/* Checkbox */}
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all z-10"
                        style={{ background: isSel ? clr : 'rgba(0,0,0,0.4)', borderColor: isSel ? clr : 'rgba(255,255,255,0.25)' }}>
                        {isSel && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Rarity dot */}
                      <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full" style={{ background: clr }} />

                      <Image src={item.image} alt={`${item.weapon} | ${item.name}`}
                        width={100} height={72}
                        className="object-contain group-hover:scale-105 transition-transform"
                        style={{ filter: `drop-shadow(0 4px 10px ${clr}60)` }}
                        unoptimized />
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <div className="font-bold text-xs mb-0.5 truncate" style={{ color: clr }}>
                        {item.weapon}
                      </div>
                      <div className="font-semibold truncate text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                        {item.name}
                      </div>
                      {item.wear && (
                        <div className="text-xs mb-2 truncate" style={{ color: 'var(--text-muted)' }}>{item.wear}</div>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="font-black text-yellow-400 text-base">${item.price.toFixed(2)}</span>
                        <button
                          onClick={e => { e.stopPropagation(); sellItem(item.inventoryId, item.price); }}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex-shrink-0"
                          style={{
                            color: '#22c55e',
                            border: '1px solid rgba(34,197,94,0.4)',
                            background: 'rgba(34,197,94,0.08)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.22)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.08)')}>
                          Sat
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
