'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/store/useStore';

export default function AccountPage() {
  const { register, login, currentUser, hasHydrated } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (formValues?: { username: string; email: string; password: string }) => {
    const values = formValues || { username, email, password };
    setLoading(true);
    setMessage(null);
    const result = mode === 'login'
      ? await login(values.username || values.email, values.password)
      : await register(values.username, values.email, values.password);
    setMessage({ ok: result.ok, text: result.message });
    setLoading(false);
  };

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-12">
        <div className="card p-10 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full" style={{ background: 'rgba(249,115,22,0.22)' }} />
          <h1 className="text-2xl font-black">Hesap hazırlanıyor</h1>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="mx-auto max-w-[980px] px-4 py-8">
        <div className="card overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="mb-6 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em]"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#86efac', border: '1px solid rgba(34,197,94,0.26)' }}>
              Oturum Açık
            </div>
            <h1 className="text-4xl font-black">Hoş geldin, {currentUser!.username}</h1>
            <p className="mt-3 max-w-2xl text-sm" style={{ color: 'var(--text-muted)' }}>
              Hesabın aktif. Profil istatistiklerini, envanter değerini ve son aktivitelerini profil sekmesinden takip edebilirsin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>Profile Git</Link>
              {currentUser!.role === 'admin' && (
                <Link href="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>Admin Paneli</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1240px] items-start gap-8 px-5 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] xl:pt-12">
      <section className="relative overflow-hidden rounded-[24px] border p-6 sm:p-8 lg:p-10"
        style={{
          background: 'linear-gradient(135deg, rgba(18,24,42,0.98), rgba(9,14,28,0.98))',
          borderColor: 'rgba(255,255,255,0.08)',
        }}>
        <div className="absolute right-0 top-0 h-60 w-60 rounded-full blur-3xl" style={{ background: 'rgba(249,115,22,0.14)' }} />
        <div className="relative">
          <div className="mb-5 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em]"
            style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.28)' }}>
            Casedevo Hesabı
          </div>
          <h1 className="max-w-[780px] text-4xl font-black leading-[1.08] text-white sm:text-5xl xl:text-[56px]">
            Profilini oluştur, kasa geçmişini ve kazançlarını takip et.
          </h1>
          <p className="mt-5 max-w-[720px] text-base leading-7" style={{ color: 'var(--text-secondary)' }}>
            Kayıt ol, hesabını güvenle yönet, envanter değerini ve kasa geçmişini tek profilde takip et.
          </p>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              ['Açılış İstatistikleri', 'Kaç kasa açtığını ve en iyi drop değerini gör.'],
              ['Envanter Takibi', 'Kazandığın skinleri ve toplam değerini takip et.'],
              ['Hesap Geçmişi', 'Girişlerini, satışlarını ve son aktivitelerini izle.'],
            ].map(([title, desc]) => (
              <div key={title} className="min-h-[128px] rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-base font-black text-white">{title}</div>
                <div className="mt-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card self-start p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-black">{mode === 'login' ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}</h2>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? 'Kasa geçmişine ve profil ayarlarına devam et.' : 'Profilini oluşturup kasaları kendi hesabınla açmaya başla.'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl p-1" style={{ background: 'var(--bg-secondary)' }}>
          {[
            ['login', 'Giriş Yap'],
            ['register', 'Kayıt Ol'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setMode(id as 'login' | 'register'); setMessage(null); }}
              className="rounded-xl px-4 py-3 text-sm font-black transition-all"
              style={{
                background: mode === id ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'transparent',
                color: mode === id ? '#fff' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            void submit({
              username: String(formData.get('username') || ''),
              email: String(formData.get('email') || ''),
              password: String(formData.get('password') || ''),
            });
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {mode === 'login' ? 'Kullanıcı adı veya e-posta' : 'Kullanıcı adı'}
            </label>
            <input
              value={username}
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder={mode === 'login' ? 'Kullanıcı adı veya e-posta' : 'caseustasi'}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>E-posta</label>
              <input
                value={email}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="oyuncu@casedevo.local"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Şifre</label>
            <input
              value={password}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder={mode === 'login' ? 'Şifren' : 'En az 4 karakter'}
            />
          </div>

          {message && (
            <div className="rounded-xl px-4 py-3 text-sm font-semibold"
              style={{
                background: message.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: message.ok ? '#86efac' : '#fca5a5',
                border: `1px solid ${message.ok ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.28)'}`,
              }}>
              {message.text}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? 'Lütfen bekle…' : mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </button>
        </form>
      </section>
    </div>
  );
}
