import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface SyncPayload {
  userId: string;
  balance?: number;
  stats?: Record<string, number>;
  activities?: unknown[];
  inventoryAdd?: Array<{ id: string; skin_data: unknown }>;
  inventoryRemove?: string[];
}

export async function POST(request: Request) {
  try {
    const body: SyncPayload = await request.json();
    const { userId, balance, stats, activities, inventoryAdd, inventoryRemove } = body;

    if (!userId) return NextResponse.json({ ok: false }, { status: 400 });

    const profileUpdate: Record<string, unknown> = {};
    if (balance !== undefined) profileUpdate.balance = balance;
    if (stats !== undefined) profileUpdate.stats = stats;
    if (activities !== undefined) profileUpdate.activities = activities;

    if (Object.keys(profileUpdate).length > 0) {
      await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', userId);
    }

    if (inventoryAdd && inventoryAdd.length > 0) {
      await supabaseAdmin.from('inventory').upsert(
        inventoryAdd.map((item) => ({ id: item.id, user_id: userId, skin_data: item.skin_data }))
      );
    }

    if (inventoryRemove && inventoryRemove.length > 0) {
      await supabaseAdmin.from('inventory').delete().in('id', inventoryRemove).eq('user_id', userId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
