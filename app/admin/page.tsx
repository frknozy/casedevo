'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { applyCaseOverrides, cases, Case, formatChance, getCaseSkinChance, RARITY_COLORS, RARITY_LABELS } from '@/lib/data';
import { useStore, UserAccount } from '@/store/useStore';

function BoostInput({ userId, initialValue, onSave }: { userId: string; initialValue: number; onSave: (userId: string, val: number) => Promise<{ ok: boolean; message: string }> }) {
  const [value, setValue] = useState(String(initialValue));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    const num = Math.max(0, Number(value) || 0);
    setSaving(true);
    const result = await onSave(userId, num);
    setSaving(false);
    if (result.ok) { setSaved(true); setTimeout(() => setSaved(false), 1500); }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex w-[100px] items-center gap-1 rounded-xl px-2 py-1.5"
        style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border)' }}>
        <span className="text-xs font-black" style={{ color: '#fb923c' }}>+</span>
        <input
          value={value}
          onChange={e => { setValue(e.target.value); setSaved(false); }}
          onKeyDown={e => { if (e.key === 'Enter') void save(); }}
          type="number"
          min="0"
          step="1"
          className="w-full bg-transparent text-right text-xs font-black outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        <span className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>%</span>
      </div>
      <button
        onClick={() => void save()}
        disabled={saving}
        className="rounded-lg px-2 py-1 text-xs font-black transition-all"
        style={{ background: saved ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.12)', border: `1px solid ${saved ? 'rgba(34,197,94,0.3)' : 'rgba(249,115,22,0.3)'}`, color: saved ? '#86efac' : '#fb923c' }}
      >
        {saving ? '…' : saved ? '✓' : 'Kaydet'}
      </button>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
}

function getCaseProfitSummary(user: UserAccount) {
  const fallbackCost = user.activities
    .filter((activity) => activity.type === 'case-open')
    .reduce((sum, activity) => sum + Math.abs(activity.amount || 0), 0);
  const spent = user.stats.totalCaseCost || fallbackCost;
  const won = user.stats.totalWonValue || 0;
  const net = won - spent;
  const percent = spent > 0 ? (net / spent) * 100 : 0;
  return { spent, won, net, percent };
}

