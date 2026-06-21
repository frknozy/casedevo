'use client';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { RARITY_COLORS } from '@/lib/data';
import { useStore } from '@/store/useStore';

type DropView = 'all' | 'valuable';

export default function LiveTicker() {
  const liveDrops = useStore((state) => state.liveDrops);
  const [view, setView] = useState<DropView>('all');
  const visibleDrops = useMemo(() => {
    if (view === 'all') return liveDrops;
    return liveDrops.filter((drop) =>
      drop.skin.price >= 10 ||
      drop.skin.rarity === 'classified' ||
      drop.skin.rarity === 'covert' ||
      drop.skin.rarity === 'extraordinary'
    );
  }, [liveDrops, view]);

  return (
    <div
      className="flex w-full flex-shrink-0 overflow-hidden border-b"
      style={{
        background: 'rgba(8,12,24,0.95)',
        borderColor: 'var(--border)',
        height: 44,
      }}
    >
      <div className="flex h-full flex-shrink-0 items-center gap-1 border-r px-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {[
          { id: 'all' as const, label: 'Tümü' },
          { id: 'valuable' as const, label: 'Değerli' },
        ].map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="rounded-lg px-2.5 py-1 text-[10px] font-black transition-all"
              style={{
                background: active ? 'rgba(249,115,22,0.16)' : 'rgba(255,255,255,0.04)',
                color: active ? '#fb923c' : 'var(--text-muted)',
                border: `1px solid ${active ? 'rgba(249,115,22,0.34)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {liveDrops.length === 0 ? (
        <div className="flex h-full flex-1 items-center justify-center gap-2 px-4 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          Gerçek canlı droplar animasyon tamamlandıktan sonra burada görünecek.
        </div>
      ) : visibleDrops.length === 0 ? (
        <div className="flex h-full flex-1 items-center justify-center gap-2 px-4 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          Henüz değerli drop yok.
        </div>
      ) : (
        <div
          className="live-drop-strip flex h-full flex-1 items-center overflow-x-auto overflow-y-hidden"
          style={{
            gap: 0,
          }}
        >
          {visibleDrops.map((drop) => {
            const clr = RARITY_COLORS[drop.skin.rarity];
            return (
              <div
                key={drop.id}
                className="flex h-full min-w-[210px] flex-shrink-0 items-center gap-2 px-3"
                style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${clr}18`, border: `1px solid ${clr}35` }}
                >
                  <Image src={drop.skin.image} alt={drop.skin.name} width={28} height={20} className="object-contain" unoptimized />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold leading-tight" style={{ color: clr, maxWidth: 132, fontSize: 10 }}>
                    {drop.skin.weapon} | {drop.skin.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-yellow-400" style={{ fontSize: 10 }}>${drop.skin.price.toFixed(2)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>· {drop.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
