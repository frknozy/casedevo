import { NextResponse } from 'next/server';
import { supabaseAdmin, getUserInventory } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ ok: false }, { status: 400 });

  const { data: user } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  if (!user) return NextResponse.json({ ok: false }, { status: 404 });

  const inventory = await getUserInventory(userId);
  const { password_hash: _, ...safeUser } = user;
  return NextResponse.json({ ok: true, user: safeUser, inventory });
}

export async function PATCH(request: Request) {
  try {
    const { userId, patch } = await request.json();
    if (!userId) return NextResponse.json({ ok: false }, { status: 400 });

    const { data: user } = await supabaseAdmin.from('profiles').select('id, role').eq('id', userId).single();
    if (!user) return NextResponse.json({ ok: false, message: 'Kullanıcı bulunamadı.' }, { status: 404 });

    const allowed = ['username', 'email', 'steam_name', 'bio', 'avatar_color'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (patch[key] !== undefined) update[key] = patch[key];
    }

    if (Object.keys(update).length === 0)
      return NextResponse.json({ ok: false, message: 'Güncellenecek alan yok.' }, { status: 400 });

    if (update.username || update.email) {
      const { data: dup } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .neq('id', userId)
        .or([
          update.username ? `username.ilike.${update.username}` : null,
          update.email ? `email.eq.${update.email}` : null,
        ].filter(Boolean).join(','))
        .maybeSingle();
      if (dup) return NextResponse.json({ ok: false, message: 'Bu kullanıcı adı veya e-posta kullanılıyor.' }, { status: 409 });
    }

    await supabaseAdmin.from('profiles').update(update).eq('id', userId);
    return NextResponse.json({ ok: true, message: 'Profil güncellendi.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: 'Sunucu hatası.' }, { status: 500 });
  }
}
