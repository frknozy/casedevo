import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Skin } from '@/lib/data';

interface InventoryItem extends Skin {
  inventoryId: string;
  openedAt: Date;
}

interface Store {
  balance: number;
  inventory: InventoryItem[];
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  addToInventory: (skin: Skin) => void;
  sellItem: (inventoryId: string, price: number) => void;
  sellAll: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      balance: 100.00,
      inventory: [],
      addBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
      deductBalance: (amount) => {
        if (get().balance < amount) return false;
        set((state) => ({ balance: state.balance - amount }));
        return true;
      },
      addToInventory: (skin) =>
        set((state) => ({
          inventory: [
            {
              ...skin,
              inventoryId: `${skin.id}-${Date.now()}-${Math.random()}`,
              openedAt: new Date(),
            },
            ...state.inventory,
          ],
        })),
      sellItem: (inventoryId, price) =>
        set((state) => ({
          balance: state.balance + price,
          inventory: state.inventory.filter((i) => i.inventoryId !== inventoryId),
        })),
      sellAll: () =>
        set((state) => ({
          balance: state.balance + state.inventory.reduce((sum, i) => sum + i.price, 0),
          inventory: [],
        })),
    }),
    { name: 'casehug-store' }
  )
);
