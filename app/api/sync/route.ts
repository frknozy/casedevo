import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

interface SyncPayload {
  userId: string;
  balanceDelta?: number | null; // delta to add/subtract, preserves admin changes
  stats?: Record<string, number>;
  activities?: unknown[];
  inventoryAdd?: Array<{ id: string; skin_data: unknown }>;
  inventoryRemove?: string[];
}

export async function POST(request: Request) {
  try {
    const body: SyncPayload = await request.json();
    const { userId, balanceDelta, stats, activities, inventoryAdd, inventoryRemove } = body;

    if (!userId) return NextResponse.json({ ok: false }, { status: 400 });

    // Apply balance delta via RPC to avoid overwriting admin changes
    if (typeof balanceDelta === 'number' && balanceDelta !== 0) {
      await supabaseAdmin.rpc('increment_balance', { user_id: userId, delta: balanceDelta });
    }

    const profileUpdate: Record<string, unknown> = {};
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
