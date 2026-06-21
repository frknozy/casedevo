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
  password: string;
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
  users: UserAccount[];
  currentUserId: string | null;
  caseOverrides: CaseOverride[];
  liveDrops: LiveDropItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
  claimDailyBonus: (amount: number) => boolean;
  addToInventory: (skin: Skin) => string;
  removeItem: (inventoryId: string) => void;
  sellItem: (inventoryId: string, price: number) => void;
  sellSelected: (inventoryIds: string[]) => void;
  sellAll: () => void;
  register: (username: string, email: string, password: string) => { ok: boolean; message: string };
  login: (usernameOrEmail: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  updateProfile: (profile: Partial<Pick<UserAccount, 'username' | 'email' | 'steamName' | 'bio' | 'avatarColor'>>) => { ok: boolean; message: string };
  adminAddBalanceToUser: (userId: string, amount: number) => { ok: boolean; message: string };
  adminRemoveBalanceFromUser: (userId: string, amount: number) => { ok: boolean; message: string };
  adminSetCaseWinBoost: (userId: string, percent: number) => { ok: boolean; message: string };
  recordCaseOpen: (caseName: string, totalCost: number, skins: Skin[]) => void;
  recordUpgrade: (won: boolean, message: string, amount?: number) => void;
  recordBattle: (won: boolean, message: string, amount: number) => void;
  updateCaseOverride: (override: CaseOverride) => void;
  resetCaseOverrides: () => void;
}

const nowIso = () => new Date().toISOString();
const money = (value: number) => Math.round(value * 100) / 100;

const emptyStats = (): UserStats => ({
  casesOpened: 0,
  battlesPlayed: 0,
  upgradesTried: 0,
  bestDropValue: 0,
  totalWonValue: 0,
  totalCaseCost: 0,
  totalSoldValue: 0,
});

const activity = (type: ActivityItem['type'], message: string, amount?: number): ActivityItem => ({
  id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  type,
  message,
  amount,
  createdAt: nowIso(),
});

const createUser = (
  username: string,
  email: string,
  password: string,
  role: UserAccount['role'] = 'user',
  balance = 100
): UserAccount => ({
  id: `${role}-${username.toLowerCase()}-${Date.now()}`,
  username,
  email,
  password,
  role,
  avatarColor: role === 'admin' ? '#f97316' : '#3b82f6',
  steamName: username,
  bio: role === 'admin' ? 'Casedevo yönetim hesabı' : 'Casedevo oyuncusu',
  joinedAt: nowIso(),
  lastLoginAt: nowIso(),
  balance,
  caseWinBoostPercent: 0,
  inventory: [],
  stats: emptyStats(),
  activities: [activity('register', `${username} hesabı oluşturuldu`)],
});

const adminUser: UserAccount = {
  id: 'admin-casedevo',
  username: 'admin',
  email: 'admin@casedevo.local',
  password: 'admin123',
  role: 'admin',
  avatarColor: '#f97316',
  steamName: 'Casedevo Admin',
  bio: 'Demo yönetici hesabı. Kullanıcı, kasa ve site özetlerini yönetir.',
  joinedAt: '2026-06-21T00:00:00.000Z',
  lastLoginAt: '2026-06-21T00:00:00.000Z',
  balance: 1000,
  caseWinBoostPercent: 0,
  inventory: [],
  stats: emptyStats(),
  activities: [activity('register', 'Admin hesabı hazırlandı')],
};

