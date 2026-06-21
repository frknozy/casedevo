import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CaseOverride, Skin } from '@/lib/data';

export interface InventoryItem extends Skin {
  inventoryId: string;
  openedAt: string;
}

export interface UserStats {
  casesOpened: number;
  battlesPlayed: number;
  upgradesTried: number;
  bestDropValue: number;
  totalWonValue: number;
  totalCaseCost: number;
  totalSoldValue: number;
}

export interface ActivityItem {
  id: string;
  type: 'register' | 'login' | 'deposit' | 'case-open' | 'sell' | 'upgrade' | 'battle' | 'admin';
  message: string;
  amount?: number;
  createdAt: string;
}

export interface LiveDropItem {
  id: string;
  user: string;
  caseName: string;
  skin: Skin;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordPlain?: string;
  role: 'user' | 'admin';
  avatarColor: string;
  steamName: string;
  bio: string;
  joinedAt: string;
  lastLoginAt: string;
  balance: number;
  caseWinBoostPercent: number;
  inventory: InventoryItem[];
  stats: UserStats;
  activities: ActivityItem[];
}

interface Store {
  balance: number;
  inventory: InventoryItem[];
  lastDailyClaimAt: string | null;
  currentUserId: string | null;
  currentUser: UserAccount | null;
  caseOverrides: CaseOverride[];
  liveDrops: LiveDropItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  initialize: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<{ ok: boolean; message: string }>;
  login: (usernameOrEmail: string, password: string) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
  updateProfile: (profile: Partial<Pick<UserAccount, 'username' | 'email' | 'steamName' | 'bio' | 'avatarColor'>>) => Promise<{ ok: boolean; message: string }>;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  claimDailyBonus: (amount: number) => boolean;
  addToInventory: (skin: Skin) => string;
  removeItem: (inventoryId: string) => void;
  sellItem: (inventoryId: string, price: number) => void;
  sellSelected: (inventoryIds: string[]) => void;
  sellAll: () => void;
  recordCaseOpen: (caseName: string, totalCost: number, skins: Skin[]) => void;
  recordUpgrade: (won: boolean, message: string, amount?: number) => void;
  recordBattle: (won: boolean, message: string, amount: number) => void;
  addLiveDropsFromServer: (drops: LiveDropItem[]) => void;
  updateCaseOverride: (override: CaseOverride) => Promise<void>;
  resetCaseOverrides: () => Promise<void>;
  // Admin
  adminAddBalanceToUser: (userId: string, amount: number) => Promise<{ ok: boolean; message: string }>;
  adminRemoveBalanceFromUser: (userId: string, amount: number) => Promise<{ ok: boolean; message: string }>;
  adminSetCaseWinBoost: (userId: string, percent: number) => Promise<{ ok: boolean; message: string }>;
}

const nowIso = () => new Date().toISOString();
const money = (value: number) => Math.round(value * 100) / 100;

const emptyStats = (): UserStats => ({
  casesOpened: 0, battlesPlayed: 0, upgradesTried: 0,
  bestDropValue: 0, totalWonValue: 0, totalCaseCost: 0, totalSoldValue: 0,
});

const activity = (type: ActivityItem['type'], message: string, amount?: number): ActivityItem => ({
  id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  type, message, amount, createdAt: nowIso(),
});

function dbUserToAccount(dbUser: Record<string, unknown>, inventory: InventoryItem[]): UserAccount {
  const stats = (dbUser.stats as Record<string, number>) || {};
  const activities = (dbUser.activities as ActivityItem[]) || [];
  return {
    id: dbUser.id as string,
    username: dbUser.username as string,
    email: dbUser.email as string,
    role: dbUser.role as 'user' | 'admin',
    passwordPlain: (dbUser.password_plain as string) || undefined,
    avatarColor: (dbUser.avatar_color as string) || '#3b82f6',
    steamName: (dbUser.steam_name as string) || '',
    bio: (dbUser.bio as string) || '',
    joinedAt: dbUser.joined_at as string,
    lastLoginAt: dbUser.last_login_at as string,
    balance: dbUser.balance as number,
    caseWinBoostPercent: (dbUser.case_win_boost_percent as number) || 0,
    inventory,
    stats: {
      casesOpened: stats.casesOpened || 0,
      battlesPlayed: stats.battlesPlayed || 0,
      upgradesTried: stats.upgradesTried || 0,
      bestDropValue: stats.bestDropValue || 0,
      totalWonValue: stats.totalWonValue || 0,
      totalCaseCost: stats.totalCaseCost || 0,
      totalSoldValue: stats.totalSoldValue || 0,
    },
    activities,
  };
}

