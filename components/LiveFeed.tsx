'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RARITY_COLORS } from '@/lib/data';
import { useStore } from '@/store/useStore';

function timeAgo(value: string) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 5) return 'az önce';
  if (seconds < 60) return `${seconds} sn önce`;
  return `${Math.floor(seconds / 60)} dk önce`;
}

export default function LiveFeed() {
  const liveDrops = useStore((state) => state.liveDrops);
  const [, tick] = useState(0);
  const totalValue = liveDrops.reduce((sum, drop) => sum + drop.skin.price, 0);

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
      <div className="flex flex-shrink-0 items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-400 online-pulse" />
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Gerçek Droplar
        </span>
        <span
          className="ml-auto rounded px-1.5 py-0.5 text-xs font-bold"
          style={{
            background: liveDrops.length > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)',
            color: liveDrops.length > 0 ? '#22c55e' : '#fb923c',
            border: `1px solid ${liveDrops.length > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(249,115,22,0.25)'}`,
          }}
        >
          {liveDrops.length > 0 ? 'LIVE' : 'BEKLİYOR'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {liveDrops.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ background: 'rgba(249,115,22,0.12)' }}>
              ✦
            </div>
            <div className="text-sm font-black">Henüz gerçek drop yok</div>
            <p className="mt-2 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
              Kullanıcı kasa açtığında kazanan skinler burada anlık görünecek.
            </p>
          </div>
        ) : liveDrops.map((drop, index) => {
          const clr = RARITY_COLORS[drop.skin.rarity];
          const isNew = index === 0;
          return (
            <div
              key={drop.id}
              className={isNew ? 'feed-in' : ''}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                borderLeft: `3px solid ${clr}`,
                background: isNew ? `${clr}0a` : 'transparent',
                transition: 'background 0.6s ease',
              }}
            >
              <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${clr}18, ${clr}08)`,
                    border: `1px solid ${clr}28`,
                  }}
                >
                  <Image src={drop.skin.image} alt={drop.skin.name} width={38} height={28} className="object-contain" unoptimized />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold leading-tight" style={{ color: clr }}>
                    {drop.skin.weapon}
                  </div>
                  <div className="truncate text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)', fontSize: 10 }}>
                    {drop.skin.name}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="font-black text-yellow-400" style={{ fontSize: 11 }}>${drop.skin.price.toFixed(2)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>{timeAgo(drop.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 pb-2" style={{ marginTop: -4 }}>
                <div
                  className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: `${clr}60`, fontSize: 7, fontWeight: 900 }}
                >
                  {drop.user[0]}
                </div>
                <span className="truncate text-xs" style={{ color: 'var(--text-muted)', fontSize: 9 }}>
                  {drop.user}
                </span>
                <span className="ml-auto flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)', fontSize: 9 }}>
                  {drop.caseName.split(' ')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-shrink-0 px-3 py-2 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Gerçek drop toplamı:{' '}
          <span className="font-bold text-yellow-400">${totalValue.toFixed(2)}</span>
        </div>
      </div>
    </aside>
  );
}
