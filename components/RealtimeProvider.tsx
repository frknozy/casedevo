'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { LiveDropItem } from '@/store/useStore';

interface DbDrop {
  id: string;
  username: string;
  case_name: string;
  skin_data: Record<string, unknown>;
  created_at: string;
}

function dbDropToLiveDrop(row: DbDrop): LiveDropItem {
  return {
    id: row.id,
    user: row.username,
    caseName: row.case_name,
    skin: row.skin_data as unknown as LiveDropItem['skin'],
    createdAt: row.created_at,
  };
}

export default function RealtimeProvider() {
  const addLiveDropsFromServer = useStore((state) => state.addLiveDropsFromServer);

  useEffect(() => {
    // Fetch initial live drops from backend
    fetch('/api/live-drops')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.drops?.length) {
          addLiveDropsFromServer(data.drops.map(dbDropToLiveDrop));
        }
      })
      .catch(console.error);

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('live-drops-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_drops' },
        (payload) => {
          const drop = dbDropToLiveDrop(payload.new as DbDrop);
          addLiveDropsFromServer([drop]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addLiveDropsFromServer]);

  return null;
}