function dbInventoryToItems(rows: Array<{ id: string; skin_data: unknown; opened_at: string }>): InventoryItem[] {
  return rows.map((row) => ({
    ...(row.skin_data as Skin),
    inventoryId: row.id,
    openedAt: row.opened_at,
  }));
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
// Track the balance as of last DB fetch so we can send a delta instead of absolute value.
// This prevents admin-set balance from being overwritten by stale local state.
let lastSyncedBalance: number | null = null;

function scheduleSyncToBackend(userId: string, getState: () => Store) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    const state = getState();
    if (!state.currentUserId) return;
    const user = state.currentUser;
    const inventoryAdd = state.inventory.map((item) => {
      const { inventoryId, openedAt, ...skin } = item;
      return { id: inventoryId, skin_data: skin };
    });
    const balanceDelta = lastSyncedBalance !== null ? money(state.balance - lastSyncedBalance) : null;
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        balanceDelta,
        stats: user?.stats,
        activities: user?.activities,
        inventoryAdd,
      }),
    }).catch(console.error);
    lastSyncedBalance = state.balance;
  }, 1500);
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      balance: 100,
      inventory: [],
      lastDailyClaimAt: null,
      currentUserId: null,
      currentUser: null,
      caseOverrides: [],
      liveDrops: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      initialize: async () => {
        const { currentUserId } = get();

        // Load case overrides from backend
        try {
          const res = await fetch('/api/case-overrides');
          if (res.ok) {
            const data = await res.json();
            set({ caseOverrides: data.overrides || [] });
          }
        } catch { /* offline */ }

        // Refresh user data from backend if logged in
        if (currentUserId) {
          try {
            const res = await fetch(`/api/me?userId=${currentUserId}`);
            if (res.ok) {
              const data = await res.json();
              const inventoryItems = dbInventoryToItems(data.inventory || []);
              const user = dbUserToAccount(data.user, inventoryItems);
              lastSyncedBalance = user.balance;
              set({ currentUser: user, balance: user.balance, inventory: inventoryItems });
            } else {
              // Session invalid — log out
              set({ currentUserId: null, currentUser: null, balance: 100, inventory: [] });
            }
          } catch { /* keep local state */ }
        }

        set({ hasHydrated: true });
      },

      register: async (username, email, password) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
          });
          const data = await res.json();
          if (!data.ok) return { ok: false, message: data.message };

          // Auto-login after register
          return get().login(username, password);
        } catch {
          return { ok: false, message: 'Bağlantı hatası.' };
        }
      },

      login: async (usernameOrEmail, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password }),
          });
          const data = await res.json();
          if (!data.ok) return { ok: false, message: data.message };

          const inventoryItems = dbInventoryToItems(data.inventory || []);
          const user = dbUserToAccount(data.user, inventoryItems);
          lastSyncedBalance = user.balance;
          set({
            currentUserId: user.id,
            currentUser: user,
            balance: user.balance,
            inventory: inventoryItems,
          });
          return { ok: true, message: data.message };
        } catch {
          return { ok: false, message: 'Bağlantı hatası.' };
        }
      },

      logout: () => {
        set({ currentUserId: null, currentUser: null, balance: 100, inventory: [] });
      },

      updateProfile: async (profile) => {
        const userId = get().currentUserId;
        if (!userId) return { ok: false, message: 'Önce giriş yapmalısın.' };
        try {
          const patch: Record<string, string> = {};
          if (profile.username) patch.username = profile.username.trim();
          if (profile.email) patch.email = profile.email.trim().toLowerCase();
          if (profile.steamName !== undefined) patch.steam_name = profile.steamName;
          if (profile.bio !== undefined) patch.bio = profile.bio;
          if (profile.avatarColor !== undefined) patch.avatar_color = profile.avatarColor;

          const res = await fetch('/api/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, patch }),
          });
          const data = await res.json();
          if (!data.ok) return { ok: false, message: data.message };

          set((state) => ({
            currentUser: state.currentUser ? {
              ...state.currentUser,
              username: patch.username || state.currentUser.username,
              email: patch.email || state.currentUser.email,
              steamName: patch.steam_name ?? state.currentUser.steamName,
              bio: patch.bio ?? state.currentUser.bio,
              avatarColor: patch.avatar_color || state.currentUser.avatarColor,
            } : null,
          }));
          return { ok: true, message: 'Profil güncellendi.' };
        } catch {
          return { ok: false, message: 'Bağlantı hatası.' };
        }
      },

      addBalance: (amount) => {
        const userId = get().currentUserId;
        set((state) => {
          const newBalance = money(state.balance + amount);
          const act = activity('deposit', `$${amount.toFixed(2)} bakiye eklendi`, amount);
          return {
            balance: newBalance,
            currentUser: state.currentUser ? {
              ...state.currentUser,
              balance: newBalance,
              activities: [act, ...state.currentUser.activities].slice(0, 40),
            } : null,
          };
        });
        if (userId) scheduleSyncToBackend(userId, get);
      },

      deductBalance: (amount) => {
        if (get().balance < amount) return false;
        const userId = get().currentUserId;
        set((state) => {
          const newBalance = money(state.balance - amount);
          return {
            balance: newBalance,
            currentUser: state.currentUser ? { ...state.currentUser, balance: newBalance } : null,
          };
        });
        if (userId) scheduleSyncToBackend(userId, get);
        return true;
      },

      claimDailyBonus: (amount) => {
        const { lastDailyClaimAt } = get();
        const now = Date.now();
        const last = lastDailyClaimAt ? new Date(lastDailyClaimAt).getTime() : 0;
        if (now - last < 24 * 60 * 60 * 1000) return false;

        const userId = get().currentUserId;
        set((state) => {
          const newBalance = money(state.balance + amount);
          const act = activity('deposit', `Günlük bonus alındı: $${amount.toFixed(2)}`, amount);
          return {
            balance: newBalance,
            lastDailyClaimAt: new Date(now).toISOString(),
            currentUser: state.currentUser ? {
              ...state.currentUser,
              balance: newBalance,
              activities: [act, ...state.currentUser.activities].slice(0, 40),
            } : null,
          };
        });
        if (userId) scheduleSyncToBackend(userId, get);
        return true;
      },

      addToInventory: (skin) => {
        const inventoryId = `${skin.id}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const item: InventoryItem = { ...skin, inventoryId, openedAt: nowIso() };
        const userId = get().currentUserId;
        set((state) => ({
          inventory: [item, ...state.inventory],
          currentUser: state.currentUser ? {
            ...state.currentUser,
            inventory: [item, ...state.currentUser.inventory],
          } : null,
        }));
        if (userId) scheduleSyncToBackend(userId, get);
        return inventoryId;
      },

      removeItem: (inventoryId) => {
        const userId = get().currentUserId;
        set((state) => ({
          inventory: state.inventory.filter((i) => i.inventoryId !== inventoryId),
          currentUser: state.currentUser ? {
            ...state.currentUser,
            inventory: state.currentUser.inventory.filter((i) => i.inventoryId !== inventoryId),
          } : null,
        }));
        if (userId) {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, inventoryRemove: [inventoryId] }),
          }).catch(console.error);
        }
      },

      sellItem: (inventoryId, price) => {
        const userId = get().currentUserId;
        const act = activity('sell', `$${price.toFixed(2)} değerinde skin satıldı`, price);
        set((state) => {
          const newBalance = money(state.balance + price);
          const newInventory = state.inventory.filter((i) => i.inventoryId !== inventoryId);
          return {
            balance: newBalance,
            inventory: newInventory,
            currentUser: state.currentUser ? {
              ...state.currentUser,
              balance: newBalance,
              inventory: newInventory,
              stats: { ...state.currentUser.stats, totalSoldValue: money(state.currentUser.stats.totalSoldValue + price) },
              activities: [act, ...state.currentUser.activities].slice(0, 40),
            } : null,
          };
        });
        if (userId) {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, balance: get().balance, inventoryRemove: [inventoryId], stats: get().currentUser?.stats }),
          }).catch(console.error);
        }
      },

      sellSelected: (inventoryIds) => {
        const toSell = get().inventory.filter((i) => inventoryIds.includes(i.inventoryId));
        const total = money(toSell.reduce((sum, i) => sum + i.price, 0));
        const userId = get().currentUserId;
        const act = activity('sell', `${toSell.length} skin satıldı`, total);
        set((state) => {
          const newBalance = money(state.balance + total);
          const newInventory = state.inventory.filter((i) => !inventoryIds.includes(i.inventoryId));
          return {
            balance: newBalance,
            inventory: newInventory,
            currentUser: state.currentUser ? {
              ...state.currentUser,
              balance: newBalance,
              inventory: newInventory,
              stats: { ...state.currentUser.stats, totalSoldValue: money(state.currentUser.stats.totalSoldValue + total) },
              activities: [act, ...state.currentUser.activities].slice(0, 40),
            } : null,
          };
        });
        if (userId) {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, balance: get().balance, inventoryRemove: inventoryIds, stats: get().currentUser?.stats }),
          }).catch(console.error);
        }
      },

      sellAll: () => {
        const total = money(get().inventory.reduce((sum, i) => sum + i.price, 0));
        const allIds = get().inventory.map((i) => i.inventoryId);
        const userId = get().currentUserId;
        const act = activity('sell', 'Envanterdeki tüm skinler satıldı', total);
        set((state) => {
          const newBalance = money(state.balance + total);
          return {
            balance: newBalance,
            inventory: [],
            currentUser: state.currentUser ? {
              ...state.currentUser,
              balance: newBalance,
              inventory: [],
              stats: { ...state.currentUser.stats, totalSoldValue: money(state.currentUser.stats.totalSoldValue + total) },
              activities: [act, ...state.currentUser.activities].slice(0, 40),
            } : null,
          };
        });
        if (userId) {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, balance: get().balance, inventoryRemove: allIds, stats: get().currentUser?.stats }),
          }).catch(console.error);
        }
      },

      recordCaseOpen: (caseName, totalCost, skins) => {
        const userId = get().currentUserId;
        const username = get().currentUser?.username || 'Oyuncu';
        const createdAt = nowIso();
        const newDrops: LiveDropItem[] = skins.map((skin, index) => ({
          id: `drop-${Date.now()}-${index}-${Math.floor(Math.random() * 1e6)}`,
          user: username,
          caseName,
          skin,
          createdAt,
        }));

        set((state) => {
          const wonValue = money(skins.reduce((sum, s) => sum + s.price, 0));
          const act = activity('case-open', `${caseName} açıldı`, -totalCost);
          const user = state.currentUser;
          return {
            liveDrops: [...newDrops, ...state.liveDrops].slice(0, 60),
            currentUser: user ? {
              ...user,
              stats: {
                ...user.stats,
                casesOpened: user.stats.casesOpened + skins.length,
                bestDropValue: Math.max(user.stats.bestDropValue, ...skins.map((s) => s.price)),
                totalWonValue: money(user.stats.totalWonValue + wonValue),
                totalCaseCost: money((user.stats.totalCaseCost || 0) + totalCost),
              },
              activities: [act, ...user.activities].slice(0, 40),
            } : null,
          };
        });

        // Push live drops to backend (realtime for other users)
        if (newDrops.length > 0) {
          const dbDrops = newDrops.map((d) => ({
            id: d.id,
            user_id: userId || null,
            username: d.user,
            case_name: d.caseName,
            skin_data: d.skin,
            created_at: d.createdAt,
          }));
          fetch('/api/live-drops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drops: dbDrops }),
          }).catch(console.error);
        }

        if (userId) scheduleSyncToBackend(userId, get);
      },

      recordUpgrade: (won, message, amount) => {
        const userId = get().currentUserId;
        const act = activity('upgrade', message, amount ?? (won ? 1 : 0));
        set((state) => ({
          currentUser: state.currentUser ? {
            ...state.currentUser,
            stats: { ...state.currentUser.stats, upgradesTried: state.currentUser.stats.upgradesTried + 1 },
            activities: [act, ...state.currentUser.activities].slice(0, 40),
          } : null,
        }));
        if (userId) scheduleSyncToBackend(userId, get);
      },

      recordBattle: (won, message, amount) => {
        const userId = get().currentUserId;
        const act = activity('battle', message, won ? amount : -amount);
        set((state) => ({
          currentUser: state.currentUser ? {
            ...state.currentUser,
            stats: { ...state.currentUser.stats, battlesPlayed: state.currentUser.stats.battlesPlayed + 1 },
            activities: [act, ...state.currentUser.activities].slice(0, 40),
          } : null,
        }));
        if (userId) scheduleSyncToBackend(userId, get);
      },

      addLiveDropsFromServer: (drops) => {
        set((state) => {
          const existingIds = new Set(state.liveDrops.map((d) => d.id));
          const newDrops = drops.filter((d) => !existingIds.has(d.id));
          if (newDrops.length === 0) return {};
          return { liveDrops: [...newDrops, ...state.liveDrops].slice(0, 60) };
        });
      },

      updateCaseOverride: async (override) => {
        set((state) => {
          const exists = state.caseOverrides.some((item) => item.id === override.id);
          const caseOverrides = exists
            ? state.caseOverrides.map((item) => item.id === override.id ? { ...item, ...override } : item)
            : [...state.caseOverrides, override];
          return { caseOverrides };
        });
        const userId = get().currentUserId;
        if (userId) {
          fetch('/api/case-overrides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, override }),
          }).catch(console.error);
        }
      },

      resetCaseOverrides: async () => {
        set({ caseOverrides: [] });
        const userId = get().currentUserId;
        if (userId) {
          fetch('/api/case-overrides', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          }).catch(console.error);
        }
      },

      adminAddBalanceToUser: async (userId, amount) => {
        const requesterId = get().currentUserId;
        if (!requesterId) return { ok: false, message: 'Giriş yapmalısın.' };
        try {
          const res = await fetch('/api/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requesterId, targetUserId: userId, action: 'add_balance', amount }),
          });
          return await res.json();
        } catch {
          return { ok: false, message: 'Bağlantı hatası.' };
        }
      },

      adminRemoveBalanceFromUser: async (userId, amount) => {
        const requesterId = get().currentUserId;
        if (!requesterId) return { ok: false, message: 'Giriş yapmalısın.' };
        try {
          const res = await fetch('/api/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requesterId, targetUserId: userId, action: 'remove_balance', amount }),
          });
          return await res.json();
        } catch {
          return { ok: false, message: 'Bağlantı hatası.' };
        }
      },

      adminSetCaseWinBoost: async (userId, percent) => {
        const requesterId = get().currentUserId;
        if (!requesterId) return { ok: false, message: 'Giriş yapmalısın.' };
        try {
          const res = await fetch('/api/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requesterId, targetUserId: userId, action: 'set_boost', percent }),
          });
          return await res.json();
        } catch {
          return { ok: false, message: 'Bağlantı hatası.' };
        }
      },
    }),
    {
      name: 'casedevo-store',
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        lastDailyClaimAt: state.lastDailyClaimAt,
        // Keep local balance/inventory as fallback while loading from backend
        balance: state.balance,
        inventory: state.inventory,
      }),
      onRehydrateStorage: () => (state) => {
        // Don't set hasHydrated here — initialize() will do it after backend fetch
        state?.initialize();
      },
    }
  )
);
