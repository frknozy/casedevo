import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const { data } = await supabaseAdmin.from('case_overrides').select('*');
  const overrides = (data || []).map((row: { id: string; data: unknown }) => ({ id: row.id, ...(row.data as object) }));
  return NextResponse.json({ ok: true, overrides });
}

export async function POST(request: Request) {
  try {
    const { userId, override } = await request.json();

    const { data: user } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
    if (user?.role !== 'admin')
      return NextResponse.json({ ok: false, message: 'Yetkisiz.' }, { status: 403 });

    const { id, ...rest } = override;
    await supabaseAdmin.from('case_overrides').upsert({ id, data: rest, updated_at: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    const { data: user } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();
    if (user?.role !== 'admin')
      return NextResponse.json({ ok: false, message: 'Yetkisiz.' }, { status: 403 });

    await supabaseAdmin.from('case_overrides').delete().neq('id', '');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
