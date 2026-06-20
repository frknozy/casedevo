'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { RARITY_COLORS, RARITY_LABELS, Rarity } from '@/lib/data';

type SortOption = 'newest' | 'price-high' | 'price-low' | 'rarity';

export default function InventoryPage() {
  const { inventory, sellItem, sellAll, balance } = useStore();
  const [sort, setSort] = useState<SortOption>('newest');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('all');

  const rarityOrder = ['extraordinary', 'covert', 'classified', 'restricted', 'milspec', 'industrial', 'consumer'];

  const sorted = [...inventory].sort((a, b) => {
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'rarity') return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
  }).filter(item => filter === 'all' || item.rarity === filter);

  const totalValue = inventory.reduce((s, i) => s + i.price, 0);
  const selectedItems = inventory.filter(i => selected.has(i.inventoryId));
  const selectedValue = selectedItems.reduce((s, i) => s + i.price, 0);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sellSelected = () => {
    selectedItems.forEach(item => sellItem(item.inventoryId, item.price));
    setSelected(new Set());
  };

  const rarities = ['all', ...new Set(inventory.map(i => i.rarity))];

  return (
    <div className="max-w-[1136px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1">Inventory</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {inventory.length} items · Total value: <span className="text-yellow-400 font-semibold">${totalValue.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.size > 0 && (
            <button
              onClick={sellSelected}
              className="btn-green text-sm py-2"
            >
              💰 Sell Selected (${selectedValue.toFixed(2)})
            </button>
          )}
          {inventory.length > 0 && (
            <button
              onClick={() => { sellAll(); setSelected(new Set()); }}
              className="btn-secondary text-sm py-2"
            >
              Sell All (${totalValue.toFixed(2)})
            </button>
          )}
          <Link href="/" className="btn-primary text-sm py-2 no-underline">
            + Open More Cases
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Items', value: inventory.length },
          { label: 'Total Value', value: `$${totalValue.toFixed(2)}`, highlight: true },
          { label: 'Balance', value: `$${balance.toFixed(2)}` },
          { label: 'Best Item', value: inventory.length > 0 ? `$${Math.max(...inventory.map(i => i.price)).toFixed(2)}` : '-', highlight: true },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            <div className={`text-xl font-black ${stat.highlight ? 'text-yellow-400' : ''}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters & sort */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {rarities.map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize"
              style={{
                background: filter === r
                  ? (r === 'all' ? 'linear-gradient(135deg,#f97316,#ea580c)' : `${RARITY_COLORS[r as Rarity]}30`)
                  : 'var(--bg-card)',
                color: filter === r
                  ? (r === 'all' ? 'white' : RARITY_COLORS[r as Rarity])
                  : 'var(--text-muted)',
                border: `1px solid ${filter === r && r !== 'all' ? RARITY_COLORS[r as Rarity] + '60' : 'var(--border)'}`,
              }}
            >
              {r === 'all' ? 'All' : RARITY_LABELS[r as Rarity]}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="text-sm px-3 py-1.5 rounded-lg outline-none"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="newest">Newest First</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
          <option value="rarity">By Rarity</option>
        </select>
      </div>

      {/* Empty state */}
      {inventory.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">Your inventory is empty</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Open some cases to win skins!</p>
          <Link href="/" className="btn-primary no-underline">Browse Cases</Link>
        </div>
      ) : (
        <>
          {/* Select all */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => {
                if (selected.size === sorted.length) setSelected(new Set());
                else setSelected(new Set(sorted.map(i => i.inventoryId)));
              }}
              className="text-xs px-3 py-1 rounded-lg transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {selected.size === sorted.length ? 'Deselect All' : 'Select All'}
            </button>
            {selected.size > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.size} selected</span>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sorted.map(item => {
              const clr = RARITY_COLORS[item.rarity];
              const isSelected = selected.has(item.inventoryId);
              return (
                <div
                  key={item.inventoryId}
                  className="rounded-xl overflow-hidden cursor-pointer transition-all"
                  style={{
                    background: `${clr}10`,
                    border: `2px solid ${isSelected ? clr : clr + '30'}`,
                    boxShadow: isSelected ? `0 0 20px ${clr}40` : undefined,
                    transform: isSelected ? 'scale(1.02)' : undefined,
                  }}
                  onClick={() => toggleSelect(item.inventoryId)}
                >
                  {/* Check */}
                  <div className="relative">
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
                        style={{ background: clr }}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="h-28 flex items-center justify-center text-5xl"
                      style={{ background: `linear-gradient(180deg, ${clr}20 0%, ${clr}05 100%)` }}>
                      🔫
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-semibold truncate" style={{ color: clr }}>
                      {item.weapon}
                    </div>
                    <div className="text-xs truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    {item.wear && (
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.wear}</div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm text-yellow-400">${item.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); sellItem(item.inventoryId, item.price); }}
                        className="text-xs px-2 py-0.5 rounded transition-all hover:bg-green-500/20"
                        style={{ color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)' }}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
