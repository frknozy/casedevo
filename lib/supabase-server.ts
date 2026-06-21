import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with full access (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getUserById(userId: string) {
  const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  return data;
}

export async function getUserInventory(userId: string) {
  const { data } = await supabaseAdmin
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .order('opened_at', { ascending: false });
  return data || [];
}
