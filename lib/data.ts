export type Rarity = 'consumer' | 'industrial' | 'milspec' | 'restricted' | 'classified' | 'covert' | 'extraordinary';

export interface Skin {
  id: string;
  name: string;
  weapon: string;
  rarity: Rarity;
  price: number;
  image: string;
  wear?: string;
  statTrak?: boolean;
  dropChance?: number;
}

export interface Case {
  id: string;
  name: string;
  image: string;
  price: number;
  tag?: 'HOT' | 'NEW' | 'BEST VALUE';
  skins: Skin[];
}

export interface CaseOverride {
  id: string;
  price?: number;
  enabled?: boolean;
  tag?: Case['tag'] | 'NONE';
  note?: string;
  skinChances?: Record<string, number>;
}

export function applyCaseOverrides(baseCases: Case[], overrides: CaseOverride[]): Case[] {
  const byId = new Map(overrides.map((override) => [override.id, override]));
  return baseCases
    .map((caseItem) => {
      const override = byId.get(caseItem.id);
      if (!override) return caseItem;
      const hasSkinChances = override.skinChances && Object.keys(override.skinChances).length > 0;
      return {
        ...caseItem,
        price: override.price ?? caseItem.price,
        tag: override.tag && override.tag !== 'NONE' ? override.tag : undefined,
        skins: hasSkinChances
          ? caseItem.skins.map((skin) => ({
            ...skin,
            dropChance: override.skinChances?.[skin.id] ?? getDefaultCaseSkinChance(caseItem.skins, skin, override.price ?? caseItem.price),
          }))
          : caseItem.skins,
      };
    })
    .filter((caseItem) => byId.get(caseItem.id)?.enabled !== false);
}

export const RARITY_COLORS: Record<Rarity, string> = {
  consumer: '#b0c3d9',
  industrial: '#5e98d9',
  milspec: '#4b69ff',
  restricted: '#8847ff',
  classified: '#d32ce6',
  covert: '#eb4b4b',
  extraordinary: '#e4ae39',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  consumer: 'Tüketici Sınıfı',
  industrial: 'Endüstriyel Sınıf',
  milspec: 'Mil-Spec',
  restricted: 'Kısıtlı',
  classified: 'Gizli',
  covert: 'Çok Gizli',
  extraordinary: 'Olağanüstü',
};

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  consumer: 0,
  industrial: 0,
  milspec: 79.92,
  restricted: 15.98,
  classified: 3.2,
  covert: 0.64,
  extraordinary: 0.26,
};

const CASE_RARITY_FALLBACKS: Partial<Record<Rarity, Rarity>> = {
  consumer: 'milspec',
  industrial: 'milspec',
};

const DEFAULT_CASE_RETURN_RATE = 0.85;

const CASE_RARITY_BASE_WEIGHTS: Record<Rarity, number> = {
  consumer: 1,
  industrial: 1,
  milspec: 1,
  restricted: 0.28,
  classified: 0.07,
  covert: 0.016,
  extraordinary: 0.002,
};

function getLegacyDefaultCaseSkinChance(skins: Skin[], target: Skin): number {
  const rarity = CASE_RARITY_FALLBACKS[target.rarity] ?? target.rarity;
  const rarityPool = skins.filter((skin) => (CASE_RARITY_FALLBACKS[skin.rarity] ?? skin.rarity) === rarity);
  if (rarityPool.length === 0) return 0;
  return RARITY_WEIGHTS[rarity] / rarityPool.length;
}

function calculateExpectedValue(skins: Skin[], chances: number[]): number {
  return skins.reduce((sum, skin, index) => sum + skin.price * (chances[index] / 100), 0);
}

function getBoostedReturnRate(returnBoostPercent = 0): number {
  const cleanBoost = Math.max(0, returnBoostPercent);
  return DEFAULT_CASE_RETURN_RATE * (1 + cleanBoost / 100);
}

function buildPriceBalancedCaseChances(skins: Skin[], casePrice: number, returnBoostPercent = 0): number[] {
  if (!Number.isFinite(casePrice) || casePrice <= 0 || skins.length === 0) {
    return skins.map((skin) => getLegacyDefaultCaseSkinChance(skins, skin));
  }

  const targetValue = casePrice * getBoostedReturnRate(returnBoostPercent);
  const chanceForExponent = (exponent: number) => {
    const weights = skins.map((skin) => {
      const normalizedPrice = Math.max(0.04, skin.price / casePrice);
      const recoveryBoost = skin.price >= casePrice * 0.65 && skin.price <= casePrice * 1.65 ? 1.75 : 1;
      const lowValueRelief = skin.price < casePrice * 0.45 ? 1.18 : 1;
      return CASE_RARITY_BASE_WEIGHTS[skin.rarity] * recoveryBoost * lowValueRelief * Math.pow(normalizedPrice, exponent);
    });
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    if (total <= 0) return skins.map(() => 100 / skins.length);
    return weights.map((weight) => (weight / total) * 100);
  };

  let low = -4;
  let high = 4;
  let best = chanceForExponent(0);
  let bestDistance = Math.abs(calculateExpectedValue(skins, best) - targetValue);

  for (let i = 0; i < 48; i++) {
    const mid = (low + high) / 2;
    const chances = chanceForExponent(mid);
    const value = calculateExpectedValue(skins, chances);
    const distance = Math.abs(value - targetValue);
    if (distance < bestDistance) {
      best = chances;
      bestDistance = distance;
    }
    if (value < targetValue) low = mid;
    else high = mid;
  }

  return best;
}

export function getDefaultCaseSkinChance(skins: Skin[], target: Skin, casePrice?: number): number {
  if (casePrice !== undefined) {
    const index = skins.findIndex((skin) => skin.id === target.id);
    if (index >= 0) return buildPriceBalancedCaseChances(skins, casePrice)[index] ?? 0;
  }
  return getLegacyDefaultCaseSkinChance(skins, target);
}

export function getCaseSkinChance(skins: Skin[], target: Skin, casePrice?: number): number {
  const customTotal = skins.reduce((sum, skin) => sum + Math.max(0, skin.dropChance ?? 0), 0);
  if (customTotal > 0) {
    return (Math.max(0, target.dropChance ?? 0) / customTotal) * 100;
  }
  return getDefaultCaseSkinChance(skins, target, casePrice);
}

export function formatChance(chance: number): string {
  if (chance >= 1) return chance.toFixed(2);
  if (chance >= 0.1) return chance.toFixed(3);
  return chance.toFixed(4);
}

const img = (hash: string) => `/api/skin-image/${hash}/360fx360f`;