function syncCurrentUser<T extends Partial<UserAccount>>(set: (fn: (state: Store) => Partial<Store>) => void, patch: (user: UserAccount) => T) {
  set((state) => {
    if (!state.currentUserId) return {};
    const users = state.users.map((user) => {
      if (user.id !== state.currentUserId) return user;
      return { ...user, ...patch(user) };
    });
    const current = users.find((user) => user.id === state.currentUserId);
    return current ? { users, balance: current.balance, inventory: current.inventory } : { users };
  });
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      balance: 100.00,
      inventory: [],
      lastDailyClaimAt: null,
      users: [adminUser],
      currentUserId: null,
      caseOverrides: [],
      liveDrops: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      addBalance: (amount) => {
        set((state) => ({ balance: money(state.balance + amount) }));
        syncCurrentUser(set, (user) => ({
          balance: money(user.balance + amount),
          activities: [activity('deposit', `$${amount.toFixed(2)} bakiye eklendi`, amount), ...user.activities].slice(0, 40),
        }));
      },

      deductBalance: (amount) => {
        if (get().balance < amount) return false;
        set((state) => ({ balance: money(state.balance - amount) }));
        syncCurrentUser(set, (user) => ({ balance: money(user.balance - amount) }));
        return true;
      },

      claimDailyBonus: (amount) => {
        const { lastDailyClaimAt } = get();
        const now = Date.now();
        const last = lastDailyClaimAt ? new Date(lastDailyClaimAt).getTime() : 0;
        const canClaim = now - last >= 24 * 60 * 60 * 1000;
        if (!canClaim) return false;

        set((state) => ({
          balance: money(state.balance + amount),
          lastDailyClaimAt: new Date(now).toISOString(),
        }));
        syncCurrentUser(set, (user) => ({
          balance: money(user.balance + amount),
          activities: [activity('deposit', `Günlük bonus alındı: $${amount.toFixed(2)}`, amount), ...user.activities].slice(0, 40),
        }));
        return true;
      },

      addToInventory: (skin) => {
        const inventoryId = `${skin.id}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const item = { ...skin, inventoryId, openedAt: nowIso() };
        set((state) => ({ inventory: [item, ...state.inventory] }));
        syncCurrentUser(set, (user) => ({ inventory: [item, ...user.inventory] }));
        return inventoryId;
      },

      removeItem: (inventoryId) => {
        set((state) => ({ inventory: state.inventory.filter((item) => item.inventoryId !== inventoryId) }));
        syncCurrentUser(set, (user) => ({ inventory: user.inventory.filter((item) => item.inventoryId !== inventoryId) }));
      },

      sellItem: (inventoryId, price) => {
        set((state) => ({
          balance: money(state.balance + price),
          inventory: state.inventory.filter((item) => item.inventoryId !== inventoryId),
        }));
        syncCurrentUser(set, (user) => ({
          balance: money(user.balance + price),
          inventory: user.inventory.filter((item) => item.inventoryId !== inventoryId),
          stats: { ...user.stats, totalSoldValue: money(user.stats.totalSoldValue + price) },
          activities: [activity('sell', `$${price.toFixed(2)} değerinde skin satıldı`, price), ...user.activities].slice(0, 40),
        }));
      },

      sellSelected: (inventoryIds) => {
        const toSell = get().inventory.filter((item) => inventoryIds.includes(item.inventoryId));
        const total = money(toSell.reduce((sum, item) => sum + item.price, 0));
        set((state) => ({
          balance: money(state.balance + total),
          inventory: state.inventory.filter((item) => !inventoryIds.includes(item.inventoryId)),
        }));
        syncCurrentUser(set, (user) => ({
          balance: money(user.balance + total),
          inventory: user.inventory.filter((item) => !inventoryIds.includes(item.inventoryId)),
          stats: { ...user.stats, totalSoldValue: money(user.stats.totalSoldValue + total) },
          activities: [activity('sell', `${toSell.length} skin satıldı`, total), ...user.activities].slice(0, 40),
        }));
      },

      sellAll: () => {
        const total = money(get().inventory.reduce((sum, item) => sum + item.price, 0));
        set((state) => ({
          balance: money(state.balance + total),
          inventory: [],
        }));
        syncCurrentUser(set, (user) => ({
          balance: money(user.balance + total),
          inventory: [],
          stats: { ...user.stats, totalSoldValue: money(user.stats.totalSoldValue + total) },
          activities: [activity('sell', 'Envanterdeki tüm skinler satıldı', total), ...user.activities].slice(0, 40),
        }));
      },

      register: (username, email, password) => {
        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();
        if (cleanUsername.length < 3) return { ok: false, message: 'Kullanıcı adı en az 3 karakter olmalı.' };
        if (!cleanEmail.includes('@')) return { ok: false, message: 'Geçerli bir e-posta gir.' };
        if (password.length < 4) return { ok: false, message: 'Şifre en az 4 karakter olmalı.' };
        const exists = get().users.some((user) =>
          user.username.toLowerCase() === cleanUsername.toLowerCase() || user.email.toLowerCase() === cleanEmail
        );
        if (exists) return { ok: false, message: 'Bu kullanıcı adı veya e-posta zaten kayıtlı.' };

        const user = createUser(cleanUsername, cleanEmail, password);
        set((state) => ({
          users: [user, ...state.users],
          currentUserId: user.id,
          balance: user.balance,
          inventory: user.inventory,
        }));
        return { ok: true, message: 'Hesap oluşturuldu.' };
      },

      login: (usernameOrEmail, password) => {
        const key = usernameOrEmail.trim().toLowerCase();
        if (key === 'admin' && password === 'admin123') {
          const existingAdmin = get().users.find((account) => account.id === adminUser.id);
          const updated = {
            ...(existingAdmin || adminUser),
            password: 'admin123',
            lastLoginAt: nowIso(),
            activities: [activity('login', 'Admin hesabına giriş yapıldı'), ...(existingAdmin?.activities || adminUser.activities)].slice(0, 40),
          };
          set((state) => ({
            users: [updated, ...state.users.filter((account) => account.id !== adminUser.id)],
            currentUserId: updated.id,
            balance: updated.balance,
            inventory: updated.inventory,
          }));
          return { ok: true, message: 'Admin girişi başarılı.' };
        }
        const user = get().users.find((account) =>
          (account.username.toLowerCase() === key || account.email.toLowerCase() === key) && account.password === password
        );
        if (!user) return { ok: false, message: 'Kullanıcı bilgileri hatalı.' };

        const updated = {
          ...user,
          lastLoginAt: nowIso(),
          activities: [activity('login', 'Hesaba giriş yapıldı'), ...user.activities].slice(0, 40),
        };
        set((state) => ({
          users: state.users.map((account) => account.id === updated.id ? updated : account),
          currentUserId: updated.id,
          balance: updated.balance,
          inventory: updated.inventory,
        }));
        return { ok: true, message: 'Giriş başarılı.' };
      },

      logout: () => {
        set({ currentUserId: null, balance: 100, inventory: [] });
      },

      updateProfile: (profile) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return { ok: false, message: 'Önce giriş yapmalısın.' };
        const username = profile.username?.trim();
        const email = profile.email?.trim().toLowerCase();
        const duplicate = get().users.some((user) =>
          user.id !== currentUserId && (
            (!!username && user.username.toLowerCase() === username.toLowerCase()) ||
            (!!email && user.email.toLowerCase() === email)
          )
        );
        if (duplicate) return { ok: false, message: 'Bu kullanıcı adı veya e-posta kullanılıyor.' };
        set((state) => ({
          users: state.users.map((user) => user.id === currentUserId ? {
            ...user,
            ...profile,
            username: username || user.username,
            email: email || user.email,
            activities: [activity('login', 'Profil bilgileri güncellendi'), ...user.activities].slice(0, 40),
          } : user),
        }));
        return { ok: true, message: 'Profil güncellendi.' };
      },

      adminAddBalanceToUser: (userId, amount) => {
        const cleanAmount = money(amount);
        const currentUser = get().users.find((user) => user.id === get().currentUserId);
        const targetUser = get().users.find((user) => user.id === userId);
        if (currentUser?.role !== 'admin') return { ok: false, message: 'Bu işlem için admin yetkisi gerekli.' };
        if (!targetUser) return { ok: false, message: 'Kullanıcı bulunamadı.' };
        if (cleanAmount <= 0) return { ok: false, message: 'Eklenecek bakiye 0’dan büyük olmalı.' };

        set((state) => {
          const users = state.users.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                balance: money(user.balance + cleanAmount),
                activities: [
                  activity('deposit', `Admin tarafından $${cleanAmount.toFixed(2)} bakiye eklendi`, cleanAmount),
                  ...user.activities,
                ].slice(0, 40),
              };
            }
            if (user.id === currentUser.id) {
              return {
                ...user,
                activities: [
                  activity('admin', `${targetUser.username} hesabına $${cleanAmount.toFixed(2)} bakiye eklendi`, cleanAmount),
                  ...user.activities,
                ].slice(0, 40),
              };
            }
            return user;
          });
          const selected = users.find((user) => user.id === state.currentUserId);
          return {
            users,
            balance: selected?.balance ?? state.balance,
            inventory: selected?.inventory ?? state.inventory,
          };
        });

        return { ok: true, message: `${targetUser.username} hesabına $${cleanAmount.toFixed(2)} eklendi.` };
      },

      adminRemoveBalanceFromUser: (userId, amount) => {
        const cleanAmount = money(amount);
        const currentUser = get().users.find((user) => user.id === get().currentUserId);
        const targetUser = get().users.find((user) => user.id === userId);
        if (currentUser?.role !== 'admin') return { ok: false, message: 'Bu işlem için admin yetkisi gerekli.' };
        if (!targetUser) return { ok: false, message: 'Kullanıcı bulunamadı.' };
        if (cleanAmount <= 0) return { ok: false, message: 'Çıkarılacak bakiye 0’dan büyük olmalı.' };
        if (targetUser.balance < cleanAmount) return { ok: false, message: 'Kullanıcının bakiyesi bu tutar için yetersiz.' };

        set((state) => {
          const users = state.users.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                balance: money(user.balance - cleanAmount),
                activities: [
                  activity('admin', `Admin tarafından $${cleanAmount.toFixed(2)} bakiye çıkarıldı`, -cleanAmount),
                  ...user.activities,
                ].slice(0, 40),
              };
            }
            if (user.id === currentUser.id) {
              return {
                ...user,
                activities: [
                  activity('admin', `${targetUser.username} hesabından $${cleanAmount.toFixed(2)} bakiye çıkarıldı`, -cleanAmount),
                  ...user.activities,
                ].slice(0, 40),
              };
            }
            return user;
          });
          const selected = users.find((user) => user.id === state.currentUserId);
          return {
            users,
            balance: selected?.balance ?? state.balance,
            inventory: selected?.inventory ?? state.inventory,
          };
        });

        return { ok: true, message: `${targetUser.username} hesabından $${cleanAmount.toFixed(2)} çıkarıldı.` };
      },

      adminSetCaseWinBoost: (userId, percent) => {
        const currentUser = get().users.find((user) => user.id === get().currentUserId);
        const targetUser = get().users.find((user) => user.id === userId);
        const cleanPercent = Math.max(0, Math.round((Number(percent) || 0) * 100) / 100);
        if (currentUser?.role !== 'admin') return { ok: false, message: 'Bu işlem için admin yetkisi gerekli.' };
        if (!targetUser) return { ok: false, message: 'Kullanıcı bulunamadı.' };

        set((state) => {
          const users = state.users.map((user) => {
            if (user.id === userId) {
              return { ...user, caseWinBoostPercent: cleanPercent };
            }
            if (user.id === currentUser.id) {
              return {
                ...user,
                activities: [
                  activity('admin', `${targetUser.username} kasa avantajı +%${cleanPercent.toFixed(2)} olarak ayarlandı`),
                  ...user.activities,
                ].slice(0, 40),
              };
            }
            return user;
          });
          const selected = users.find((user) => user.id === state.currentUserId);
          return {
            users,
            balance: selected?.balance ?? state.balance,
            inventory: selected?.inventory ?? state.inventory,
          };
        });

        return { ok: true, message: `${targetUser.username} için gizli kasa avantajı +%${cleanPercent.toFixed(2)} oldu.` };
      },

      recordCaseOpen: (caseName, totalCost, skins) => {
        const wonValue = money(skins.reduce((sum, skin) => sum + skin.price, 0));
        const currentUser = get().users.find((user) => user.id === get().currentUserId);
        const createdAt = nowIso();
        const newDrops = skins.map((skin, index) => ({
          id: `drop-${Date.now()}-${index}-${Math.floor(Math.random() * 1e6)}`,
          user: currentUser?.username || 'Oyuncu',
          caseName,
          skin,
          createdAt,
        }));
        if (newDrops.length > 0) {
          set((state) => ({ liveDrops: [...newDrops, ...state.liveDrops].slice(0, 60) }));
        }
        syncCurrentUser(set, (user) => ({
          stats: {
            ...user.stats,
            casesOpened: user.stats.casesOpened + skins.length,
            bestDropValue: Math.max(user.stats.bestDropValue, ...skins.map((skin) => skin.price)),
            totalWonValue: money(user.stats.totalWonValue + wonValue),
            totalCaseCost: money((user.stats.totalCaseCost || 0) + totalCost),
          },
          activities: [activity('case-open', `${caseName} açıldı`, -totalCost), ...user.activities].slice(0, 40),
        }));
      },

      recordUpgrade: (won, message, amount) => {
        syncCurrentUser(set, (user) => ({
          stats: { ...user.stats, upgradesTried: user.stats.upgradesTried + 1 },
          activities: [activity('upgrade', message, amount ?? (won ? 1 : 0)), ...user.activities].slice(0, 40),
        }));
      },

      recordBattle: (won, message, amount) => {
        syncCurrentUser(set, (user) => ({
          stats: { ...user.stats, battlesPlayed: user.stats.battlesPlayed + 1 },
          activities: [activity('battle', message, won ? amount : -amount), ...user.activities].slice(0, 40),
        }));
      },

      updateCaseOverride: (override) => {
        set((state) => {
          const exists = state.caseOverrides.some((item) => item.id === override.id);
          const caseOverrides = exists
            ? state.caseOverrides.map((item) => item.id === override.id ? { ...item, ...override } : item)
            : [...state.caseOverrides, override];
          return { caseOverrides };
        });
        syncCurrentUser(set, (user) => ({
          activities: [activity('admin', `${override.id} kasa ayarı güncellendi`), ...user.activities].slice(0, 40),
        }));
      },

      resetCaseOverrides: () => {
        set({ caseOverrides: [] });
        syncCurrentUser(set, (user) => ({
          activities: [activity('admin', 'Kasa ayarları varsayılana döndü'), ...user.activities].slice(0, 40),
        }));
      },
    }),
    {
      name: 'casedevo-store',
      partialize: (state) => ({
        balance: state.balance,
        inventory: state.inventory,
        lastDailyClaimAt: state.lastDailyClaimAt,
        users: state.users,
        currentUserId: state.currentUserId,
        caseOverrides: state.caseOverrides,
        liveDrops: state.liveDrops,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<Store> | undefined;
        const users = (persistedState?.users?.some((user) => user.id === adminUser.id)
          ? persistedState.users
          : [adminUser, ...(persistedState?.users || [])]
        )?.map((user) => ({ ...user, caseWinBoostPercent: user.caseWinBoostPercent ?? 0 }));
        return { ...current, ...persistedState, users, liveDrops: persistedState?.liveDrops || [] };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
