import { NextResponse } from 'next/server';
import { supabaseAdmin, hashPassword, getUserInventory } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { usernameOrEmail, password } = await request.json();

    const key = usernameOrEmail?.trim().toLowerCase();
    if (!key || !password)
      return NextResponse.json({ ok: false, message: 'Kullanıcı bilgileri eksik.' }, { status: 400 });

    const password_hash = await hashPassword(password);

    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .or(`username.ilike.${key},email.eq.${key}`)
      .eq('password_hash', password_hash)
      .maybeSingle();

    if (!user)
      return NextResponse.json({ ok: false, message: 'Kullanıcı bilgileri hatalı.' }, { status: 401 });

    const now = new Date().toISOString();
    const updatedActivities = [
      { id: `login-${Date.now()}`, type: 'login', message: 'Hesaba giriş yapıldı', createdAt: now },
      ...(Array.isArray(user.activities) ? user.activities : []),
    ].slice(0, 40);

    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: now, activities: updatedActivities })
      .eq('id', user.id);

    const inventory = await getUserInventory(user.id);

    const { password_hash: _, ...safeUser } = { ...user, activities: updatedActivities, last_login_at: now };
    return NextResponse.json({ ok: true, message: 'Giriş başarılı.', user: safeUser, inventory });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: 'Sunucu hatası.' }, { status: 500 });
  }
}
