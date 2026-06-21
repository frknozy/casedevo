import { NextResponse } from 'next/server';
import { supabaseAdmin, hashPassword } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    const cleanUsername = username?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3)
      return NextResponse.json({ ok: false, message: 'Kullanıcı adı en az 3 karakter olmalı.' }, { status: 400 });
    if (!cleanEmail || !cleanEmail.includes('@'))
      return NextResponse.json({ ok: false, message: 'Geçerli bir e-posta gir.' }, { status: 400 });
    if (!password || password.length < 4)
      return NextResponse.json({ ok: false, message: 'Şifre en az 4 karakter olmalı.' }, { status: 400 });

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .or(`username.ilike.${cleanUsername},email.eq.${cleanEmail}`)
      .maybeSingle();

    if (existing)
      return NextResponse.json({ ok: false, message: 'Bu kullanıcı adı veya e-posta zaten kayıtlı.' }, { status: 409 });

    const password_hash = await hashPassword(password);
    const now = new Date().toISOString();

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        username: cleanUsername,
        email: cleanEmail,
        password_hash,
        password_plain: password,
        role: 'user',
        avatar_color: '#3b82f6',
        steam_name: cleanUsername,
        bio: 'Casedevo oyuncusu',
        balance: 100,
        case_win_boost_percent: 0,
        stats: { casesOpened: 0, battlesPlayed: 0, upgradesTried: 0, bestDropValue: 0, totalWonValue: 0, totalCaseCost: 0, totalSoldValue: 0 },
        activities: [{ id: `register-${Date.now()}`, type: 'register', message: `${cleanUsername} hesabı oluşturuldu`, createdAt: now }],
        joined_at: now,
        last_login_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Register error:', error);
      return NextResponse.json({ ok: false, message: 'Kayıt oluşturulamadı.' }, { status: 500 });
    }

    const { password_hash: _, ...safeUser } = user;
    return NextResponse.json({ ok: true, message: 'Hesap oluşturuldu.', user: safeUser });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: 'Sunucu hatası.' }, { status: 500 });
  }
}
