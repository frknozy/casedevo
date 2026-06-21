'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { applyCaseOverrides, cases, RARITY_COLORS, Rarity } from '@/lib/data';
import { useStore } from '@/store/useStore';

const DAILY_BONUS = 100;

const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  HOT: { bg: 'rgba(249,115,22,0.14)', color: '#fb923c', border: 'rgba(249,115,22,0.34)' },
  NEW: { bg: 'rgba(96,165,250,0.14)', color: '#93c5fd', border: 'rgba(96,165,250,0.34)' },
  'BEST VALUE': { bg: 'rgba(74,222,128,0.14)', color: '#86efac', border: 'rgba(74,222,128,0.34)' },
};

const TAG_LABELS: Record<string, string> = {
  HOT: 'POPÜLER',
  NEW: 'YENİ',
  'BEST VALUE': 'EN AVANTAJLI',
};

const CASE_GRADS: Record<string, [string, string]> = {
  revolution: ['#1a2340', '#263d77'],
  kilowatt: ['#19203f', '#1f5399'],
  'dreams-nightmares': ['#261840', '#5a2e88'],
  fracture: ['#351c29', '#73344c'],
  prisma2: ['#152c28', '#28705f'],
  snakebite: ['#18281b', '#2b6b37'],
  recoil: ['#1a2140', '#394e98'],
  clutch: ['#352217', '#6f4126'],
  horizon: ['#172639', '#2b5c87'],
};

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours} sa ${minutes.toString().padStart(2, '0')} dk`;
}

function RarityBar({ rarities }: { rarities: Rarity[] }) {
  const counts: Record<string, number> = {};
  rarities.forEach((rarity) => {
    counts[rarity] = (counts[rarity] || 0) + 1;
  });
  const order: Rarity[] = ['extraordinary', 'covert', 'classified', 'restricted', 'milspec', 'industrial', 'consumer'];
  const total = rarities.length;

  return (
    <div className="flex h-1 w-full overflow-hidden rounded-full gap-px">
      {order.filter((rarity) => counts[rarity]).map((rarity) => (
        <div
          key={rarity}
          style={{
            width: `${(counts[rarity] / total) * 100}%`,
            background: RARITY_COLORS[rarity],
          }}
        />
      ))}
    </div>
  );
}

function CaseCard({
  id,
  name,
  image,
  price,
  tag,
  skins,
}: {
  id: string;
  name: string;
  image: string;
  price: number;
  tag?: string;
  skins: Array<{ rarity: Rarity }>;
}) {
  const [from, to] = CASE_GRADS[id] || ['#182138', '#30457d'];
  const badge = tag ? TAG_STYLES[tag] : null;
  const tagLabel = tag ? TAG_LABELS[tag] || tag : null;

  return (
    <Link
      href={`/case/${id}`}
      className="group relative overflow-hidden rounded-[30px] no-underline"
      style={{
        background: 'linear-gradient(180deg, rgba(20,24,39,0.98), rgba(19,26,42,0.98))',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 18px 48px rgba(0,0,0,0.28)',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle at 50% 28%, rgba(139,92,246,0.18), transparent 62%)' }}
      />

      {badge && (
        <div
          className="absolute right-5 top-5 z-10 rounded-full px-3 py-1 text-[11px] font-black tracking-[0.16em]"
          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
        >
          {tagLabel}
        </div>
      )}

      <div className="relative z-10 p-5">
        <div
          className="relative mb-5 flex h-[255px] items-center justify-center overflow-hidden rounded-[24px]"
          style={{
            background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="absolute inset-x-8 bottom-5 h-10 rounded-full blur-2xl"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          />
          <Image
            src={image}
            alt={name}
            width={220}
            height={220}
            className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-[1.05]"
            style={{ filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.55))' }}
            unoptimized
          />
        </div>

        <RarityBar rarities={skins.map((skin) => skin.rarity)} />

        <div className="mt-4 text-center">
          <div className="text-[15px] font-black uppercase tracking-[0.08em] text-white">
            {name.replace(' Case', '')}
          </div>
          <div
            className="mt-4 inline-flex rounded-2xl border px-4 py-2 text-[22px] font-black leading-none text-[#101827]"
            style={{
              background: '#ffffff',
              borderColor: 'rgba(255,255,255,0.74)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
            }}
          >
            ${price.toFixed(2)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { balance, claimDailyBonus, lastDailyClaimAt, caseOverrides, users, currentUserId } = useStore();
  const currentUser = users.find((user) => user.id === currentUserId);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const nextClaimIn = useMemo(() => {
    if (!lastDailyClaimAt) return 0;
    const remaining = 24 * 60 * 60 * 1000 - (now - new Date(lastDailyClaimAt).getTime());
    return Math.max(0, remaining);
  }, [lastDailyClaimAt, now]);

  const canClaimDaily = nextClaimIn === 0;

  const managedCases = useMemo(() => applyCaseOverrides(cases, caseOverrides), [caseOverrides]);
  const featuredCases = useMemo(() => managedCases.slice(0, 5), [managedCases]);
  const premiumCases = useMemo(() => managedCases.slice(5), [managedCases]);
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
      <section
        className="relative overflow-hidden rounded-[34px] border"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(7,10,20,0.98) 0%, rgba(7,10,20,0.9) 38%, rgba(7,10,20,0.54) 68%, rgba(7,10,20,0.82) 100%), url('/site-hero-casedevo.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderColor: 'rgba(255,255,255,0.06)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.32)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.18]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }} />

        <div className="relative z-10 px-6 pb-8 pt-8 md:px-10 md:pt-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-full px-4 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-sm text-violet-300">✦</span>
              <span className="text-sm font-bold text-violet-200">Premium kasa deneyimi</span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  Bakiye <span className="ml-2 font-black text-white">${balance.toFixed(2)}</span>
                </div>
                <button onClick={() => claimDailyBonus(DAILY_BONUS)} disabled={!canClaimDaily} className="btn-primary rounded-2xl px-5 py-3 text-sm">
                  {canClaimDaily ? 'Bonus Al' : formatCountdown(nextClaimIn)}
                </button>
              </div>
            ) : (
              <Link href="/account" className="btn-primary rounded-2xl px-5 py-3 text-sm" style={{ textDecoration: 'none' }}>
                Giriş / Kayıt
              </Link>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[30px] border px-6 py-8 md:px-8 md:py-10"
            style={{
              background: 'linear-gradient(135deg, rgba(8,12,24,0.86), rgba(12,18,35,0.62))',
              borderColor: 'rgba(255,255,255,0.05)',
            }}>
            <div className="absolute -left-16 top-10 h-48 w-48 rounded-full blur-3xl" style={{ background: 'rgba(139,92,246,0.2)' }} />
            <div className="absolute right-0 top-0 h-full w-[38%] opacity-80" style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(139,92,246,0.22), transparent 38%), radial-gradient(circle at 70% 60%, rgba(59,130,246,0.18), transparent 34%)',
            }} />
            <div className="absolute right-12 top-12 h-56 w-56 rounded-full border" style={{ borderColor: 'rgba(139,92,246,0.12)' }} />
            <div className="absolute right-24 bottom-10 h-40 w-40 rounded-full border" style={{ borderColor: 'rgba(59,130,246,0.12)' }} />

            <div className="relative z-10 max-w-[720px]">
              <h1 className="text-[54px] font-black leading-[0.95] text-white md:text-[78px]">
                Şansını Konuştur,
                <span className="mt-2 block bg-gradient-to-r from-violet-300 via-violet-500 to-blue-400 bg-clip-text text-transparent">
                  Efsaneleri Yakala!
                </span>
              </h1>
              <p className="mt-6 max-w-[520px] text-xl leading-8 text-slate-300">
                En değerli skinleri kazanmak için kasaları aç, şansını zirveye taşıyacak premium bir kasa açma deneyimine gir.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#cases" className="btn-primary rounded-2xl px-8 py-4 text-base">
                  Kasalara Göz At
                </a>
                <Link href="/upgrade" className="btn-secondary rounded-2xl px-8 py-4 text-base no-underline" style={{ textDecoration: 'none' }}>
                  Yükselt
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {[
              { title: '%100 Güvenli', desc: 'Adil sistem, şeffaf sonuçlar', icon: '🛡️' },
              { title: 'Günlük Bonus', desc: 'Her gün ücretsiz ödüller', icon: '🎁' },
              { title: 'Hızlı Çekim', desc: 'Anında skin çekim imkanı', icon: '⚡' },
              { title: '7/24 Destek', desc: 'Kesintisiz destek ekibi', icon: '🎧' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] px-5 py-5"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="mb-3 text-2xl">{item.icon}</div>
                <div className="text-lg font-black text-white">{item.title}</div>
                <div className="mt-1 text-sm text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cases" className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-[0.3em] text-slate-500">ÖNE ÇIKAN KASALAR</div>
            <h2 className="mt-2 text-4xl font-black text-white md:text-5xl">Premium kasa koleksiyonu</h2>
          </div>
          <div className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-300 md:block" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            Büyük açılışlar için özenle seçildi
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {featuredCases.map((caseItem) => (
            <CaseCard key={caseItem.id} {...caseItem} />
          ))}
        </div>

        <div className="my-10 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.44))' }} />
          <div className="text-center">
            <div className="text-xs font-black tracking-[0.3em] text-slate-500">PREMIUM</div>
            <div className="mt-1 text-3xl font-black text-white">Üst seviye seçimler</div>
          </div>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.44), transparent)' }} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {premiumCases.map((caseItem) => (
            <CaseCard key={caseItem.id} {...caseItem} />
          ))}
        </div>
      </section>
    </div>
  );
}
