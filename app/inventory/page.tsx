'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore, InventoryItem } from '@/store/useStore';
import { RARITY_COLORS, RARITY_LABELS, Rarity } from '@/lib/data';

type SortOpt = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'rarity';

const RARITY_ORDER: Rarity[] = ['extraordinary', 'covert', 'classified', 'restricted', 'milspec', 'industrial', 'consumer'];

export default function InventoryPage() {
  const { inventory, balance, sellItem, sellSelected, sellAll } = useStore();
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
      case 'newest':   res.sort((a, b) => b.openedAt.localeCompare(a.openedAt)); break;
      case 'oldest':   res.sort((a, b) => a.openedAt.localeCompare(b.openedAt)); break;
      case 'price-high': res.sort((a, b) => b.price - a.price); break;
      case 'price-low':  res.sort((a, b) => a.price - b.price); break;
      case 'rarity':   res.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)); break;
    }
    return res;
  }, [inventory, sort, rarityFilter, search]);

  const totalValue = inventory.reduce((s, i) => s + i.price, 0);
  const selectedList = sorted.filter(i => selected.has(i.inventoryId));
  const selectedValue = selectedList.reduce((s, i) => s + i.price, 0);
  const bestItem = inventory.reduce<InventoryItem | null>((best, i) => (!best || i.price > best.price) ? i : best, null);

  const raritiesPresent = ['all', ...RARITY_ORDER.filter(r => inventory.some(i => i.rarity === r))];

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map(i => i.inventoryId)));
  };

  const handleSellSelected = () => {
    sellSelected([...selected]);
    setSelected(new Set());
  };

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1">Inventory</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {inventory.length} items · Total value:&nbsp;
            <span className="text-yellow-400 font-bold">${totalValue.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selected.size > 0 && (
            <button onClick={handleSellSelected} className="btn-green text-sm">
              💰 Sell Selected (${selectedValue.toFixed(2)})
            </button>
          )}
          {inventory.length > 0 && (
            <button onClick={() => { sellAll(); setSelected(new Set()); }} className="btn-secondary text-sm">
              Sell All (${totalValue.toFixed(2)})
            </button>
          )}
          <Link href="/" className="btn-primary text-sm" style={{ textDecoration: 'none' }}>
            + Open Cases
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Items', value: inventory.length.toString(), icon: '📦' },
          { label: 'Total Value', value: `$${totalValue.toFixed(2)}`, icon: '💰', gold: true },
          { label: 'Balance', value: `$${balance.toFixed(2)}`, icon: '💳' },
          { label: 'Best Item', value: bestItem ? `$${bestItem.price.toFixed(2)}` : '—', icon: '⭐', gold: true },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              <div className={`font-black text-lg leading-none ${s.gold ? 'text-yellow-400' : ''}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {inventory.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">Your inventory is empty</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Open some cases to win skins!</p>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>Browse Cases</Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search skins…"
                className="pl-8 pr-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: 180 }} />
            </div>

            {/* Rarity tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {raritiesPresent.map(r => {
                const clr = r === 'all' ? '#f97316' : RARITY_COLORS[r as Rarity];
                const active = rarityFilter === r;
                return (
                  <button key={r} onClick={() => setRarityFilter(r)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all capitalize"
                    style={{
                      background: active ? `${clr}25` : 'var(--bg-card)',
                      color: active ? clr : 'var(--text-muted)',
                      border: `1px solid ${active ? clr + '60' : 'var(--border)'}`,
                    }}>
                    {r === 'all' ? 'All' : RARITY_LABELS[r as Rarity]}
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value as SortOpt)}
              className="ml-auto text-sm px-3 py-1.5 rounded-lg outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High → Low</option>
              <option value="price-low">Price: Low → High</option>
              <option value="rarity">By Rarity</option>
            </select>
          </div>

          {/* Select-all bar */}
          <div className="flex items-center gap-3 mb-3">
            <button onClick={toggleAll}
              className="text-xs px-3 py-1 rounded-lg transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {selected.size === sorted.length && sorted.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            {selected.size > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {selected.size} selected · ${selectedValue.toFixed(2)}
              </span>
            )}
            {sorted.length > 0 && (
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                {sorted.length} item{sorted.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {sorted.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p style={{ color: 'var(--text-muted)' }}>No items match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sorted.map(item => {
                const clr = RARITY_COLORS[item.rarity];
                const isSel = selected.has(item.inventoryId);
                return (
                  <div key={item.inventoryId}
                    className="rounded-xl overflow-hidden cursor-pointer transition-all select-none"
                    onClick={() => toggleSelect(item.inventoryId)}
                    style={{
                      background: `${clr}10`,
                      border: `2px solid ${isSel ? clr : clr + '30'}`,
                      boxShadow: isSel ? `0 0 18px ${clr}35` : undefined,
                      transform: isSel ? 'scale(1.03)' : undefined,
                    }}>
                    <div className="relative h-28 flex items-center justify-center"
                      style={{ background: `linear-gradient(180deg, ${clr}20 0%, transparent 100%)` }}>
                      {/* Checkbox */}
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all`}
                        style={{ background: isSel ? clr : 'transparent', borderColor: isSel ? clr : 'rgba(255,255,255,0.2)' }}>
                        {isSel && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <Image src={item.image} alt={`${item.weapon} | ${item.name}`} width={80} height={58} className="object-contain" style={{ filter: `drop-shadow(0 2px 6px ${clr}60)` }} unoptimized />
                    </div>

                    <div className="p-2.5">
                      <div className="text-xs font-bold truncate" style={{ color: clr, fontSize: 10 }}>{item.weapon}</div>
                      <div className="font-semibold truncate text-xs" style={{ color: 'var(--text-primary)', fontSize: 10 }}>{item.name}</div>
                      {item.wear && (
                        <div className="truncate" style={{ fontSize: 9, color: 'var(--text-muted)' }}>{item.wear}</div>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-black text-yellow-400" style={{ fontSize: 13 }}>${item.price.toFixed(2)}</span>
                        <button
                          onClick={e => { e.stopPropagation(); sellItem(item.inventoryId, item.price); }}
                          className="text-xs px-2 py-0.5 rounded font-semibold transition-all"
                          style={{ color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)', fontSize: 10 }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.15)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          Sell
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
