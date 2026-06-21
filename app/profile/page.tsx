'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export default function ProfilePage() {
  const { users, currentUserId, updateProfile, logout, hasHydrated } = useStore();
  const currentUser = users.find((user) => user.id === currentUserId);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    steamName: currentUser?.steamName || '',
    bio: currentUser?.bio || '',
    avatarColor: currentUser?.avatarColor || '#3b82f6',
  }));
  const [formUserId, setFormUserId] = useState<string | null>(currentUser?.id || null);

  if (currentUser && formUserId !== currentUser.id) {
    setFormUserId(currentUser.id);
    setForm({
      username: currentUser.username,
      email: currentUser.email,
      steamName: currentUser.steamName,
      bio: currentUser.bio,
      avatarColor: currentUser.avatarColor,
    });
  }

  const inventoryValue = useMemo(
    () => currentUser?.inventory.reduce((sum, item) => sum + item.price, 0) || 0,
    [currentUser]
  );
  const bestItem = useMemo(
    () => currentUser?.inventory.reduce((best, item) => (!best || item.price > best.price) ? item : best, null as typeof currentUser.inventory[number] | null),
    [currentUser]
  );

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12 text-center">
        <div className="card p-10">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full" style={{ background: 'rgba(59,130,246,0.22)' }} />
          <h1 className="text-3xl font-black">Profil hazırlanıyor</h1>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12 text-center">
        <div className="card p-10">
          <h1 className="text-3xl font-black">Profil için giriş yap</h1>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
            Profil istatistikleri, işlem geçmişi ve hesap ayarları kayıtlı kullanıcılar için görünür.
          </p>
          <Link href="/account" className="btn-primary mt-6" style={{ textDecoration: 'none' }}>Giriş / Kayıt</Link>
        </div>
      </div>
    );
  }

  const save = () => {
    const result = updateProfile(form);
    setMessage(result.message);
  };

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-8">
      <section className="mb-6 overflow-hidden rounded-[30px] border"
        style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.98), rgba(10,15,30,0.98))', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div className="flex gap-5">
            <div
              className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl text-3xl font-black text-white"
              style={{ background: `linear-gradient(135deg, ${currentUser.avatarColor}, #111827)` }}
            >
              {currentUser.username[0]?.toUpperCase()}
            </div>
            <div>
              <div className="mb-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
                style={{ background: currentUser.role === 'admin' ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.12)', color: currentUser.role === 'admin' ? '#fb923c' : '#93c5fd' }}>
                {currentUser.role === 'admin' ? 'Admin Hesabı' : 'Oyuncu Profili'}
              </div>
              <h1 className="text-4xl font-black">{currentUser.username}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{currentUser.bio}</p>
              <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                Katılım: {formatDate(currentUser.joinedAt)} · Son giriş: {formatDate(currentUser.lastLoginAt)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2 md:justify-end">
            <Link href="/inventory" className="btn-secondary" style={{ textDecoration: 'none' }}>Envanter</Link>
            {currentUser.role === 'admin' && <Link href="/admin" className="btn-primary" style={{ textDecoration: 'none' }}>Admin Paneli</Link>}
            <button onClick={logout} className="btn-secondary">Çıkış Yap</button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ['Bakiye', `$${currentUser.balance.toFixed(2)}`],
              ['Envanter Değeri', `$${inventoryValue.toFixed(2)}`],
              ['Açılan Kasa', currentUser.stats.casesOpened.toString()],
              ['En İyi Drop', `$${currentUser.stats.bestDropValue.toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} className="card p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>{label}</div>
                <div className="mt-2 text-2xl font-black text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Performans Özeti</h2>
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                Canlı demo verisi
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['Toplam Kazanım', `$${currentUser.stats.totalWonValue.toFixed(2)}`],
                ['Satış Geliri', `$${currentUser.stats.totalSoldValue.toFixed(2)}`],
                ['Upgrade Denemesi', currentUser.stats.upgradesTried.toString()],
                ['Battle Sayısı', currentUser.stats.battlesPlayed.toString()],
                ['Envanter Adedi', currentUser.inventory.length.toString()],
                ['En Değerli Eşya', bestItem ? `${bestItem.weapon} · $${bestItem.price.toFixed(2)}` : 'Henüz yok'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                  <div className="mt-1 truncate text-lg font-black">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-xl font-black">Son Aktiviteler</h2>
            <div className="space-y-2">
              {currentUser.activities.length === 0 ? (
                <div className="rounded-2xl p-6 text-center text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  Henüz aktivite yok.
                </div>
              ) : currentUser.activities.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.amount && item.amount < 0 ? '#ef4444' : '#22c55e' }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{item.message}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(item.createdAt)}</div>
                  </div>
                  {typeof item.amount === 'number' && (
                    <div className="text-sm font-black" style={{ color: item.amount < 0 ? '#fca5a5' : '#86efac' }}>
                      {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-xl font-black">Hesap Ayarları</h2>
          <div className="space-y-3">
            {[
              ['username', 'Kullanıcı adı'],
              ['email', 'E-posta'],
              ['steamName', 'Steam adı'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="w-full rounded-xl px-3 py-2.5 outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Avatar rengi</label>
              <input
                value={form.avatarColor}
                onChange={(event) => setForm((prev) => ({ ...prev, avatarColor: event.target.value }))}
                type="color"
                className="h-11 w-full rounded-xl p-1"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Profil notu</label>
              <textarea
                value={form.bio}
                onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                rows={4}
                className="w-full resize-none rounded-xl px-3 py-2.5 outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            {message && <div className="rounded-xl px-3 py-2 text-sm font-semibold text-green-300" style={{ background: 'rgba(34,197,94,0.1)' }}>{message}</div>}
            <button onClick={save} className="btn-primary w-full justify-center">Profili Güncelle</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
