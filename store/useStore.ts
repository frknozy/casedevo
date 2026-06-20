import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Skin } from '@/lib/data';

export interface InventoryItem extends Skin {
  inventoryId: string;
  openedAt: string; // ISO string — Date can't persist cleanly
}

interface Store {
  balance: number;
  inventory: InventoryItem[];
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  addToInventory: (skin: Skin) => string; // returns inventoryId
  sellItem: (inventoryId: string, price: number) => void;
  sellSelected: (inventoryIds: string[]) => void;
  sellAll: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      balance: 100.00,
      inventory: [],

      addBalance: (amount) =>
        set(s => ({ balance: Math.round((s.balance + amount) * 100) / 100 })),

      deductBalance: (amount) => {
        if (get().balance < amount) return false;
        set(s => ({ balance: Math.round((s.balance - amount) * 100) / 100 }));
        return true;
      },

      addToInventory: (skin) => {
        const inventoryId = `${skin.id}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        set(s => ({
          inventory: [
            { ...skin, inventoryId, openedAt: new Date().toISOString() },
            ...s.inventory,
          ],
        }));
        return inventoryId;
      },

      sellItem: (inventoryId, price) =>
        set(s => ({
          balance: Math.round((s.balance + price) * 100) / 100,
          inventory: s.inventory.filter(i => i.inventoryId !== inventoryId),
        })),

      sellSelected: (inventoryIds) =>
        set(s => {
          const toSell = s.inventory.filter(i => inventoryIds.includes(i.inventoryId));
          const total = toSell.reduce((sum, i) => sum + i.price, 0);
          return {
            balance: Math.round((s.balance + total) * 100) / 100,
            inventory: s.inventory.filter(i => !inventoryIds.includes(i.inventoryId)),
          };
        }),

      sellAll: () =>
        set(s => ({
          balance: Math.round((s.balance + s.inventory.reduce((sum, i) => sum + i.price, 0)) * 100) / 100,
          inventory: [],
        })),
    }),
    { name: 'casehug-store' }
  )
);
