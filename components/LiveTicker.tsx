'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cases, RARITY_COLORS, FAKE_USERS, rollSkin, Skin } from '@/lib/data';

interface TickerItem {
  id: string;
  user: string;
  skin: Skin;
  caseName: string;
}

function randomItem(): TickerItem {
  const c = cases[Math.floor(Math.random() * cases.length)];
  return {
    id: Math.random().toString(36).slice(2),
    user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
    skin: rollSkin(c.skins),
    caseName: c.name,
  };
}

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(Array.from({ length: 30 }, randomItem));
  }, []);

  // Add new item periodically
  useEffect(() => {
    const iv = setInterval(() => {
      setItems(prev => [randomItem(), ...prev.slice(0, 35)]);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  if (items.length === 0) return null;

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden border-b flex-shrink-0"
      style={{
        background: 'rgba(8,12,24,0.95)',
        borderColor: 'var(--border)',
        height: 44,
      }}
    >
      <div
        ref={trackRef}
        className="flex items-center h-full"
        style={{
          animation: 'ticker-scroll 60s linear infinite',
          width: 'max-content',
          gap: 0,
        }}
      >
        {doubled.map((item, i) => {
          const clr = RARITY_COLORS[item.skin.rarity];
          return (
            <div
              key={`${item.id}-${i}`}
              className="flex items-center gap-2 px-3 h-full flex-shrink-0"
              style={{
                borderRight: '1px solid rgba(255,255,255,0.05)',
                minWidth: 180,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${clr}18`, border: `1px solid ${clr}35` }}
              >
                <Image
                  src={item.skin.image}
                  alt={item.skin.name}
                  width={28}
                  height={20}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate leading-tight" style={{ color: clr, maxWidth: 110, fontSize: 10 }}>
                  {item.skin.weapon} | {item.skin.name}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-yellow-400" style={{ fontSize: 10 }}>${item.skin.price.toFixed(2)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>· {item.user.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
