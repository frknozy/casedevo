import { NextResponse } from 'next/server';
import { supabaseAdmin, getUserInventory } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requesterId = searchParams.get('requesterId');
  if (!requesterId) return NextResponse.json({ ok: false }, { status: 400 });

  const { data: requester } = await supabaseAdmin.from('profiles').select('role').eq('id', requesterId).single();
  if (requester?.role !== 'admin') return NextResponse.json({ ok: false, message: 'Yetkisiz.' }, { status: 403 });

  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email, role, avatar_color, steam_name, bio, balance, case_win_boost_percent, stats, activities, joined_at, last_login_at')
    .order('joined_at', { ascending: false });

  const usersWithInventory = await Promise.all(
    (users || []).map(async (user) => {
      const inventory = await getUserInventory(user.id);
      return { ...user, inventory };
    })
  );

  return NextResponse.json({ ok: true, users: usersWithInventory });
}

export async function PATCH(request: Request) {
  try {
    const { requesterId, targetUserId, action, amount, percent } = await request.json();

    const { data: requester } = await supabaseAdmin.from('profiles').select('role').eq('id', requesterId).single();
    if (requester?.role !== 'admin') return NextResponse.json({ ok: false, message: 'Yetkisiz.' }, { status: 403 });

    const { data: target } = await supabaseAdmin.from('profiles').select('*').eq('id', targetUserId).single();
    if (!target) return NextResponse.json({ ok: false, message: 'Kullanıcı bulunamadı.' }, { status: 404 });

    const now = new Date().toISOString();

    if (action === 'add_balance') {
      const cleanAmount = Math.round(amount * 100) / 100;
      if (cleanAmount <= 0) return NextResponse.json({ ok: false, message: 'Tutar 0\'dan büyük olmalı.' }, { status: 400 });
      const newBalance = Math.round((target.balance + cleanAmount) * 100) / 100;
      const newActivities = [
        { id: `admin-${Date.now()}`, type: 'deposit', message: `Admin tarafından $${cleanAmount.toFixed(2)} bakiye eklendi`, amount: cleanAmount, createdAt: now },
        ...(Array.isArray(target.activities) ? target.activities : []),
      ].slice(0, 40);
      await supabaseAdmin.from('profiles').update({ balance: newBalance, activities: newActivities }).eq('id', targetUserId);
      return NextResponse.json({ ok: true, message: `$${cleanAmount.toFixed(2)} eklendi.`, newBalance });
    }

    if (action === 'remove_balance') {
      const cleanAmount = Math.round(amount * 100) / 100;
      if (cleanAmount <= 0) return NextResponse.json({ ok: false, message: 'Tutar 0\'dan büyük olmalı.' }, { status: 400 });
      if (target.balance < cleanAmount) return NextResponse.json({ ok: false, message: 'Bakiye yetersiz.' }, { status: 400 });
      const newBalance = Math.round((target.balance - cleanAmount) * 100) / 100;
      const newActivities = [
        { id: `admin-${Date.now()}`, type: 'admin', message: `Admin tarafından $${cleanAmount.toFixed(2)} bakiye çıkarıldı`, amount: -cleanAmount, createdAt: now },
        ...(Array.isArray(target.activities) ? target.activities : []),
      ].slice(0, 40);
      await supabaseAdmin.from('profiles').update({ balance: newBalance, activities: newActivities }).eq('id', targetUserId);
      return NextResponse.json({ ok: true, message: `$${cleanAmount.toFixed(2)} çıkarıldı.`, newBalance });
    }

    if (action === 'set_boost') {
      const cleanPercent = Math.max(0, Math.round((Number(percent) || 0) * 100) / 100);
      await supabaseAdmin.from('profiles').update({ case_win_boost_percent: cleanPercent }).eq('id', targetUserId);
      return NextResponse.json({ ok: true, message: `Boost +%${cleanPercent.toFixed(2)} olarak ayarlandı.` });
    }

    return NextResponse.json({ ok: false, message: 'Bilinmeyen işlem.' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
