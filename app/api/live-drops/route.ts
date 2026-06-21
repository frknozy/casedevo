import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const { data } = await supabaseAdmin
    .from('live_drops')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);
  return NextResponse.json({ ok: true, drops: data || [] });
}

export async function POST(request: Request) {
  try {
    const { drops } = await request.json();
    if (!drops || drops.length === 0) return NextResponse.json({ ok: true });

    await supabaseAdmin.from('live_drops').insert(drops);

    // Keep only last 200 drops
    const { data: oldest } = await supabaseAdmin
      .from('live_drops')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1000);

    if (oldest && oldest.length > 200) {
      const toDelete = oldest.slice(0, oldest.length - 200).map((d: { id: string }) => d.id);
      await supabaseAdmin.from('live_drops').delete().in('id', toDelete);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
