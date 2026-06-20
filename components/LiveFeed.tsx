'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cases, RARITY_COLORS, FAKE_USERS, rollSkin, Skin } from '@/lib/data';

interface FeedItem {
  id: string;
  user: string;
  skin: Skin;
  caseName: string;
  ts: number;
}

function randomItem(): FeedItem {
  const c = cases[Math.floor(Math.random() * cases.length)];
  const skin = rollSkin(c.skins);
  return {
    id: Math.random().toString(36).slice(2),
    user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
    skin,
    caseName: c.name,
    ts: Date.now(),
  };
}

export default function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [newId, setNewId] = useState<string | null>(null);

  useEffect(() => {
    setItems(Array.from({ length: 12 }, () => randomItem()));
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      const item = randomItem();
      setNewId(item.id);
      setItems(prev => [item, ...prev.slice(0, 24)]);
      setTimeout(() => setNewId(null), 500);
    }, 1600 + Math.random() * 1200);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside className="fixed right-0 top-16 bottom-0 w-64 z-40 flex flex-col"
      style={{ background: 'rgba(8,12,24,0.97)', borderLeft: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        <span className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'pulse 2s infinite' }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Live Drops</span>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
          LIVE
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {items.map((item, idx) => {
          const clr = RARITY_COLORS[item.skin.rarity];
          const isNew = item.id === newId;
          return (
            <div key={item.id}
              style={{
                borderBottom: '1px solid var(--border)',
                borderLeft: `3px solid ${clr}`,
                animation: isNew ? 'slide-in-right 0.35s ease-out' : undefined,
                background: isNew ? `${clr}08` : undefined,
                transition: 'background 0.5s',
              }}>
              <div className="flex items-center gap-2 px-2.5 py-2">
                {/* Item icon */}
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: `${clr}15`, border: `1px solid ${clr}30` }}>
                  <Image src={item.skin.image} alt={item.skin.name} width={36} height={26} className="object-contain" unoptimized />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate leading-tight" style={{ color: clr }}>
                    {item.skin.weapon} | {item.skin.name}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                    {item.user}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-black text-yellow-400">${item.skin.price.toFixed(2)}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: 9 }}>{item.caseName.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stat */}
      <div className="flex-shrink-0 px-3 py-2 border-t text-center" style={{ borderColor: 'var(--border)' }}>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Total dropped today: <span className="text-yellow-400 font-bold">$284,192</span>
        </div>
      </div>
    </aside>
  );
}