// Real Steam CDN image hashes
const HASHES: Record<string, string> = {
  "r1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlV6xoIfSsHW-f1dF-v-1mcCW6khUz_TzRnNigd3-SOg4lAsF1QOQN4xS4wdHnMu-0swaMjIxExSSoiyof6ih1o7FVGHIdVhw",
  "r2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSNPWeG2yR1NF6ueZhW2ewlBtx5W6AmYv9JS6XaAV1CJEmTeUL4UTpxNzjZO3jtgaIjN9ExCuskGoXuRnyRhBA",
  "r3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf-jFk7uW-V6hkLfKcMXSewOVzj-xsSyCmmFN0tzvcnor9IC7CP1BxDpVyEO9Zt0Swx4bvP-7ktQfZj4kTn3n2hi8b8G81tHGU9aNy",
  "r4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1Y-s27ZbRSI_yGGmSY_uV_s-pWQiy3nAgq_T6AyNasJ3iePQByW5NwTeEKsxbqw9LhYePitlbZ34wWxXqsjyhPvy11o7FVOjdBjQA",
  "r5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0PG7V7Q_cKDDMWOVwuJ_vuRWQyC0nQlp4jnTyNqodHyXOlQkDZtzF-UN4BjukYeyZuLn5Qbaj4NEzy3_3ywd5zErvbh-3lU8Iw",
  "r6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj-dsSi26mxoYtS-AlJXgHibCOl9lV4x2RbMLtBC8lYLjN7vh5QGMit0WxX-viC8a6S5v5LsFWfUg_fbSiwDAL_RjttkAwiOv",
  "r7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-eAWie_vx3suNgWxa_nBovp3PXyo76Ii_FPAQmDMYiTLYDthm_kdbmZry2slCLjoMQzC7_3y1J7nts_a9cBi_qumx0",
  "r8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLjm4Dv8TRe_c2pe5t_eM-RD2mRz-9JveRtRjy-2xwlsWmGmdmhJ3uROAJxA8dzQ-Ff5kGwx9XlNrm2tg3ZgoNFny2q3XtXrnE8X2QHmf8",
  "r9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf-jFk_6v-V6poL-GGC2Ke_uNztOh8QmfkkUtzsW_Tydz_cH2ebFNxW5EhFOdYtEXqkd21Pr_ksgyP2dpGzST-kGoXuepCyzQM",
  "r10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-AD2ybwOVjj-xsSyCmmFMk5mnRzdeqdSnCPVN2DpV3QeELtELrlIbiPrzqsVOMjdlBnySvjH5O8G81tOTP5a5f",
  "r11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk6OGRe6dsMs-VHGaXzOt4pPJWTSWylhYYvjiBk5r0b3mXZg5xDsYmQ-NetUK7kdzkP-jh5AaNgosUmCWr3Hga7iZpsroCA6U7uvqAa4cdOU4",
  "r12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsPz-R1Y-s2jePF-JM-CG26TytF6ufB8Ri2ygRQovQKIn4vwNCaJalAgD8Z3E-YM4RiwmtXiP7m3sgbX3oMQyCr4jC5BvSxv5ekFB6J2-7qX0V-vbQmk7Q",
  "r13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f_jdk4uL3V7d4MPWBAm6XyfpJveRtRjy-20526j_QmNyqdy3GPwEgDsF2TLMMsRi4m4XiP-zm5gaN399Dniyrjy5XrnE8iqhs68w",
  "r14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiFO0OL8PfRSMvWRG26c1dF7teVgWiT9xkxx4TjcyY2uIH7EbgEjD5N3RuJe5kbpl9LuZeLg5Afbg48XxHn_hzQJsHi_ocEqCQ",
  "r15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLimcO1qx1Y-s29b_E4c8-QF2WV0-h5ouJscCS2kRQyvnPVnNaocHORaAcjDsNzQu4O50K_xtS0YuPh7gWM2d5CxS33235J6Xpv_a9cBsGgpOzQ",
  "r16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wiFO0Oara_1SJuKWC2OfzNF7teVgWiT9xU8j5GSAzIqtJXLGa1UoCJFxROYMtBTuw9znMum37wXWio0TzX3-jTQJsHjT5BOYKg",
  "r17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiFO0P-vb_NSKf6AAWqeyO9JveRtRjy-2x925mXXnoqpdH6XPA8gCpokF7Vc5kPrwNa1NLiw4Qfc2NkRxSX_2yhXrnE8JmdnF_k",
  "r18": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5T441rsfhr9kYDl7h1I4_utY5t_JeqSAFidxOp_pewnGn23wE126mSAm939JHrCaQInDJR1ReBes0bsk4LgMbvlsQzZ2NkRzjK-0H3x8LWufg",
  "k1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQ0OKheqdoLPGaAFicyOl-pK8xGH_nwUt1sGrSz9ivcHKQOAcjXMYkRu5Yuxe4lYCyZOq25VSM2oMT02yg2UxBSEgA",
  "k2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_DVL0OarZbRoMvWXMWuZxuZi_uM6SXngxR5-smTXw4ugIi6RbVcpXsN1ELUDtxPrktOyNL7h4g2P2tpbjXKpKIbjbD4",
  "k3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_3HDzaD_ux6seJicCW8gQg0jDGMnYftb3-eOgEpDcFyQuMMtRG8kIbhMuK051ba2IMQyH6r3yof5ilv4bwLWfU7uvqA7qRNHGA",
  "k4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLln4Xl7x1B6ue9V7BlNf6XC3WvxuFyj-1gSCGn2xl2sm7XnI6hdC-XPAcmXsF2RLIP4xbslty2NLvqswePjYlEySn33S9XrnE8cYTqlUY",
  "k5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSNeODHViUzulxqd5lRi67gVMl62nUyd2scnOVPAcgA5J2TOFY5xLrlN22YbzgsQaI2IlHyiWojnwa8G81tErOD-_J",
  "k6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c4_2tY5tvMvmQBVidzuByouhoQRa_nBovp3PXzov9cyjDbwckXMMkF7IIthOwwNDmY-rq4AzfjItMyH_9iC0YuC04_a9cBk5_kH3q",
  "k7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwi8P7qaRe6psK_WRB3OV_uJ_t-l9AXjnw0Qh5GqGn9b_dH3Cbg4nCcAhRLIM4BW7mtXmM7jjtAXai40WmHngznQeK6EUrpc",
  "k8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRbq17JeOWGGKe_uZvsvNgSxa_nBovp3OBmd6oJXyeaQ9yCsZxEOICsUO7kdK0Y-qxtFCN2YsQnCv7i39N7ixp_a9cBsh2vVQD",
  "k9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf8DIM0Pi7e7BSM_2aAmKvzedxuPUnHXrkzU4i4z-Dno6sci3BaQApDpN4R-cCthnqx4W2MunhtgCI3d0QmzK-0H0MYFOvtA",
  "k10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLin4Hl-S1d6c29abNoJP-VCFiXwONzot5kSi26gBBp6m3Vy9ircSnGPw8jAsF4EONZsBC7lNfiP7nksgbb3d0Uyyn7hy9M7zErvbiPkpvBfw",
  "k11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1W7vH_OJtkLPyGHW6fz9F6ueZhW2e2lBsk4WvXw974diiSblV1DMBxRrEJu0PrwNy1Mruw4gKK3d0TynmskGoXuUBgCcQQ",
  "k12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLijZGwpR1I_PX-MJtpJeqSHXOCxNF7teVgWiT9zUUi5WnSy934ICmUO1coDpt1R-MPsROwkdHlNevj4QXdiIpFySmrjTQJsHhk_S8lFA",
  "k13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwixU-fORbLZsK_uSHFidxOp_pewnHHnjxBx-5jjRydutdn-TPQ51XpQmQrIM4EOwx9O1Y-7mswaKgowRxDK-0H0zYVmmQg",
  "k14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk9___OPU5H_mBC32FzOdJveRtRjy-20l0sGSBno36J3mTbg4iD5JyRu8PtUS5ktPkZLjmsgHb34hEmCz7jCJXrnE8XxaiWKA",
  "k15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL0kp_0-B1f-vOiV6ZoMvWHGmaD_uJzpOloQxa0hxQpjDCAnobsLGXGaAAiDsB4QeBbsxO7m9yyZe3i5wWK2I8WxST9jSpI6C5jtu0GVaMl5OSJ2Fp7bfMj",
  "k16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wjZe7KuRYrFjK-mSHGOvxOBxue9sSju6mxoYvjiBk5r0b3KeO1AgW5pwTLMN4Bm8l9bmN-zg7gCKg45Byi_2jyJP6CY94LpXUaM7uvqAhU80jJA",
  "k17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1O4uL6PZtsM-OWA2WcxOpJte9uRie2qhAitzSQl8H6cX-TaFV2X5R5ELMM5hW7xtLjYrm34QOKit0XyST2jSJN7Hpo5-5QT-N7rYgPZaox",
  "k18": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Q-vm8YZtsIc-VD2OV_uJ_t-l9AXyyzEohsGvVn4moIi-VO1N2CJR1E-UD4BXtkIXhMe2x7lbej4tEnyzgznQeN9c5PgA",
  "d1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSLvmUBnOHyP1-j-xsSyCmmFMit2nVy434IHLDbwcmWcRzQrYNska_xoDjPuOx5QOPjY4RzC342itM8G81tODLUZAk",
  "d2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f-jFk4uL3V7d5IeKfB2CY1dF6ueZhW2flkUtztz_SzYypJSqRalUhDJNwQO4PsBXtx9HkN-K37w3bgohGmHn3kGoXuZ3lRdvF",
  "d3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL0kp_0-B1Y-s2rZK15JeOsDGKHwPxzj-xsSyCmmFNw4jnUy9etcnPEbAQmC8NwQ-Rbt0a_ltC1Ze_i7wXdi9hDzi362Hwb8G81tNuUcXJQ",
  "d4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3n5vh7h1c_M2oaalsM8-BD3eZxdFzqeR6cCS2kRQyvnOAnt2qdHyTbQEiWJIkEO5ftkLskN21Ye-3sQGMgo4XxSr-jXkY7npt_a9cBgfDFlKY",
  "d5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf_jdk4uL5V6JoIeKsA2KUyPt7_rBvFy2wx01xsjmDmdz4dH_EbFAoAptxQrNYtRjsm4CzPujn4wLW2otbjXKpALPBt8Y",
  "d6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_eAMWrEwL9lj-hnXCa-mxQmjDCAnobsLGXEPAchWcN4ReIM4Rjpk9CxN762tQXa395DyH732ylA6ilosupRWKUt5OSJ2NcRB1VD",
  "d7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzl4zv8x1Y-s2sYb5iLs-AHmaTxO13pN5kSi26gBBp5G3RnImhJH2XZlAiA8RwEONZ5kWxltzuMu6x5wCIit4XzSqtiy4a6TErvbiPYX6fPQ",
  "d8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_vp5j-lsQyWMmBgjuiiI1I6qdH6fbgAoApFyRrJf4xnumoDnM-7j41Pbgt8TyCT72CxK6SttsrscEf1y0Tw_DYE",
  "d9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7v-RcKlSOv-eDG6V_uFwtuRnXCClkCIqtjmMj4K3dHOVbA8mA5okFuYOsBO9kdHnPry3tlHb2NgUyiz_jSJN6ytq47lRAL1lpPMVbUGW2g",
  "d10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2zYXnrB1Y-s2pO7dqcc-UAmaUxNF7teVgWiT9xUR36m_Wm9ioJX7FalAiD5AjRuYKsETsldW1ZOvg71eLgt8Qm33-jTQJsHiK03zX7w",
  "d11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk_OKRe6dsMs-QBm6Tyut4tuhuRz2MmBgjuiiI1NegI36eaA92DZp4QOMMuxG6lNLiMbjrslfW3ogXnySojisavHs-5uYcEf1yvaW_SHQ",
  "d12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLin4Hl-S1d6c2tfZt-IeeWCmiWx9F5pehjTha-kBkupjDLntn9JynDblUpXpchRORbtBDpwYXhM7mz71HYjdkXmCir2HlLuH1i4PFCD_Rc09dqgQ",
  "d13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0PG7V7Q_K8-VAn6Zz-lJtPNsTiSMmBgjuiiI1Nf_IyrDaVd0CsMjTOILtkPqld3hP-3q4QHZj4pDmSiv3C9M6H5o4-scEf1yxl9HG_A",
  "d14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRa7FSJvmFC3SV1-t4j-BlXyGyqhIqtjqEpYL8JSLSMxgiCcckReQJtRWxk9TuZLzitVGP2toQzCz-iXgc5yhjsLsFUqQjq_DSkUifZkUB6dJc",
  "d15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-DB3-ZxNF7teVgWiT9l09y6m6HyNqtJHyUbQMiCZsmQLQJtUS_wIDvNb625APXj45Byn74jTQJsHjzn23giA",
  "d16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiFO0P-vb_NSMOKWCm6T1eFkj-xsSyCmmFMjt2iGy9uuJ33CPAUoDZt1R-MKu0Psm4flM-_nslSM2t4Tzi72hyMY8G81tL9psQ_4",
  "d17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1Z-ua6bbZrLOmsDXKvw_tipOR7SSWqqhEooTi6l4r9KD7KcAYnC5V5EbEItxDqwdDhYurntQOKgoJGmHmoiXlN5yw9tb4CV_cn8qDJz1aWe-z5ekc",
  "f1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSIf6GDG6D_uNztOh8QmfilEojtW2AmNaodS6RaQMnXpQjTLQJtBLtxNXhZO-0slDX344UmXn2kGoXucROEi-9",
  "f2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-DHG6e1f1iouRoQha-kBkupjDLz9_6c3mWPFBxX8N0EOMIsULpmtHjPuvq41bc2dhAzy3_2ngfvHpt5_FCD_RJLjxjaQ",
  "f3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSMeWWC2mWwOdkqd5kSi26gBBp4G7dm4qtJ3yTbVMpCcNyFLEJ5xHqlNfvZOKwtlHWjIIRxCT5hi4b6zErvbhXXMLnPQ",
  "f4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-WF2KTzuBiseJ9cCW6khUz_T-GyNavdCqRawN1CMFwTOcO5hO7loXiY-zmsQKPi44QzHj22ikcvy11o7FVfFOBmfY",
  "f5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7OeRcKk8cKHHMWad1OJzpN5rQzy2qhEutDWR1N-hI3yWbVRyD8YiEOVZ50TqmoKyZb7rtVfWgosQzX7-3X9K5yc4tr4cEf1yVvkijss",
  "f6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiFO0P-vb_NSLf-dHXOV09F1se1lcCS2kRQyvnPRm4n7dHLCOgMmW5d5ReAMu0a-x4fgZr_l4FTYgthHyy_5j35Nuy4-_a9cBgOeapf3",
  "f7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wiVI0Oara_1SJ-WWHG6cze9JveRtRjy-20QmsWXUzImvJyrFPFcnCMRzQLUOthewm4WxYeLns1OL39pFzCyq3SNXrnE8-aGB2aI",
  "f8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-aHWifz-B3j-xsSyCmmFMh6m7Wz9z8JC2fawYmC5NwQ7IJu0W-m9HuY-jm4lCIjN4TmyX-iiNL8G81tAm1_UkI",
  "f9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2n5rp8SNJ0PW9V6NsLPmfMXeYzut4uflWQiy3nAgq_WyEmd3_cSqVbgV1D5J3QrEPskW9mtLiPu7k7wWL2owQnyT6hn8YvX11o7FVmll_Ct8",
  "f10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsPz-R1c_M2jePF-JM-ED3SExOJ3vuVWQyy0lB4-jDCAnobsLGWVOwd1XJcmRuZZthewlYXvMO7h5wHY2IpFyyStinhNuyZi4rtTA6Bz5OSJ2Lp1OT-L",
  "f11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiFO0OL8PfRSI_GAHWKE1etJveRtRjy-20h14GnRzY2gcS-UPABxWcB0FOcM5hS8kYKxZOLl5gze34NDzyv_23lXrnE8AHot8o8",
  "f12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0PO_V7Q_cKDDMWuf0vpJp-57Qy2MmBgjuiiI1NquIn-XaFQiD5cmEOdY5hW5wdexNu-25gXdjo5Gyyn5jCkcvy5j4egcEf1yoYbSNtc",
  "f13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLimcO1qx1c_M29b_E4c8-BG3SE2NF7teVgWiT9w0p-5jnSztegeHySaQQpDsF1E-MKthO5xIGyNe-251GI2NoTyiv23zQJsHjTRxEa0Q",
  "f14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLijZGwpR1Y-s29e6M9eM-eD26ex_x3veRWQiy3nAgq_T-Gwomrc3uUPw4hCcZ3R7IKskbpwYWxM-6xsw3b2YgRyyj6jn5Kvyl1o7FVqhF9544",
  "f15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf-jFk_6v-V6diLuSSB2mV09F7teVgWiT9wx53622GyN6hIi6TOAAkX5t2E7YC5ka9mtfiZrvm7gHaiY4Xz3n22DQJsHjVPou5ew",
  "f16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzl4zv8x1c_M2sYb5iLs-bC2uc0-9_tOR7cCS2kRQyvnPSyd77IyqeOFMjDpJ0E-cCskK7kIXuMeOz7gHfjIMWmHj8jiJB6Sg4_a9cBqN05Yk2",
  "f17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1I5PeibbBiLs-SA1iKxOxksd5lRi67gVMh62_RzdygJHORZlAlDpZwQOYM4Ri5k4HhNezg4wOLg49Nyy772y9J8G81tBUopZdW",
  "p1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj-J6SCbhxUl_jDCAnobsLGWUPQ4hDZBwRuQM40S8w9zmYu3l4VHaio8TyCT62yhPuydq4b4EVPJw5OSJ2Jt3xOmm",
  "p2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK6HLMXCR0-N3ueVsQRa-kBkupjDLwon6J3_DaAIgXpF2QO9YsBK8wYbnYuuwtAHa2Y9AmCz53C9N5ytssvFCD_SWITPM5g",
  "p3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlJfA6H-CbD2mEzuNJtOh6XTyjgRI1jDCAnobsLGXBPQ8mDMZyFucN4BLrw9HhMLiw51Ddi45ExX_9jXtN7S0-tekFAqYj5OSJ2LJWXMuH",
  "p4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-dD2SCxNF7teVgWiT9xht3tWzXy9j_eXuWagAlXJVxFOcI4BK7ltXmP-rltgCPjYhEnCuqhzQJsHgdu4rIbA",
  "p5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiVI0P-vb_NSKuWAGm6TxNF7teVgWiT9x0R_tmiEzYuvcXnCPAAiCMNwTOdc50TpktfgZOLg4wXeg48WzyX-2zQJsHgP2yW5zQ",
  "p6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLimcO1qx1Y-s29b_E4c8-XD3Wb1ud4t95kSi26gBBp52vWzYmqI32UbVRzXJZyQ7IOtBO9ltPjMbjjtADc34sTy3j62ixAuzErvbhRFTggVQ",
  "p7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLijZGwpR1Y-s29e6M9eM-VC3GV09FyouRoQha-kBkupjDLw42qIHKRagAmWJR2QORZshK_xNC0Zuy3sVfZgokQzH73j39Bu3tj5fFCD_SStqkeXQ",
  "p8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLinZfyr3Jk6OGRe6dsMqLDMWKex-Fks-R7cCS2kRQyvnPdw979IH2RPwZzW5AiQbMKuxm4w4GzNumxtAffi40Qmyj2jiJJ7Stt_a9cBnVJ6nbN",
  "p9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLin4Hl-S1d6c2tfZt-IeeWCmiWx9F3oO5qTiWqhQkojDCAnobsLGWTPAN1Wcd4EOcDshiwltblZOO05Qfb2YxGznr-3SJLvX1u4OYFBaB25OSJ2AgKaK1x",
  "p10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwi5Hf-jFk7uepV7BlNf6XC3WD1eFkvd5lRi67gVMm5GrRzt2sJXqUag4kDZAmFuBYtUTslIXuPui2s1Hb2o4Wyir2hy1N8G81tF6C_jtH",
  "p11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V7JoKf6sA2KUyPt7_uU6Hijnxxkj62XVmdb8cnuRawEoXsEjFu8P4EPsm4G2Pu3r4QfW3olbjXKpPMTi5z4",
  "p12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLyhMG1_B1Y-s2tcvM4H_OWHGabzvpzj-xsSyCmmFMmtj7VyI3_InOXaFJxWJdwTe5ZuxC-k4G2Mrux4Fbe34pHxCqohntI8G81tDmb47lH",
  "p13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ_yWMXWV0eJ_s-BWQiy3nAgq_W3Rz4v_cS-fPVciW8B5RLYKuxW-l4XjMLzn7gTci94WxCv-jSsd6nt1o7FVf-m4DZ0",
  "p14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsPz-R1Y-s2jePFSJPWAC3WE_v1iouhiSha-kBkupjDLy42pc36UawZ2CZZzQuVeuka9xtyxZevnswbWjIxAxS-rh3gcuClo5vFCD_QwHUrsrg",
  "p15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_m5Hl6x1Y-s2gbaNoNs-DHGiEzvpvoORWQyC0nQlp6juDydugcHvEawVxApB3F7JftxTsloDgZOqx51PY345AxXr33SNPuzErvbi5RDlayg",
  "p16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLjm4Dv8TRe_c2pe5t_eM-fC3GZwPp-se9WQyC0nQlp5jmEydqpci2SaQdyDZEjEeFe4Re4wdznNu6ztgbWidkQzSz6jiJKuDErvbgK8jU85g",
  "p17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0PO_V7Q_cKDDMWaTyOpJs-1mWSyhqhAitzSQl8GqcXLDOg5zDpYlQu4Iuxi9mtSzYbyw4QXXjtpHxHr3hyId7y1q4usBT-N7rbGrNMRe",
  "p18": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1M5vahf6lsK_WBMWad_up5oPFlSjuMhRUmoDjUpZjwJSTQAVp5Xco0W7UItUPuk4XiMr_q4gXXidkXzn73jipJvCw-4r1QWPEkr_DX2lrFYLAjoc5U3elI6r0",
  "s1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSJ-OsG3SA0tF-se9uSi2-lBMYvjiBk5r0b3yQaABxCsdyR-dc4BS5l4DlYujntgCMi49AmCv5ii0buik54ucAVfI7uvqAawge80M",
  "s2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSLP-FC1idxOp_pewnTS2xl0gk5WjSztqreX3EOgYnCcN1EOQK5xK6k4HjPumz4VPW2dhAmzK-0H1CdgX2Fw",
  "s3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2n5rp8SNJ0PG7V6NsLPmfMWSY0-F7sd55Rie4qhAitzSQl8GgI33FOgVyCMNyTe8OsEPrmtDuZuqw5Azf2N5Nzi382iJO6Sds4uZRT-N7rYMVaF_m",
  "s4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7uORcKk8cKHHMXeFz-VJveRtRjy-2xtxtz-AyYv6dS-WaQMjWcMhROYNs0O7x9LhNLzrtlHWi4oUnCv_iCtXrnE8EiUSubs",
  "s5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f_jdk4uL3V6JiL_SsDW-RyOBJveRtRjy-2x8i4zjcmIuoIHmSPFcjDMMjFO9Z4BSxlta1Yey2tgXYidlFmS6r3SpXrnE8w54dz2k",
  "s6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiVI0POlPPNSMOKcCGKD0ud5vuBlcCS2kRQyvnOGw4r_d3OWZ1MnCpBwR-Rc5hbumtCzP-Kw7wSIiYsRnHr2i35MvS1s_a9cBkIkkRA2",
  "s7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-HHG6Xxutkj-VgXCq6hREuvTi6l4r9KD7KcFcmD8R0QecNtkTsw9HgPrzgtAGMjo0TmX2r2y4duiZutesLBKZ2r6zJz1aWAJe-_z0",
  "s8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-DAXWEwOx6td5kSi26gBBpsD-Gz96qJC2XbA92WcMlQOEI5hK-w4HjN7nns1Peg4xFnCv42iob6TErvbjYjRhYmg",
  "s9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_m5Hl6x1Y-s2gbaNoNs-XC3GExPZipfNscCS2kRQyvnPTwtv7InieOFJ1DpZ2F7YCskXultC1MOnktlaI344WxCX62ntB7i46_a9cBrXKNorP",
  "s10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiVI0OL8PfRSI-mRC3WDyet6vN5kSi26gBBp52jcmd-hdnqXO1QjDpQmEOAKtBe4wdbvNeng5lHfjI8UyHitjXxA7zErvbjgqXwXcA",
  "s11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwjFL0PyhfqVSN_mdCliUyP1mtfN6TiWMmBgjuiiI1N-hdiqWbVAgA5EkQLIMshi5wNexZrmz5ATY3tlAxCSs3ChB5yc9te4cEf1yTqnux1Q",
  "s12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLjm4Dv8TRe_c2pe5t_eM-BG3SEyud4t95kSi26gBBp4GiHnN39eSqSZgMkWJVzFLVb4EG6xNfiP76w5VTd3YNBzX79iilN5zErvbhvdKkcZQ",
  "s13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLyhMG1_B1Y-s2tcvM4H-ebB3Wc1ud4tN5lRi67gVN242-AzNuoIyieOg8lDJdyEeVe40TqxoDvZLixtVPZ2IhFmC333yNJ8G81tFbyihAW",
  "s14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1a4s27ZbQ5dc-WAmKT1fx5p-B_Sha_nBovp3PTztuvd3jDOlMhX5IjR7YPtRTtx4XjNum2tQOLjItHmyj5j34b6Spt_a9cBq1OnGjK",
  "s15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c_M2pZKtuK8-DAWuJzOtkj-xsSyCmmFNwtjiHm9n4JCiValAnW5IiTOQIsES_x9DjPrmwslfe2I5Czi_4339P8G81tCj-SlRO",
  "s16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8zMK5wiVI0P_8PP1SI_-eDG6exNF6ueZhW2fhwB53smmAzIr_cy2fa1N0D5J0E-Je4BG_lt22N-63sQLYid0UxCytkGoXuS8jTKqZ",
  "s17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLimcO1qx1c_M29b_E4c8-XC2aEyeNzpOBlcCS2kRQyvnODnt_8J3iQaFIgX8B5FO5b5BW7m9GzNu_n5QWP2N5Bn3_8jHsbui44_a9cBnoOQOTq",
  "s18": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tg_13jRBnOnITv9idV6fOgb5tqLP-FC3Svzv5zouB9Ria9xE0YozKMiYD3Hi3VMVFPWM4hFrxl-0XkzougWLe3s1yb1pVDzSiq3C8d5idj5rkHVfd3rKaBil7EYrw15ZAEJ_ynS0jaDU8KvP80Wsm9mcfvjQMg",
  "re1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_v5kue99XD2hkBwqjDCAnobsLGXFOwQnCZQmE7MPu0G5l9HhNe7q7lOK2tgXmCn4jiofvCZisboKWfZw5OSJ2G1OXXQx",
  "re2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6dlMv-eD1iAyOB9j-xsSyCmmFNz4WXTz4n6cHyUbQ50D5AiF-Ne4ES9m9K1MePq4leKjYlGyX363S0d8G81tKSnYp_g",
  "re3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-UGm-Zz-llj-xsSyCmmFMi5GrcwtivdnnCOgd2DsNxTeIJuxbqk9XuN-_i5gKI3d1BxH35iy1P8G81tKMOXOY4",
  "re4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhzMOwwiVI0OL8PfRSNvmAB2ie0tF7teVgWiT9wkR2tzncnoqueSnCbwZ0CZBzRbUOtUTrlIXiZr6z4wbYid8Rzyr72zQJsHhI3xLykQ",
  "re5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLin4Hl-S1d6c2tfZt-IeeWCmiWx9F9ufJ6QyalkCIqtjmMj4K3IHOfbVQlDsZ0Fu8Pt0S8xNGzMunn4QTagoNGyC_5iHhL7nput70GWb1lpPNuwc0NDw",
  "re6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLimcO1qx1Y-s29b_E4c8-QF2WV09FyouBuQCeMmBgjuiiI1Iqrc3mWZwByDsR3R-cPs0O8wdTlNO3ktgPXjINCnH2qjy0f7CxpsLkcEf1ykuhfzLs",
  "re7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf-jFk_6v-V7BsLvefC2OvzOtyufRkAS2wzRkit2-EyIqvcHKRawR2DpImTeYDs0W6k9eyN-Pr4ATY3d5HzS3gznQedIwTnmE",
  "re8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL0kp_0-B1Y-s2qfaVhH_WfB3OV0tFzpuhlcC-_mg8mjDCAnobsLGWfPw4hCpJwQuYN40S4xtGyYe7rsQzY2I8Ryn3-jS9Bu31v4-4HVvUk5OSJ2FMPTUdt",
  "re9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8zMK5wiFO0P_8PP1SJP-EAHGf1etJveRtRjy-200m5TyBzIz9eXPFOwchCJd3TOEN5BS_lNa0Yuqx4VGP2tkQnH743ytXrnE8rcFDdTQ",
  "re10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLjm4Dv8TRe_c2pe5t_JeacAnGV09FmpfN5QyyMkBEupzi6l4r9KD7KcARyCcAmFu4IsxWxldy1Zr-25wSLgtkUxX72jSsa6H1i6-8KV6Mm_vHJz1aWaphGWqo",
  "re11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c_M2pZKtuK8-WAm6ExNF1sexmcCS2kRQyvnOGzI2uci6ePQ8nDsEhTeIKthS_koazNe234AyM349BmCz_3y0c6nxv_a9cBoed2NN7",
  "re12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSJfyaGmKv1e91pOhqTiWMmBgjuiiI1NuqeHiROlIjA5smQrJbsxTswYblNO2zswCM2olNyyj6ingb5ypt6-8cEf1ySdAximE",
  "re13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2n5rp8SNJ0PG7V6NsLPmfMWOV0vpkv_hsXRa-kBkupjDLm46odXyXaQJ2ApBzEOJYt0K8x9bvNr7n51ba3o5Byn2tji9BvHk56_FCD_TDFmDYsA",
  "re14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1Y-s2jaac8cM-eAWmbxPdwvOBuSha-kBkupjDLmNb_cSmROgEhDpZ4R7MCsUHtlIHnNeiztQXYiowWmX352yxA7HxisPFCD_S5RBWIQQ",
  "re15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_m5Hl6x1Y-s2gbaNoNs-QAmKR09Flu_hWQyC0nQlpsDnVy4mpcSiQOlB2CJRxR-AK4BDrw4azN-225lfc2t0Tznr6iX4f6zErvbg1B8-kIw",
  "re16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1c_M27ZbRSMv-SCmWczu19j-xsSyCmmFN-4WqEyIyqdHzBblcnD5V2F7RZsBm-k4blMb-2sVPYjN5Czin5jCwa8G81tNDF1G3N",
  "re17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3n5vh7h1c_M2oaalsM8-QAXWA_uNzv_ZWQyC0nQlp6jvVztaudCnEbAUgDsckFOAJsBLtlN2yP7zqslGMiooXyCX43H8Y5zErvbiVlZtU7g",
  "re18": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Tk71ruQBH4jYLf-i5U-fe9V7d9JfOaD2uZ0vpJveB7TSW2qhsmtzi6l4r9KD7KcFQpXJNzRbINthTrwN3mNru04QaNgtpFziqr3HhJ7Sxi4-8LU_cn_6PJz1aWXZHTcuc",
  "c1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSLvWcMWmfyPxJveRtRjy-2xh15D7dyN_9In7GaQN1C5V2QrReuhLtm9TlZb-w7gzbiY8Uyn_5jXlXrnE8Rz2LjAE",
  "c2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf-jFk4uL5V6ZhL_-XHXef0_pJvOhuRz39lxsk4W3Ry96pIHrFOgElDZN2Q-9etUSwk4LnYu3h5wLejYwWxSr43zQJsHiIGMoJQA",
  "c3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSI-WsG3SA_u1jpN5kSi26gBBp4D7TwoqsJC6faQUiWcchQrECu0Kwk4K2P-zltVHbj44RnyT2jH8b5zErvbgF1pSM3w",
  "c4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf-jFk7uW-V6BoIeSbMWqVxedjva9rTSrjkRx14zmEyNehIyqQPFIjD8EhTbUKthLtxNPjNb7j71CMjY5G02yg2Rn_XBtf",
  "c5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwi5Hf-jFk7uepV7d5Of2DBmacyO94j-NgXS2gqhAitzSQl8GpInvFOAFyD5AmFuFesBO8loDkML_g4w3diY4UyXj9jCxO6ihu5-8DT-N7rWFcbgcq",
  "c6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1a7s2pZKtuK8_CVliF0-x3vt5kQCa9qhsipTiXpYL8JSLSMxgnApJwF-ALsxXpm4W1N7zr4lCK2Y1FzXmoiS5PvCpvsbwFAKBwrKfVkUifZu_LJHFP",
  "c7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkk4a0qB1Y-s27ZbQ5dc-EBm6ExNFwse9ucCW6khUz_WiGzY6pJyjCZwN1A5p5Q-MCuxa7ldW0Ne3ntQHW2YpFmSv63S1B73t1o7FVFkKgM50",
  "c8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5G3wiNK0P-vb_NSM-eSCTCvzOtyufRkASjllEoh4WTdy46rJHiWZldxC8FyReQO40Tsx9fiY7zj5QKI2NhAzCzgznQeELRnu4M",
  "c9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_m5Hl6x1I_82gbaNoNs-fB2iex-dluN5lRi67gVNx62XXzI74InPGbQMpDpMiRLMOsRG4lNXvPuritFeN3YpMzSSo2yhN8G81tOHyHega",
  "c10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLjm4Dv8TRe_c2pe5t_JeacAnGV09FiouRoSxa_nBovp3PTwt-hJH-WbFMnWJdwRuUPtEG7k93iN7uw4wLf2I9FxCr733hBvXxj_a9cBlQvB05B",
  "c11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLimcO1qx1I_829b_E-c8-SAmiYwNF7teVgWiT9wUhy4G2GzNusJy2XPVQnAsBzE-IIsxiwwd22Zeiz4FeI391DyCr9izQJsHg5mneewQ",
  "c12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL5lYayrXIL0PG7V7Q_cKDDMXKCw-94j-loVSihkSIqtjmMj4K3InLDZgJ2WJQmR-RY40HqkNLhZu224w2PiY1FyS7-33lMu31ptekCVb1lpPP7RVtX1g",
  "c13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3l4Dl7idN6vyRb7dSJvmFC3SV1-t4j-lmWxahmhkYpTSKlortHibCOl9lV4wmQ-db4UO8moa1M7nitVPe348QmHr4hiJK5i464boCUKMjq6CCiluQL_Rjtq-HgYRb",
  "c14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwiVI0PyhfqVSIf6QBmiCyPpzj-xsSyCmmFNx4DzSyN-ueSqWaQ9yWJZ3FuAOtUSxmoKyN7637lDciY8UyS3-2n5I8G81tI6dnAuV",
  "c15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLzl4zv8x1Y-s2sYb5iLs-BB2iE_uNztOh8QmfllE9wt2zQzoz4IyrDbwElXpshE-IPtEW_ltfhM-6xs1HejdhNzSuokGoXueYraDah",
  "c16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLpk8ewrHZk7OeRcKk8cKHHMWiIyOpzj-NlTjO2qhAitzSQl8GvICifalQpC8MlFrEJtBK_xNyzZurh7wCP3t9Azn-vhi9P7ik6t-pUT-N7rTWQlKE7",
  "c17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu4r7_lb1QgTykpPf-i5U-fe9V6liNP-BDX6TzetJpPNgSDu6kSIlvyiApYL8JSLSMxgjW8R5Re9ZuxbqkNy2ZbnjtgTaitlCmy-q3H5MuilrsLpTVqYjr_DfkUifZvxWNaC1",
  "h1": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlV6poL_6sHG6UxPxJveRtRjy-2x9_5GiBmYn4JHiVa1NyXMMkRuNe5ka5k9eyM-q2sQHc2NpCmyWvin5XrnE89iGyCXM",
  "h2": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk6OGRbKFsJ_yWMWaXxvxzo_JmXRa-kBkupjDLzd2qIH_DPQcpA8YjFuQP50a7moKyMuK35QyK3t0WnC75iC5B53w-5PFCD_THYZfD3g",
  "h3": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj-9gSCGnmBw1tgKIn4vwNCaJaAJ1WZNwE-Rft0G8kIKyNui24lPcjoNFn3n3iCtMuHo447tWVfcjqbqX0V8N9uh_hA",
  "h4": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL3n5vh7h1Y-s2oaalsM8-cGWuvzvx3vuZscCS2kRQyvnPRmNirI36SPwIkXJN1FrFbu0G4wN21YuixsQSIgo4TyCz-2ihA6Xxj_a9cBmEg_Ggl",
  "h5": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLin4Hl-S1d6c2tfZt-IeeWCmiWx9FytfdmWju2hyIqtjmMj4K3JHPCb1VyCZZzFu5bshnux4CyNrzr41OIg44TxCv42y9I530_4-pWV71lpPN_qLoiCA",
  "h6": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL_kYDhwiFO0PyhfqVSNP-KMXSfzep_tfNWQiy3nAgq_TyHztuueSmQag8nW5EmEOFZuhO9lde2M-i3tATZ3dhAmHr9jSNP5i51o7FVPPqFUPE",
  "h7": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_C9k7uW-V7RsN-CSGVidxOp_pewnG3u1lEkm62vdy9ipICnDa1VzWZomRuVetxm4wIDlM-Pnsgfd2owQyTK-0H1CZIxs5g",
  "h8": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8jsHf-jFk__25bbZuL-KWMWqAltF7teVgWiT9zUxz6juDyIn4dXnBOFMoCcB0RO4DtES6w9O0NOmzsleIjogTm3-riTQJsHguZhvSPA",
  "h9": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLyhMG1_B1Y-s2tcvM4H_WQAVidxOp_pewnS3jrzUp3sj_dz9avIHuVPVUjCcQlELQK4Ra6lN3gM-6w4AXWgoNAxDK-0H0AbUXsrA",
  "h10": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c_M2pZKtuK8-HBnKexetkj-V8XD2MmBgjuiiI1NmpJHiRPQ4gA5JwFuQDtEG7xICzZOKz5AWPgt8RmH6tjnsb7io-674cEf1ya4II4a4",
  "h11": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2zYXnrB1c_M2pO7dqcc-RG2STwOBztfNWQiy3nAgq_WWHy9f8dX6SPQIhWZJwFOMJ5kbtldTvNeK05gzcgtpGn3n_2i0avSh1o7FV13gRk-c",
  "h12": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wiFO0Oara_1SM_6SBWKvzOtyufRkAX_hx0hxtW_WzIz9JXOTOANzW5p0Qe9ZthC_ltzmPu_qsgONiolHz3rgznQe6Q3wPJA",
  "h13": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwi5Hf9Ttk7uepV7BiMv6sAXWRz-lzj-xsSyCmmFMism_QytiscyiQbVclDpN4TbUPuka6xtXvZO2z5wLajYsUynn_jygc8G81tOcGd7SP",
  "h14": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f_jdk4uL3V7JoKf6sA2KUyPt7_uBvHXzizR9y5m7TmN39JXqTaFVyDsAkEbMNuha4kdLjNrnh4gbYjNhbjXKpPiS6hXQ",
  "h15": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf-jFk_6v-V7B_JfGXMWqVxedjva9tF3_lkEpx4DjSn96hcSqWbgIgCsZ1Q-4KtUS5w4blP-Lj7lGN3Y5C02yg2T6bpjdP",
  "h16": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLjm4Dv8TRe_c2tfZt_eM-AG3WGyPh3vOh6Wxa-kBkupjDLy9qpIy3GZg4mDsckRuNcsxKxlIbhY-y3sgLWio4TyH32i3gY7i1t4_FCD_Ryg25UbQ",
  "h17": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL0kp_0-B1I_82rZK15JeOsGW6e1etkj_NoRi22hyIqtjmMj4K3eX-XaQQgX5t4ELVZ5xbpxty2M-nk5wWPgowRni772i1I6ytp4-0KAL1lpPPsxLh0UQ",
  "h18": "i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL6kJ_m-B1I-_uibbB5L8-SD1iWwOpzj-1gSCGn20h2smqHzNuqcy6TawckApJ5EeIJuxPpwNaxMejmtQLa2o5Nnnj3hy9XrnE8H9hk9aQ"
};

