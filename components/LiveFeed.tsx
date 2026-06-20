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
  return {
    id: Math.random().toString(36).slice(2),
    user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
    skin: rollSkin(c.skins),
    caseName: c.name,
    ts: Date.now(),
  };
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export default function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [newId, setNewId] = useState<string | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    setItems(Array.from({ length: 18 }, randomItem));
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      const item = randomItem();
      setNewId(item.id);
      setItems(prev => [item, ...prev.slice(0, 28)]);
      setTimeout(() => setNewId(null), 600);
    }, 1800 + Math.random() * 1200);
    return () => clearInterval(iv);
  }, []);

  // Update relative timestamps
  useEffect(() => {
    const iv = setInterval(() => tick(t => t + 1), 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside
      className="fixed right-0 z-40 flex flex-col"
      style={{
        top: 'var(--topbar-h)',
        bottom: 0,
        width: 256,
        background: 'rgba(8,11,22,0.98)',
        borderLeft: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="w-2 h-2 rounded-full bg-green-400 online-pulse flex-shrink-0" />
        <span className="text-xs font-black tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Live Drops
        </span>
        <span
          className="ml-auto text-xs px-1.5 py-0.5 rounded font-bold"
          style={{
            background: 'rgba(34,197,94,0.12)',
            color: '#22c55e',
            border: '1px solid rgba(34,197,94,0.25)',
          }}
        >
          LIVE
        </span>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {items.map((item) => {
          const clr = RARITY_COLORS[item.skin.rarity];
          const isNew = item.id === newId;
          return (
            <div
              key={item.id}
              className={isNew ? 'feed-in' : ''}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                borderLeft: `3px solid ${clr}`,
                background: isNew ? `${clr}0a` : 'transparent',
                transition: 'background 0.6s ease',
              }}
            >
              <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                {/* Skin image */}
                <div
                  className="w-11 h-11 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${clr}18, ${clr}08)`,
                    border: `1px solid ${clr}28`,
                  }}
                >
                  <Image
                    src={item.skin.image}
                    alt={item.skin.name}
                    width={38}
                    height={28}
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div
                    className="text-xs font-bold truncate leading-tight"
                    style={{ color: clr }}
                  >
                    {item.skin.weapon}
                  </div>
                  <div
                    className="text-xs truncate leading-tight"
                    style={{ color: 'var(--text-primary)', fontSize: 10, fontWeight: 600 }}
                  >
                    {item.skin.name}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-black text-yellow-400" style={{ fontSize: 11 }}>
                      ${item.skin.price.toFixed(2)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>
                      {timeAgo(item.ts)}
                    </span>
                  </div>
                </div>
              </div>

              {/* User row */}
              <div
                className="px-2.5 pb-2 flex items-center gap-1.5"
                style={{ marginTop: -4 }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: `${clr}60`, fontSize: 7, fontWeight: 900 }}
                >
                  {item.user[0]}
                </div>
                <span className="text-xs truncate" style={{ color: 'var(--text-muted)', fontSize: 9 }}>
                  {item.user}
                </span>
                <span className="ml-auto text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', fontSize: 9 }}>
                  {item.caseName.split(' ')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-3 py-2 text-center"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Total dropped today:{' '}
          <span className="text-yellow-400 font-bold">$284,192</span>
        </div>
      </div>
    </aside>
  );
}