export default function AdminPage() {
  const { currentUserId, currentUser, caseOverrides, updateCaseOverride, resetCaseOverrides, hasHydrated, adminAddBalanceToUser, adminRemoveBalanceFromUser, adminSetCaseWinBoost } = useStore();
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [balanceUserId, setBalanceUserId] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceMessage, setBalanceMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordMessage, setResetPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleteUserId, setDeleteUserId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const managedCases = useMemo(() => applyCaseOverrides(cases, caseOverrides), [caseOverrides]);
  const managedCasesById = useMemo(() => new Map(managedCases.map((caseItem) => [caseItem.id, caseItem])), [managedCases]);
  const overridesById = useMemo(() => new Map(caseOverrides.map((item) => [item.id, item])), [caseOverrides]);

  useEffect(() => {
    if (!currentUserId || !isAdmin) return;
    setUsersLoading(true);
    fetch(`/api/users?requesterId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setUsers(data.users);
      })
      .catch(console.error)
      .finally(() => setUsersLoading(false));
  }, [currentUserId, isAdmin]);

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const totalInventory = users.reduce((sum, user) => sum + user.inventory.length, 0);
  const totalCasesOpened = users.reduce((sum, user) => sum + user.stats.casesOpened, 0);
  const allActivities = users.flatMap((user) => user.activities.map((activity) => ({ ...activity, username: user.username })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 12);

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-12 text-center">
        <div className="card p-10">
          <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-2xl" style={{ background: 'rgba(249,115,22,0.2)' }} />
          <h1 className="text-3xl font-black">Admin paneli hazırlanıyor</h1>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
            Oturum bilgileri kontrol ediliyor.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-12 text-center">
        <div className="card p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: 'rgba(239,68,68,0.12)' }}>
            🔒
          </div>
          <h1 className="text-3xl font-black">Admin erişimi gerekli</h1>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
            Bu panel yalnızca yetkili yönetici hesabına özeldir.
          </p>
          <Link href="/account" className="btn-primary mt-6" style={{ textDecoration: 'none' }}>Admin Girişi Yap</Link>
        </div>
      </div>
    );
  }

  const updateCase = (caseItem: Case, patch: { price?: number; enabled?: boolean; tag?: Case['tag'] | 'NONE'; note?: string; skinChances?: Record<string, number> }) => {
    const current = overridesById.get(caseItem.id);
    updateCaseOverride({
      id: caseItem.id,
      price: current?.price ?? caseItem.price,
      enabled: current?.enabled ?? true,
      tag: current?.tag ?? caseItem.tag ?? 'NONE',
      note: current?.note ?? '',
      skinChances: current?.skinChances,
      ...patch,
    });
  };

  const updateSkinChance = (caseItem: Case, skinId: string, chance: number) => {
    const managedCase = managedCasesById.get(caseItem.id) ?? caseItem;
    const cleanChance = Math.min(100, Math.max(0, chance));
    const currentChances = managedCase.skins.map((skin) => ({
      id: skin.id,
      chance: getCaseSkinChance(managedCase.skins, skin, managedCase.price),
    }));
    const others = currentChances.filter((item) => item.id !== skinId);
    const otherTotal = others.reduce((sum, item) => sum + item.chance, 0);
    const remaining = 100 - cleanChance;
    const nextChances = Object.fromEntries(
      currentChances.map((item) => {
        if (item.id === skinId) return [item.id, cleanChance];
        if (otherTotal <= 0) return [item.id, remaining / Math.max(1, others.length)];
        return [item.id, (item.chance / otherTotal) * remaining];
      })
    );
    updateCase(caseItem, { skinChances: nextChances });
  };

  const resetSkinChances = (caseItem: Case) => {
    updateCase(caseItem, { skinChances: {} });
  };

  const refreshUsers = () => {
    if (!currentUserId) return;
    fetch(`/api/users?requesterId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => { if (data.ok) setUsers(data.users); })
      .catch(console.error);
  };

  const submitResetPassword = async () => {
    if (!resetPasswordUserId || !resetPasswordValue) return;
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: currentUserId, targetUserId: resetPasswordUserId, action: 'reset_password', newPassword: resetPasswordValue }),
    });
    const data = await res.json();
    setResetPasswordMessage({ ok: data.ok, text: data.message });
    if (data.ok) setResetPasswordValue('');
  };

  const submitDeleteUser = async () => {
    if (!deleteUserId || !deleteConfirm) return;
    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterId: currentUserId, targetUserId: deleteUserId }),
    });
    const data = await res.json();
    setDeleteMessage({ ok: data.ok, text: data.message });
    if (data.ok) {
      setDeleteUserId('');
      setDeleteConfirm(false);
      refreshUsers();
    }
  };

  const submitBalance = async (action: 'add' | 'remove') => {
    const targetUserId = balanceUserId || users[0]?.id || '';
    const amount = Number(balanceAmount);
    const result = action === 'add'
      ? await adminAddBalanceToUser(targetUserId, amount)
      : await adminRemoveBalanceFromUser(targetUserId, amount);
    setBalanceMessage({ ok: result.ok, text: result.message });
    if (result.ok) {
      setBalanceAmount('');
      refreshUsers();
    }
  };

  return (
    <>
    {/* Delete confirmation modal */}
    {deleteUserId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--bg-primary)', border: '1px solid rgba(239,68,68,0.4)' }}>
          <h2 className="mb-2 text-xl font-black text-red-400">Kullanıcıyı Sil</h2>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong className="text-white">{users.find(u => u.id === deleteUserId)?.username}</strong> kullanıcısı ve tüm envanteri kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>
          <div className="mb-4 flex items-center gap-2">
            <input id="del-confirm" type="checkbox" checked={deleteConfirm} onChange={e => setDeleteConfirm(e.target.checked)} className="h-4 w-4 cursor-pointer" />
            <label htmlFor="del-confirm" className="cursor-pointer text-sm font-semibold">Silmek istediğimi onaylıyorum</label>
          </div>
          {deleteMessage && (
            <div className="mb-3 rounded-xl px-3 py-2 text-sm font-semibold"
              style={{ background: deleteMessage.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: deleteMessage.ok ? '#86efac' : '#fca5a5' }}>
              {deleteMessage.text}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setDeleteUserId(''); setDeleteConfirm(false); setDeleteMessage(null); }} className="btn-secondary flex-1 justify-center">İptal</button>
            <button
              onClick={() => void submitDeleteUser()}
              disabled={!deleteConfirm}
              className="flex-1 justify-center rounded-lg px-4 py-2.5 text-sm font-black transition-all disabled:opacity-40"
              style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }}
            >
              Kalıcı Sil
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="mx-auto max-w-[1320px] px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em]"
            style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.28)' }}>
            Yönetim Paneli
          </div>
          <h1 className="text-4xl font-black">Casedevo Admin</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Site özetini gör, kullanıcıları takip et, kasa fiyatlarını ve görünürlüğünü yönet.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void resetCaseOverrides()} className="btn-secondary">Kasa Ayarlarını Sıfırla</button>
          <Link href="/profile" className="btn-primary" style={{ textDecoration: 'none' }}>Admin Profili</Link>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-5">
        {[
          ['Kullanıcı', usersLoading ? '…' : users.length.toString()],
          ['Toplam Bakiye', `$${totalBalance.toFixed(2)}`],
          ['Envanter Eşyası', totalInventory.toString()],
          ['Açılan Kasa', totalCasesOpened.toString()],
          ['Aktif Kasa', `${managedCases.length}/${cases.length}`],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <div className="mt-2 text-2xl font-black">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-black">Kasa Yönetimi</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Fiyat, rozet ve aktiflik değişiklikleri site genelinde uygulanır.</p>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {cases.map((caseItem) => {
                const override = overridesById.get(caseItem.id);
                const managedCase = managedCasesById.get(caseItem.id) ?? caseItem;
                const enabled = override?.enabled ?? true;
                const price = override?.price ?? caseItem.price;
                const tag = override?.tag ?? caseItem.tag ?? 'NONE';
                return (
                  <div key={caseItem.id} className="px-5 py-4">
                    <div className="grid gap-3 lg:grid-cols-[1.2fr_120px_150px_110px_130px] lg:items-center">
                      <div>
                        <div className="font-black">{caseItem.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{managedCase.skins.length} skin · Orijinal fiyat ${caseItem.price.toFixed(2)}</div>
                      </div>
                      <input
                        value={price}
                        onChange={(event) => updateCase(caseItem, { price: Number(event.target.value) || caseItem.price })}
                        type="number"
                        min="0"
                        step="0.01"
                        className="rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      />
                      <select
                        value={tag}
                        onChange={(event) => updateCase(caseItem, { tag: event.target.value as Case['tag'] | 'NONE' })}
                        className="rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      >
                        <option value="NONE">Rozet yok</option>
                        <option value="HOT">Popüler</option>
                        <option value="NEW">Yeni</option>
                        <option value="BEST VALUE">Avantajlı</option>
                      </select>
                      <button
                        onClick={() => updateCase(caseItem, { enabled: !enabled })}
                        className="rounded-xl px-3 py-2 text-sm font-black"
                        style={{
                          background: enabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: enabled ? '#86efac' : '#fca5a5',
                          border: `1px solid ${enabled ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.28)'}`,
                        }}
                      >
                        {enabled ? 'Aktif' : 'Kapalı'}
                      </button>
                      <button
                        onClick={() => setExpandedCaseId((value) => value === caseItem.id ? null : caseItem.id)}
                        className="rounded-xl px-3 py-2 text-sm font-black"
                        style={{
                          background: expandedCaseId === caseItem.id ? 'rgba(249,115,22,0.14)' : 'rgba(255,255,255,0.04)',
                          color: expandedCaseId === caseItem.id ? '#fb923c' : 'var(--text-secondary)',
                          border: `1px solid ${expandedCaseId === caseItem.id ? 'rgba(249,115,22,0.34)' : 'var(--border)'}`,
                        }}
                      >
                        Skin Oranları
                      </button>
                    </div>

                    {expandedCaseId === caseItem.id && (
                      <div className="mt-4 rounded-2xl border p-3" style={{ background: 'rgba(0,0,0,0.18)', borderColor: 'var(--border)' }}>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-black">Drop oranları</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              Yüzdeler otomatik normalize edilir; toplam farklı olsa bile açılış aynı ağırlıkları kullanır.
                            </div>
                          </div>
                          <button
                            onClick={() => resetSkinChances(caseItem)}
                            className="rounded-full px-3 py-2 text-xs font-black"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                          >
                            Varsayılana Dön
                          </button>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                          {managedCase.skins.map((skin) => {
                            const color = RARITY_COLORS[skin.rarity];
                            const chance = getCaseSkinChance(managedCase.skins, skin, managedCase.price);
                            return (
                              <div key={skin.id} className="grid grid-cols-[minmax(0,1fr)_104px] items-center gap-3 rounded-xl border px-3 py-2" style={{ borderColor: `${color}2f`, background: `${color}0d` }}>
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className="flex h-14 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border"
                                    style={{ background: 'rgba(0,0,0,0.22)', borderColor: `${color}30` }}
                                  >
                                    <Image
                                      src={skin.image}
                                      alt={`${skin.weapon} | ${skin.name}`}
                                      width={56}
                                      height={40}
                                      className="object-contain drop-shadow-lg"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-black" style={{ color }}>{skin.weapon}</div>
                                    <div className="truncate text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{skin.name}</div>
                                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{RARITY_LABELS[skin.rarity]}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <input
                                    value={formatChance(chance)}
                                    onChange={(event) => updateSkinChance(caseItem, skin.id, Number(event.target.value) || 0)}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full rounded-lg px-2 py-2 text-right text-xs font-black outline-none"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                  />
                                  <span className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-black">Kullanıcılar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead style={{ color: 'var(--text-muted)' }}>
                  <tr>
                    <th className="px-5 py-3">Kullanıcı</th>
                    <th className="px-5 py-3">Rol</th>
                    <th className="px-5 py-3">Bakiye</th>
                    <th className="px-5 py-3">Envanter</th>
                    <th className="px-5 py-3">Açılan Kasa</th>
                    <th className="px-5 py-3">Gizli Avantaj</th>
                    <th className="px-5 py-3">Şifre</th>
                    <th className="px-5 py-3">Son Giriş</th>
                    <th className="px-5 py-3">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-5 py-3">
                        <div className="font-bold">{user.username}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</div>
                        <div className="mt-0.5 text-[10px] font-mono" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{user.id.slice(0, 8)}…</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full px-2 py-1 text-xs font-black" style={{ background: user.role === 'admin' ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.12)', color: user.role === 'admin' ? '#fb923c' : '#93c5fd' }}>
                          {user.role === 'admin' ? 'Admin' : 'Oyuncu'}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-black text-yellow-400">${user.balance.toFixed(2)}</td>
                      <td className="px-5 py-3">{user.inventory.length}</td>
                      <td className="px-5 py-3">
                        <div className="font-bold">{user.stats.casesOpened}</div>
                        {(() => {
                          const profit = getCaseProfitSummary(user);
                          const positive = profit.net >= 0;
                          if (profit.spent <= 0) {
                            return (
                              <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                K/Z yok
                              </div>
                            );
                          }
                          return (
                            <div
                              className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-black"
                              title={`Kasa harcaması: $${profit.spent.toFixed(2)} · Drop değeri: $${profit.won.toFixed(2)}`}
                              style={{
                                background: positive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                color: positive ? '#86efac' : '#fca5a5',
                                border: `1px solid ${positive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                              }}
                            >
                              {positive ? '+' : ''}${profit.net.toFixed(2)} · {positive ? '+' : ''}{profit.percent.toFixed(0)}%
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-3">
                        <BoostInput
                          userId={user.id}
                          initialValue={user.caseWinBoostPercent ?? 0}
                          onSave={adminSetCaseWinBoost}
                        />
                        <div className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Enter veya Kaydet
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {user.passwordPlain || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(user.lastLoginAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setDeleteUserId(user.id); setDeleteConfirm(false); setDeleteMessage(null); }}
                            disabled={user.id === currentUserId}
                            title={user.id === currentUserId ? 'Kendi hesabını silemezsin' : 'Kullanıcıyı sil'}
                            className="rounded-lg px-2 py-1 text-xs font-black transition-all disabled:opacity-30"
                            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                          >
                            Sil
                          </button>
                          <button
                            onClick={() => { setResetPasswordUserId(user.id); setResetPasswordMessage(null); setResetPasswordValue(''); }}
                            className="rounded-lg px-2 py-1 text-xs font-black transition-all"
                            style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', color: '#fde047' }}
                          >
                            Şifre
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="text-xl font-black">Kullanıcı Bakiyesi</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Kullanıcı bakiyesi yalnızca admin panelinden eklenir veya çıkarılır.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Kullanıcı</label>
                <select
                  value={balanceUserId || users[0]?.id || ''}
                  onChange={(event) => {
                    setBalanceUserId(event.target.value);
                    setBalanceMessage(null);
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} · ${user.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>İşlem tutarı</label>
                <input
                  value={balanceAmount}
                  onChange={(event) => {
                    setBalanceAmount(event.target.value);
                    setBalanceMessage(null);
                  }}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Örn. 25"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              {balanceMessage && (
                <div className="rounded-xl px-3 py-2.5 text-sm font-semibold"
                  style={{
                    background: balanceMessage.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: balanceMessage.ok ? '#86efac' : '#fca5a5',
                    border: `1px solid ${balanceMessage.ok ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.28)'}`,
                  }}>
                  {balanceMessage.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => void submitBalance('add')} className="btn-primary justify-center">
                  Bakiye Ekle
                </button>
                <button
                  onClick={() => void submitBalance('remove')}
                  className="justify-center rounded-lg px-4 py-2.5 text-sm font-black transition-all"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.34)',
                    color: '#fca5a5',
                  }}
                >
                  Bakiye Çıkar
                </button>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-xl font-black">Son Aktiviteler</h2>
            <div className="space-y-2">
              {allActivities.map((item) => (
                <div key={`${item.username}-${item.id}`} className="rounded-2xl p-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black">{item.username}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{item.message}</div>
                </div>
              ))}
            </div>
          </section>

          {resetPasswordUserId && (
            <section className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-black">Şifre Sıfırla</h2>
                <button onClick={() => setResetPasswordUserId('')} className="text-sm" style={{ color: 'var(--text-muted)' }}>✕</button>
              </div>
              <div className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {users.find(u => u.id === resetPasswordUserId)?.username} kullanıcısı
              </div>
              <div className="space-y-3">
                <input
                  value={resetPasswordValue}
                  onChange={(e) => { setResetPasswordValue(e.target.value); setResetPasswordMessage(null); }}
                  type="text"
                  placeholder="Yeni şifre (min. 4 karakter)"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                {resetPasswordMessage && (
                  <div className="rounded-xl px-3 py-2 text-sm font-semibold"
                    style={{ background: resetPasswordMessage.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: resetPasswordMessage.ok ? '#86efac' : '#fca5a5' }}>
                    {resetPasswordMessage.text}
                  </div>
                )}
                <button onClick={() => void submitResetPassword()} className="btn-primary w-full justify-center">
                  Şifreyi Güncelle
                </button>
              </div>
            </section>
          )}

        </aside>
      </div>
    </div>
    </>
  );
}