export const cases: Case[] = [
  {
    id: "revolution",
    name: "Revolution Case",
    image: "/cases/revolution.png",
    price: 2.49,
    tag: "HOT" as Case["tag"],
    skins: [
      { id: "r1", name: "Head Shot", weapon: "AK-47", rarity: "covert", price: 72.49, image: img(HASHES["r1"]), wear: "Minimal Wear" },
      { id: "r2", name: "Temukau", weapon: "M4A4", rarity: "covert", price: 163.69, image: img(HASHES["r2"]), wear: "Factory New" },
      { id: "r3", name: "Duality", weapon: "AWP", rarity: "classified", price: 4.89, image: img(HASHES["r3"]), wear: "Field-Tested" },
      { id: "r4", name: "Wild Child", weapon: "UMP-45", rarity: "classified", price: 4.83, image: img(HASHES["r4"]), wear: "Field-Tested" },
      { id: "r5", name: "Wicked Sick", weapon: "P2000", rarity: "classified", price: 8.28, image: img(HASHES["r5"]), wear: "Minimal Wear" },
      { id: "r6", name: "Emphorosaur-S", weapon: "M4A1-S", rarity: "restricted", price: 0.72, image: img(HASHES["r6"]), wear: "Field-Tested" },
      { id: "r7", name: "Umbral Rabbit", weapon: "Glock-18", rarity: "restricted", price: 1.11, image: img(HASHES["r7"]), wear: "Minimal Wear" },
      { id: "r8", name: "Banana Cannon", weapon: "R8 Revolver", rarity: "restricted", price: 0.55, image: img(HASHES["r8"]), wear: "Field-Tested" },
      { id: "r9", name: "Neoqueen", weapon: "P90", rarity: "restricted", price: 0.53, image: img(HASHES["r9"]), wear: "Field-Tested" },
      { id: "r10", name: "Sakkaku", weapon: "MAC-10", rarity: "restricted", price: 1.20, image: img(HASHES["r10"]), wear: "Field-Tested" },
      { id: "r11", name: "Fragments", weapon: "SCAR-20", rarity: "milspec", price: 0.09, image: img(HASHES["r11"]), wear: "Field-Tested" },
      { id: "r12", name: "Liquidation", weapon: "MP5-SD", rarity: "milspec", price: 0.10, image: img(HASHES["r12"]), wear: "Field-Tested" },
      { id: "r13", name: "Featherweight", weapon: "MP9", rarity: "milspec", price: 0.11, image: img(HASHES["r13"]), wear: "Field-Tested" },
      { id: "r14", name: "Re.built", weapon: "P250", rarity: "milspec", price: 0.09, image: img(HASHES["r14"]), wear: "Field-Tested" },
      { id: "r15", name: "Cyberforce", weapon: "SG 553", rarity: "milspec", price: 0.10, image: img(HASHES["r15"]), wear: "Field-Tested" },
      { id: "r16", name: "Rebel", weapon: "Tec-9", rarity: "milspec", price: 0.10, image: img(HASHES["r16"]), wear: "Field-Tested" },
      { id: "r17", name: "Insomnia", weapon: "MAG-7", rarity: "milspec", price: 0.10, image: img(HASHES["r17"]), wear: "Field-Tested" },
      { id: "r18", name: "Rezan the Red", weapon: "★ Driver Gloves", rarity: "extraordinary", price: 112.32, image: img(HASHES["r18"]), wear: "Field-Tested" },
    ],
  },
  {
    id: "kilowatt",
    name: "Kilowatt Case",
    image: "/cases/kilowatt.png",
    price: 3.99,
    tag: "NEW" as Case["tag"],
    skins: [
      { id: "k1", name: "Inheritance", weapon: "AK-47", rarity: "covert", price: 181.73, image: img(HASHES["k1"]), wear: "Factory New" },
      { id: "k2", name: "Chrome Cannon", weapon: "AWP", rarity: "covert", price: 121.24, image: img(HASHES["k2"]), wear: "Factory New" },
      { id: "k3", name: "Black Lotus", weapon: "M4A1-S", rarity: "classified", price: 10.74, image: img(HASHES["k3"]), wear: "Minimal Wear" },
      { id: "k4", name: "Olympus", weapon: "Zeus x27", rarity: "classified", price: 13.11, image: img(HASHES["k4"]), wear: "Factory New" },
      { id: "k5", name: "Jawbreaker", weapon: "USP-S", rarity: "classified", price: 29.86, image: img(HASHES["k5"]), wear: "Factory New" },
      { id: "k6", name: "Block-18", weapon: "Glock-18", rarity: "restricted", price: 1.24, image: img(HASHES["k6"]), wear: "Minimal Wear" },
      { id: "k7", name: "Etch Lord", weapon: "M4A4", rarity: "restricted", price: 7.90, image: img(HASHES["k7"]), wear: "Factory New" },
      { id: "k8", name: "Hybrid", weapon: "Five-SeveN", rarity: "restricted", price: 5.83, image: img(HASHES["k8"]), wear: "Factory New" },
      { id: "k9", name: "Just Smile", weapon: "MP7", rarity: "restricted", price: 1.39, image: img(HASHES["k9"]), wear: "Minimal Wear" },
      { id: "k10", name: "Analog Input", weapon: "Sawed-Off", rarity: "restricted", price: 0.57, image: img(HASHES["k10"]), wear: "Field-Tested" },
      { id: "k11", name: "Light Box", weapon: "MAC-10", rarity: "milspec", price: 1.43, image: img(HASHES["k11"]), wear: "Factory New" },
      { id: "k12", name: "Dezastre", weapon: "SSG 08", rarity: "milspec", price: 0.11, image: img(HASHES["k12"]), wear: "Field-Tested" },
      { id: "k13", name: "Dark Sigil", weapon: "Nova", rarity: "milspec", price: 0.10, image: img(HASHES["k13"]), wear: "Field-Tested" },
      { id: "k14", name: "Irezumi", weapon: "XM1014", rarity: "milspec", price: 0.10, image: img(HASHES["k14"]), wear: "Field-Tested" },
      { id: "k15", name: "Hideout", weapon: "Dual Berettas", rarity: "milspec", price: 0.11, image: img(HASHES["k15"]), wear: "Field-Tested" },
      { id: "k16", name: "Slag", weapon: "Tec-9", rarity: "milspec", price: 0.10, image: img(HASHES["k16"]), wear: "Field-Tested" },
      { id: "k17", name: "Motorized", weapon: "UMP-45", rarity: "milspec", price: 0.09, image: img(HASHES["k17"]), wear: "Field-Tested" },
      { id: "k18", name: "Fade", weapon: "★ Kukri Knife", rarity: "extraordinary", price: 263.62, image: img(HASHES["k18"]), wear: "Factory New" },
    ],
  },
  {
    id: "dreams-nightmares",
    name: "Dreams & Nightmares",
    image: "/cases/dreams-nightmares.png",
    price: 0.99,
    tag: "BEST VALUE" as Case["tag"],
    skins: [
      { id: "d1", name: "Nightwish", weapon: "AK-47", rarity: "covert", price: 89.62, image: img(HASHES["d1"]), wear: "Field-Tested" },
      { id: "d2", name: "Starlight Protector", weapon: "MP9", rarity: "covert", price: 137.55, image: img(HASHES["d2"]), wear: "Factory New" },
      { id: "d3", name: "Melondrama", weapon: "Dual Berettas", rarity: "classified", price: 8.66, image: img(HASHES["d3"]), wear: "Field-Tested" },
      { id: "d4", name: "Rapid Eye Movement", weapon: "FAMAS", rarity: "classified", price: 8.69, image: img(HASHES["d4"]), wear: "Field-Tested" },
      { id: "d5", name: "Abyssal Apparition", weapon: "MP7", rarity: "classified", price: 8.66, image: img(HASHES["d5"]), wear: "Field-Tested" },
      { id: "d6", name: "Night Terror", weapon: "M4A1-S", rarity: "restricted", price: 0.88, image: img(HASHES["d6"]), wear: "Field-Tested" },
      { id: "d7", name: "Space Cat", weapon: "PP-Bizon", rarity: "restricted", price: 0.81, image: img(HASHES["d7"]), wear: "Field-Tested" },
      { id: "d8", name: "Ticket to Hell", weapon: "USP-S", rarity: "restricted", price: 0.80, image: img(HASHES["d8"]), wear: "Field-Tested" },
      { id: "d9", name: "Zombie Offensive", weapon: "XM1014", rarity: "restricted", price: 0.80, image: img(HASHES["d9"]), wear: "Field-Tested" },
      { id: "d10", name: "Dream Glade", weapon: "G3SG1", rarity: "restricted", price: 0.85, image: img(HASHES["d10"]), wear: "Field-Tested" },
      { id: "d11", name: "Poultrygeist", weapon: "SCAR-20", rarity: "milspec", price: 0.10, image: img(HASHES["d11"]), wear: "Field-Tested" },
      { id: "d12", name: "Spirit Board", weapon: "Sawed-Off", rarity: "milspec", price: 0.11, image: img(HASHES["d12"]), wear: "Field-Tested" },
      { id: "d13", name: "Lifted Spirits", weapon: "P2000", rarity: "milspec", price: 0.11, image: img(HASHES["d13"]), wear: "Field-Tested" },
      { id: "d14", name: "Scrawl", weapon: "Five-SeveN", rarity: "milspec", price: 0.14, image: img(HASHES["d14"]), wear: "Field-Tested" },
      { id: "d15", name: "Ensnared", weapon: "MAC-10", rarity: "milspec", price: 0.11, image: img(HASHES["d15"]), wear: "Field-Tested" },
      { id: "d16", name: "Foresight", weapon: "MAG-7", rarity: "milspec", price: 0.11, image: img(HASHES["d16"]), wear: "Field-Tested" },
      { id: "d17", name: "Lore", weapon: "★ Butterfly Knife", rarity: "extraordinary", price: 922.65, image: img(HASHES["d17"]), wear: "Field-Tested" },
    ],
  },
  {
    id: "fracture",
    name: "Fracture Case",
    image: "/cases/fracture.png",
    price: 1.79,
    skins: [
      { id: "f1", name: "Legion of Anubis", weapon: "AK-47", rarity: "covert", price: 51.59, image: img(HASHES["f1"]), wear: "Field-Tested" },
      { id: "f2", name: "Printstream", weapon: "Desert Eagle", rarity: "covert", price: 51.76, image: img(HASHES["f2"]), wear: "Field-Tested" },
      { id: "f3", name: "Tooth Fairy", weapon: "M4A4", rarity: "classified", price: 5.66, image: img(HASHES["f3"]), wear: "Field-Tested" },
      { id: "f4", name: "Vogue", weapon: "Glock-18", rarity: "classified", price: 19.55, image: img(HASHES["f4"]), wear: "Factory New" },
      { id: "f5", name: "Entombed", weapon: "XM1014", rarity: "classified", price: 5.65, image: img(HASHES["f5"]), wear: "Minimal Wear" },
      { id: "f6", name: "Monster Call", weapon: "MAG-7", rarity: "restricted", price: 0.66, image: img(HASHES["f6"]), wear: "Field-Tested" },
      { id: "f7", name: "Brother", weapon: "Tec-9", rarity: "restricted", price: 0.60, image: img(HASHES["f7"]), wear: "Field-Tested" },
      { id: "f8", name: "Allure", weapon: "MAC-10", rarity: "restricted", price: 0.59, image: img(HASHES["f8"]), wear: "Field-Tested" },
      { id: "f9", name: "Connexion", weapon: "Galil AR", rarity: "restricted", price: 0.55, image: img(HASHES["f9"]), wear: "Field-Tested" },
      { id: "f10", name: "Kitbash", weapon: "MP5-SD", rarity: "restricted", price: 0.57, image: img(HASHES["f10"]), wear: "Field-Tested" },
      { id: "f11", name: "Cassette", weapon: "P250", rarity: "milspec", price: 0.13, image: img(HASHES["f11"]), wear: "Field-Tested" },
      { id: "f12", name: "Gnarled", weapon: "P2000", rarity: "milspec", price: 0.12, image: img(HASHES["f12"]), wear: "Field-Tested" },
      { id: "f13", name: "Ol' Rusty", weapon: "SG 553", rarity: "milspec", price: 0.11, image: img(HASHES["f13"]), wear: "Field-Tested" },
      { id: "f14", name: "Mainframe 001", weapon: "SSG 08", rarity: "milspec", price: 0.14, image: img(HASHES["f14"]), wear: "Field-Tested" },
      { id: "f15", name: "Freight", weapon: "P90", rarity: "milspec", price: 0.11, image: img(HASHES["f15"]), wear: "Field-Tested" },
      { id: "f16", name: "Runic", weapon: "PP-Bizon", rarity: "milspec", price: 0.13, image: img(HASHES["f16"]), wear: "Field-Tested" },
      { id: "f17", name: "Slaughter", weapon: "★ Skeleton Knife", rarity: "extraordinary", price: 654.02, image: img(HASHES["f17"]), wear: "Factory New" },
    ],
  },
  {
    id: "prisma2",
    name: "Prisma 2 Case",
    image: "/cases/prisma2.png",
    price: 1.29,
    skins: [
      { id: "p1", name: "Player Two", weapon: "M4A1-S", rarity: "covert", price: 77.48, image: img(HASHES["p1"]), wear: "Field-Tested" },
      { id: "p2", name: "Bullet Queen", weapon: "Glock-18", rarity: "covert", price: 78.44, image: img(HASHES["p2"]), wear: "Field-Tested" },
      { id: "p3", name: "Phantom Disruptor", weapon: "AK-47", rarity: "classified", price: 7.38, image: img(HASHES["p3"]), wear: "Field-Tested" },
      { id: "p4", name: "Disco Tech", weapon: "MAC-10", rarity: "classified", price: 7.49, image: img(HASHES["p4"]), wear: "Field-Tested" },
      { id: "p5", name: "Justice", weapon: "MAG-7", rarity: "classified", price: 7.20, image: img(HASHES["p5"]), wear: "Field-Tested" },
      { id: "p6", name: "Darkwing", weapon: "SG 553", rarity: "restricted", price: 0.87, image: img(HASHES["p6"]), wear: "Field-Tested" },
      { id: "p7", name: "Fever Dream", weapon: "SSG 08", rarity: "restricted", price: 1.24, image: img(HASHES["p7"]), wear: "Field-Tested" },
      { id: "p8", name: "Enforcer", weapon: "SCAR-20", rarity: "restricted", price: 0.84, image: img(HASHES["p8"]), wear: "Field-Tested" },
      { id: "p9", name: "Apocalypto", weapon: "Sawed-Off", rarity: "restricted", price: 0.92, image: img(HASHES["p9"]), wear: "Field-Tested" },
      { id: "p10", name: "Tom Cat", weapon: "AUG", rarity: "restricted", price: 1.54, image: img(HASHES["p10"]), wear: "Factory New" },
      { id: "p11", name: "Capillary", weapon: "AWP", rarity: "milspec", price: 0.93, image: img(HASHES["p11"]), wear: "Field-Tested" },
      { id: "p12", name: "Distressed", weapon: "CZ75-Auto", rarity: "milspec", price: 0.46, image: img(HASHES["p12"]), wear: "Field-Tested" },
      { id: "p13", name: "Blue Ply", weapon: "Desert Eagle", rarity: "milspec", price: 0.51, image: img(HASHES["p13"]), wear: "Field-Tested" },
      { id: "p14", name: "Desert Strike", weapon: "MP5-SD", rarity: "milspec", price: 0.35, image: img(HASHES["p14"]), wear: "Field-Tested" },
      { id: "p15", name: "Prototype", weapon: "Negev", rarity: "milspec", price: 1.01, image: img(HASHES["p15"]), wear: "Factory New" },
      { id: "p16", name: "Bone Forged", weapon: "R8 Revolver", rarity: "milspec", price: 1.03, image: img(HASHES["p16"]), wear: "Factory New" },
      { id: "p17", name: "Acid Etched", weapon: "P2000", rarity: "milspec", price: 0.92, image: img(HASHES["p17"]), wear: "Field-Tested" },
      { id: "p18", name: "Doppler", weapon: "★ Talon Knife", rarity: "extraordinary", price: 1204.12, image: img(HASHES["p18"]), wear: "Factory New" },
    ],
  },
  {
    id: "snakebite",
    name: "Snakebite Case",
    image: "/cases/snakebite.png",
    price: 2.89,
    skins: [
      { id: "s1", name: "The Traitor", weapon: "USP-S", rarity: "covert", price: 50.95, image: img(HASHES["s1"]), wear: "Field-Tested" },
      { id: "s2", name: "In Living Color", weapon: "M4A4", rarity: "covert", price: 48.39, image: img(HASHES["s2"]), wear: "Field-Tested" },
      { id: "s3", name: "Chromatic Aberration", weapon: "Galil AR", rarity: "classified", price: 5.17, image: img(HASHES["s3"]), wear: "Field-Tested" },
      { id: "s4", name: "XOXO", weapon: "XM1014", rarity: "classified", price: 4.73, image: img(HASHES["s4"]), wear: "Field-Tested" },
      { id: "s5", name: "Food Chain", weapon: "MP9", rarity: "classified", price: 5.30, image: img(HASHES["s5"]), wear: "Field-Tested" },
      { id: "s6", name: "Slate", weapon: "AK-47", rarity: "restricted", price: 5.98, image: img(HASHES["s6"]), wear: "Field-Tested" },
      { id: "s7", name: "Trigger Discipline", weapon: "Desert Eagle", rarity: "restricted", price: 0.95, image: img(HASHES["s7"]), wear: "Field-Tested" },
      { id: "s8", name: "Button Masher", weapon: "MAC-10", rarity: "restricted", price: 0.61, image: img(HASHES["s8"]), wear: "Field-Tested" },
      { id: "s9", name: "dev_texture", weapon: "Negev", rarity: "restricted", price: 0.60, image: img(HASHES["s9"]), wear: "Field-Tested" },
      { id: "s10", name: "Cyber Shell", weapon: "P250", rarity: "restricted", price: 0.62, image: img(HASHES["s10"]), wear: "Field-Tested" },
      { id: "s11", name: "Windblown", weapon: "Nova", rarity: "milspec", price: 0.38, image: img(HASHES["s11"]), wear: "Field-Tested" },
      { id: "s12", name: "Junk Yard", weapon: "R8 Revolver", rarity: "milspec", price: 0.51, image: img(HASHES["s12"]), wear: "Field-Tested" },
      { id: "s13", name: "Circaetus", weapon: "CZ75-Auto", rarity: "milspec", price: 0.34, image: img(HASHES["s13"]), wear: "Well-Worn" },
      { id: "s14", name: "Oscillator", weapon: "UMP-45", rarity: "milspec", price: 0.28, image: img(HASHES["s14"]), wear: "Field-Tested" },
      { id: "s15", name: "Clear Polymer", weapon: "Glock-18", rarity: "milspec", price: 0.51, image: img(HASHES["s15"]), wear: "Field-Tested" },
      { id: "s16", name: "O.S.I.P.R.", weapon: "M249", rarity: "milspec", price: 0.31, image: img(HASHES["s16"]), wear: "Field-Tested" },
      { id: "s17", name: "Heavy Metal", weapon: "SG 553", rarity: "milspec", price: 0.32, image: img(HASHES["s17"]), wear: "Well-Worn" },
      { id: "s18", name: "Yellow-banded", weapon: "★ Broken Fang Gloves", rarity: "extraordinary", price: 82.50, image: img(HASHES["s18"]), wear: "Field-Tested" },
    ],
  },
  {
    id: "recoil",
    name: "Recoil Case",
    image: "/cases/recoil.png",
    price: 1.99,
    skins: [
      { id: "re1", name: "Printstream", weapon: "USP-S", rarity: "covert", price: 55.91, image: img(HASHES["re1"]), wear: "Field-Tested" },
      { id: "re2", name: "Chromatic Aberration", weapon: "AWP", rarity: "covert", price: 47.26, image: img(HASHES["re2"]), wear: "Field-Tested" },
      { id: "re3", name: "Ice Coaled", weapon: "AK-47", rarity: "classified", price: 5.71, image: img(HASHES["re3"]), wear: "Field-Tested" },
      { id: "re4", name: "Visions", weapon: "P250", rarity: "classified", price: 4.85, image: img(HASHES["re4"]), wear: "Field-Tested" },
      { id: "re5", name: "Kiss♥Love", weapon: "Sawed-Off", rarity: "classified", price: 5.25, image: img(HASHES["re5"]), wear: "Field-Tested" },
      { id: "re6", name: "Dragon Tech", weapon: "SG 553", rarity: "restricted", price: 0.58, image: img(HASHES["re6"]), wear: "Field-Tested" },
      { id: "re7", name: "Vent Rush", weapon: "P90", rarity: "restricted", price: 0.53, image: img(HASHES["re7"]), wear: "Field-Tested" },
      { id: "re8", name: "Flora Carnivora", weapon: "Dual Berettas", rarity: "restricted", price: 0.63, image: img(HASHES["re8"]), wear: "Field-Tested" },
      { id: "re9", name: "Downtown", weapon: "M249", rarity: "restricted", price: 0.54, image: img(HASHES["re9"]), wear: "Field-Tested" },
      { id: "re10", name: "Crazy 8", weapon: "R8 Revolver", rarity: "restricted", price: 0.61, image: img(HASHES["re10"]), wear: "Field-Tested" },
      { id: "re11", name: "Winterized", weapon: "Glock-18", rarity: "milspec", price: 0.12, image: img(HASHES["re11"]), wear: "Field-Tested" },
      { id: "re12", name: "Poly Mag", weapon: "M4A4", rarity: "milspec", price: 0.10, image: img(HASHES["re12"]), wear: "Field-Tested" },
      { id: "re13", name: "Destroyer", weapon: "Galil AR", rarity: "milspec", price: 0.11, image: img(HASHES["re13"]), wear: "Field-Tested" },
      { id: "re14", name: "Monkeyflage", weapon: "MAC-10", rarity: "milspec", price: 0.12, image: img(HASHES["re14"]), wear: "Field-Tested" },
      { id: "re15", name: "Drop Me", weapon: "Negev", rarity: "milspec", price: 1.29, image: img(HASHES["re15"]), wear: "Factory New" },
      { id: "re16", name: "Roadblock", weapon: "UMP-45", rarity: "milspec", price: 0.11, image: img(HASHES["re16"]), wear: "Field-Tested" },
      { id: "re17", name: "Meow 36", weapon: "FAMAS", rarity: "milspec", price: 1.86, image: img(HASHES["re17"]), wear: "Factory New" },
      { id: "re18", name: "Marble Fade", weapon: "★ Specialist Gloves", rarity: "extraordinary", price: 224.59, image: img(HASHES["re18"]), wear: "Field-Tested" },
    ],
  },
  {
    id: "clutch",
    name: "Clutch Case",
    image: "/cases/clutch.png",
    price: 4.49,
    tag: "HOT" as Case["tag"],
    skins: [
      { id: "c1", name: "Neo-Noir", weapon: "M4A4", rarity: "covert", price: 51.49, image: img(HASHES["c1"]), wear: "Field-Tested" },
      { id: "c2", name: "Bloodsport", weapon: "MP7", rarity: "covert", price: 125.50, image: img(HASHES["c2"]), wear: "Factory New" },
      { id: "c3", name: "Cortex", weapon: "USP-S", rarity: "classified", price: 4.86, image: img(HASHES["c3"]), wear: "Field-Tested" },
      { id: "c4", name: "Mortis", weapon: "AWP", rarity: "classified", price: 4.71, image: img(HASHES["c4"]), wear: "Field-Tested" },
      { id: "c5", name: "Stymphalian", weapon: "AUG", rarity: "classified", price: 4.60, image: img(HASHES["c5"]), wear: "Field-Tested" },
      { id: "c6", name: "Moonrise", weapon: "Glock-18", rarity: "restricted", price: 1.18, image: img(HASHES["c6"]), wear: "Field-Tested" },
      { id: "c7", name: "Arctic Wolf", weapon: "UMP-45", rarity: "restricted", price: 4.83, image: img(HASHES["c7"]), wear: "Factory New" },
      { id: "c8", name: "SWAG-7", weapon: "MAG-7", rarity: "restricted", price: 0.71, image: img(HASHES["c8"]), wear: "Field-Tested" },
      { id: "c9", name: "Lionfish", weapon: "Negev", rarity: "restricted", price: 2.83, image: img(HASHES["c9"]), wear: "Factory New" },
      { id: "c10", name: "Grip", weapon: "R8 Revolver", rarity: "restricted", price: 1.87, image: img(HASHES["c10"]), wear: "Factory New" },
      { id: "c11", name: "Aloha", weapon: "SG 553", rarity: "milspec", price: 0.29, image: img(HASHES["c11"]), wear: "Field-Tested" },
      { id: "c12", name: "Urban Hazard", weapon: "P2000", rarity: "milspec", price: 0.26, image: img(HASHES["c12"]), wear: "Field-Tested" },
      { id: "c13", name: "Flame Test", weapon: "Five-SeveN", rarity: "milspec", price: 0.24, image: img(HASHES["c13"]), wear: "Field-Tested" },
      { id: "c14", name: "Wild Six", weapon: "Nova", rarity: "milspec", price: 0.60, image: img(HASHES["c14"]), wear: "Field-Tested" },
      { id: "c15", name: "Night Riot", weapon: "PP-Bizon", rarity: "milspec", price: 0.24, image: img(HASHES["c15"]), wear: "Field-Tested" },
      { id: "c16", name: "Oxide Blaze", weapon: "XM1014", rarity: "milspec", price: 0.24, image: img(HASHES["c16"]), wear: "Field-Tested" },
      { id: "c17", name: "Polygon", weapon: "★ Moto Gloves", rarity: "extraordinary", price: 158.16, image: img(HASHES["c17"]), wear: "Field-Tested" },
    ],
  },
  {
    id: "horizon",
    name: "Horizon Case",
    image: "/cases/horizon.png",
    price: 5.99,
    skins: [
      { id: "h1", name: "Neon Rider", weapon: "AK-47", rarity: "covert", price: 64.11, image: img(HASHES["h1"]), wear: "Field-Tested" },
      { id: "h2", name: "Code Red", weapon: "Desert Eagle", rarity: "covert", price: 64.80, image: img(HASHES["h2"]), wear: "Field-Tested" },
      { id: "h3", name: "Nightmare", weapon: "M4A1-S", rarity: "classified", price: 13.45, image: img(HASHES["h3"]), wear: "Field-Tested" },
      { id: "h4", name: "Eye of Athena", weapon: "FAMAS", rarity: "classified", price: 6.86, image: img(HASHES["h4"]), wear: "Field-Tested" },
      { id: "h5", name: "Devourer", weapon: "Sawed-Off", rarity: "classified", price: 6.49, image: img(HASHES["h5"]), wear: "Field-Tested" },
      { id: "h6", name: "Toy Soldier", weapon: "Nova", rarity: "restricted", price: 1.26, image: img(HASHES["h6"]), wear: "Field-Tested" },
      { id: "h7", name: "PAW", weapon: "AWP", rarity: "restricted", price: 3.29, image: img(HASHES["h7"]), wear: "Field-Tested" },
      { id: "h8", name: "Powercore", weapon: "MP7", rarity: "restricted", price: 1.39, image: img(HASHES["h8"]), wear: "Field-Tested" },
      { id: "h9", name: "Eco", weapon: "CZ75-Auto", rarity: "restricted", price: 1.62, image: img(HASHES["h9"]), wear: "Field-Tested" },
      { id: "h10", name: "Warhawk", weapon: "Glock-18", rarity: "milspec", price: 0.66, image: img(HASHES["h10"]), wear: "Field-Tested" },
      { id: "h11", name: "High Seas", weapon: "G3SG1", rarity: "milspec", price: 1.16, image: img(HASHES["h11"]), wear: "Field-Tested" },
      { id: "h12", name: "Snek-9", weapon: "Tec-9", rarity: "milspec", price: 0.65, image: img(HASHES["h12"]), wear: "Field-Tested" },
      { id: "h13", name: "Amber Slipstream", weapon: "AUG", rarity: "milspec", price: 0.57, image: img(HASHES["h13"]), wear: "Field-Tested" },
      { id: "h14", name: "Capillary", weapon: "MP9", rarity: "milspec", price: 0.64, image: img(HASHES["h14"]), wear: "Field-Tested" },
      { id: "h15", name: "Traction", weapon: "P90", rarity: "milspec", price: 0.74, image: img(HASHES["h15"]), wear: "Field-Tested" },
      { id: "h16", name: "Survivalist", weapon: "R8 Revolver", rarity: "milspec", price: 0.61, image: img(HASHES["h16"]), wear: "Field-Tested" },
      { id: "h17", name: "Shred", weapon: "Dual Berettas", rarity: "milspec", price: 0.70, image: img(HASHES["h17"]), wear: "Field-Tested" },
      { id: "h18", name: "Fade", weapon: "★ Stiletto Knife", rarity: "extraordinary", price: 596.36, image: img(HASHES["h18"]), wear: "Factory New" },
    ],
  },
];
export function rollSkin(skins: Skin[], casePrice?: number, returnBoostPercent = 0): Skin {
  const customTotal = skins.reduce((sum, skin) => sum + Math.max(0, skin.dropChance ?? 0), 0);
  if (customTotal > 0) {
    if (casePrice !== undefined && returnBoostPercent > 0) {
      const customWeights = skins.map((skin) => Math.max(0, skin.dropChance ?? 0));
      const chanceForExponent = (exponent: number) => {
        const weights = skins.map((skin, index) => {
          const normalizedPrice = Math.max(0.04, skin.price / casePrice);
          return customWeights[index] * Math.pow(normalizedPrice, exponent);
        });
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        if (total <= 0) return skins.map(() => 100 / skins.length);
        return weights.map((weight) => (weight / total) * 100);
      };
      const baseChances = customWeights.map((weight) => (weight / customTotal) * 100);
      const baseValue = calculateExpectedValue(skins, baseChances);
      const targetValue = baseValue * (1 + Math.max(0, returnBoostPercent) / 100);
      let low = -4;
      let high = 4;
      let chances = baseChances;
      let bestDistance = Math.abs(baseValue - targetValue);

      for (let i = 0; i < 48; i++) {
        const mid = (low + high) / 2;
        const nextChances = chanceForExponent(mid);
        const value = calculateExpectedValue(skins, nextChances);
        const distance = Math.abs(value - targetValue);
        if (distance < bestDistance) {
          chances = nextChances;
          bestDistance = distance;
        }
        if (value < targetValue) low = mid;
        else high = mid;
      }

      let boostedRand = Math.random() * 100;
      for (let i = 0; i < skins.length; i++) {
        boostedRand -= chances[i] ?? 0;
        if (boostedRand <= 0) return skins[i];
      }
      return skins[skins.length - 1];
    }

    let customRand = Math.random() * customTotal;
    for (const skin of skins) {
      customRand -= Math.max(0, skin.dropChance ?? 0);
      if (customRand <= 0) return skin;
    }
    return skins[skins.length - 1];
  }

  const chances = casePrice !== undefined
    ? buildPriceBalancedCaseChances(skins, casePrice, returnBoostPercent)
    : skins.map((skin) => getLegacyDefaultCaseSkinChance(skins, skin));
  let rand = Math.random() * 100;
  for (let i = 0; i < skins.length; i++) {
    rand -= chances[i] ?? 0;
    if (rand <= 0) return skins[i];
  }
  return skins[skins.length - 1];
}

export const FAKE_USERS = [
  'xX_Pro_Gamer_Xx', 'SniperElite', 'CaseMaster99', 'FaZe_Wannabe', 'NightStalker',
  'ThunderBolt', 'Shadow_Wolf', 'NeonKnight', 'BladeRunner', 'CryptoKing',
  'ViperStrike', 'GhostProtocol', 'IronFist', 'SilverBullet', 'DarkHorse',
  'AceOfSpades', 'StormBreaker', 'CyberPunk', 'LaserEye', 'QuickDraw',
  'FrostByte', 'NovaStar', 'PhantomX', 'RedZone', 'AlphaWolf',
];
