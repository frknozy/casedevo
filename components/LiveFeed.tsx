'use client';
import { useEffect, useState } from 'react';
import { cases, RARITY_COLORS, FAKE_USERS, rollSkin, Skin } from '@/lib/data';

interface FeedItem {
  id: string;
  user: string;
  skin: Skin;
  caseName: string;
}

export default function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Initial feed items
    const initial: FeedItem[] = Array.from({ length: 8 }, (_, i) => {
      const c = cases[Math.floor(Math.random() * cases.length)];
      const skin = rollSkin(c.skins);
      return {
        id: `init-${i}`,
        user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
        skin,
        caseName: c.name,
      };
    });
    setItems(initial);

    const interval = setInterval(() => {
      const c = cases[Math.floor(Math.random() * cases.length)];
      const skin = rollSkin(c.skins);
      const newItem: FeedItem = {
        id: `${Date.now()}`,
        user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
        skin,
        caseName: c.name,
      };
      setItems((prev) => [newItem, ...prev.slice(0, 19)]);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed right-0 top-16 bottom-0 w-64 overflow-hidden z-30 border-l"
      style={{ background: 'rgba(10,14,26,0.95)', borderColor: 'var(--border)', backdropFilter: 'blur(8px)' }}
    >
      <div className="p-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Live Feed
        </span>
      </div>

      <div className="overflow-y-auto h-full pb-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="p-2.5 border-b"
            style={{
              borderColor: 'var(--border)',
              animation: idx === 0 ? 'slide-in-right 0.3s ease-out' : 'none',
              borderLeft: `3px solid ${RARITY_COLORS[item.skin.rarity]}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-xl"
                style={{
                  background: `${RARITY_COLORS[item.skin.rarity]}20`,
                  border: `1px solid ${RARITY_COLORS[item.skin.rarity]}40`,
                }}
              >
                🔫
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate" style={{ color: RARITY_COLORS[item.skin.rarity] }}>
                  {item.skin.weapon} | {item.skin.name}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {item.user}
                </div>
                <div className="text-xs font-semibold text-yellow-400">
                  ${item.skin.price.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
