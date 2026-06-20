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
}

export interface Case {
  id: string;
  name: string;
  image: string;
  price: number;
  tag?: 'HOT' | 'NEW' | 'BEST VALUE';
  skins: Skin[];
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
  consumer: 'Consumer Grade',
  industrial: 'Industrial Grade',
  milspec: 'Mil-Spec',
  restricted: 'Restricted',
  classified: 'Classified',
  covert: 'Covert',
  extraordinary: 'Extraordinary',
};

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  consumer: 79.92,
  industrial: 15.98,
  milspec: 3.2,
  restricted: 0.64,
  classified: 0.128,
  covert: 0.0256,
  extraordinary: 0.0064,
};

const CDN = 'https://community.cloudflare.steamstatic.com/economy/image/';
const img = (hash: string) => `${CDN}${hash}/360fx360f`;

// Real Steam CDN image hashes
const HASHES = {
  // Cases
  revCase: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frnAVvfb6aqduc_TFVjTCxbx05OU4S3jilE9w4DzRnImtIy2Sa1JzDJEhRPlK7EcO4U8gfA',
  kilowattCase: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frnEVvqf_a6VoIfGSXz7Hlbwg57QwSS_mxhl15jiGyN37c3_GZw91W8BwRflK7EfKsa2sfw',
  dreamsCase: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frnIV7Kb5OaU-JqfHDzXFle0u4LY8Gy_kkRgisGzcm4v4J3vDOAQmDMdyRvlK7EcmeCU3yw',
  fractureCase: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_fr3QV7aD7OP01IfbGDzPCmbsm4LU5GnvkzUsi4WvUmIqtci_CPQNyApsjE_lK7EfrhW545A',
  prisma2Case: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_fr3cV6vT9avBvefWWDDGTxbZ14rhsTX7qkE90sDiHwt2pdC-TblJ2DsB1QPlK7Ee9riHKAA',
  snakebiteCase: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_fr3oVvvT4bfI4dvTLCGTCmLl16ec7TX_mk08k42iHwtqscy-WPVUmCZJ4R_lK7Ed8Q6OYtw',
  recoilCase: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frnMVu6b-avA-JqSSCjSWwuhz47U9TCzlxh9yt2WGnNqgIi-fbgUkWMNxFPlK7EdIJF6a2Q',
  clutchCase: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frHsVtqr8a_dsdKTAWDWVxLgjsrAwHSvgwEQk4m-ByYuqIC2eO1VyD5QiR_lK7EcxQQPYQA',
  horizonCase: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_fr3IV6vSrbfw8eaiWCjWVkewgseM9TXyxl0wi6mSHn9-tIHqUbg5yDpEmEPlK7EcXFmSLsw',
  // Revolution Case skins
  ak47HeadShot: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlV6xoIfSsHW-f1dF-v-1mcCS2kRQyvnPWn9egI3mWbA4kCZJxRbFf5haxwYHuYezntg2Ljt1Mnnr8jngfuHo__a9cBiDIU36L',
  m4a4CyberSecurity: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSI-mRC3WA1OB9j-xsSyCmmFN_5Tvdm9ypcXnGPQ8iXMYjF7EM50a8wdKzMOLntFfb3d5BnnmriH9N8G81tGbS0tGU',
  awpChromaticAberration: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6dlMv-eD1iAyOB9j-1gSCGn2x50tT_Tm9f4cXORPA4oWJckFOMLtha_x9e1Nu-35QfbjYtHyiythitXrnE8ylr09zg',
  glock18Winterized: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c_M2pZKtuK8-WAm6ExNF1sexmcCW6khUz_W6Azdn6eCrBalcjXJpzE7EO5xa_l4DuNu6ws1Hb2IgUn32si39B5y11o7FVC5qcAFg',
  m4a1sEmphorosaur: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj-dsSi26mxoYtS-AlJXgHibCOl9lV4x2RbMLtBC8lYLjN7vh5QGMit0WxX-viC8a6S5v5LsFWfUg_fbSiwDAL_RjttkAwiOv',
  ak47Nightwish: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSLvmUBnOHyP1-j-xsSyCmmFMit2nVy434IHLDbwcmWcRzQrYNska_xoDjPuOx5QOPjY4RzC342itM8G81tODLUZAk',
  ak47IceCoaled: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-UGm-Zz-llj-xsSyCmmFMi5GrcwtivdnnCOgd2DsNxTeIJuxbqk9XuN-_i5gKI3d1BxH35iy1P8G81tKMOXOY4',
  uspJawbreaker: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSNeODHViUzulxqd5lRi67gVMl62nUyd2scnOVPAcgA5J2TOFY5xLrlN22YbzgsQaI2IlHyiWojnwa8G81tErOD-_J',
  // Kilowatt Case skins
  ak47Inheritance: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiNQ0OKheqdoLPGaAFidxOp_pewnSn6wl0p-4D7Ryo34cSqeOwMlWZt5QbJfuhW9koKyMO3ksgWMiY8TzDK-0H009BnnIw',
  m4a1sBlackLotus: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_3HDzaD_ux6seJicCW8gQg0jDCAnobsLGWTbQQnDsN3QuYOtELqkIazZeLm7lPYj9gQzyj72y8du31i6ulQA6Rx5OSJ2CPXrFUp',
  awpDuality: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf-jFk7uW-V6hkLfKcMXSewOVzj-xsSyCmmFN0tzvcnor9IC7CP1BxDpVyEO9Zt0Swx4bvP-7ktQfZj4kTn3n2hi8b8G81tHGU9aNy',
  glock18UmbralRabbit: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-eAWie_vx3suNgWxa-kBkupjDLmY76cn_BbwIiWZcjRbMM5hDqltThYunq5FGM2IJDmS32jypA7HxosvFCD_RtUTEu0Q',
  m4a4EtchLord: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwi8P7qaRe6psK_WRB3OV_uJ_t-l9AXjnw0Qh5GqGn9b_dH3Cbg4nCcAhRLIM4BW7mtXmM7jjtAXai40WmHngznQeK6EUrpc',
  mac10LightBox: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8n5WxrR1W7vH_OJtkLPyGHW6fz9F6ueZhW2e2lBsk4WvXw974diiSblV1DMBxRrEJu0PrwNy1Mruw4gKK3d0TynmskGoXuUBgCcQQ',
  // Dreams & Nightmares
  ak47Dreams: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frnIV7Kb5OaU-JqfHDzXFle0u4LY8Gy_kkRgisGzcm4v4J3vDOAQmDMdyRvlK7EcmeCU3yw',
  // Fracture
  m4a4BulletRain: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0PC7ZKhoNM-BD26e_uMisbBWQiy3nAgq_TuGztmocHPEP1JzDZJ2QO9btBHqwdzuNe3rslGK3dhDm3mq3ykc6Hx1o7FV8lVG4HA',
  deagleBlaze: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKF-JeKHMWKRxuJzj-JmXTu8kRgpjDGMnYftb32UPwJxDJokRuUIsRi_lNPhM7izsgXZi49GySiq2nxNuCdttbtUB_A7uvqAjSk2l_c',
  m4a1sPrintstream: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwjFS4_ega6F_H_OGMWrEwL9lj_F7Rienhgk1tjyIpYL8JSLSMxghAsBwQeMN5BHtlIblZuLr4Q3biNkRmH_5iX5Muypj47pWA6EsqPaGkUifZp-rQ1Ym',
  // Prisma 2
  ak47PhantomDisruptor: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlJfA6H-CbD2mEzuNJtOh6XTyjgRI1jDCAnobsLGXBPQ8mDMZyFucN4BLrw9HhMLiw51Ddi45ExX_9jXtN7S0-tekFAqYj5OSJ2LJWXMuH',
  glock18NeoNoir: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-dAW6C_uNztOh8Qme1wUsl52nQzN-hc3KTaAUiDsZzELMNs0TqwNKyZu62swzXj4xDnCuqkGoXudLX4DLr',
  // Recoil
  p90Asiimov: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLhx8bf_jdk_6v-JaV-KfmeAXGvzOtyufRkAXzgwUlwsmSGyo6ocinEPwZzC5J1F-EIsUXrwdbkNeqz7wPaj4wXnH7gznQeoepd94c',
  // Clutch
  awpHyperBeast: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk7uW-V6x0MPWBMWWVwP1ij-xsSyCmmFMj62Tcwt-gJC_BbwNyDZokQu8I4BK6wdazMuq35AbW3YIWmy_4h3tO8G81tKCz9TDP',
  deaglePrintstream: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk7OeRbKFsJ8-DHG6e1f1iouRoQha-kBkupjDLz9_6c3mWPFBxX8N0EOMIsULpmtHjPuvq41bc2dhAzy3_2ngfvHpt5_FCD_RJLjxjaQ',
  // Horizon
  ak47NeonRider: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlV6poL_6sHG6UxPxJuORoWTD9kxl04GjVwo2qcX7CZlIoWMAiQeYKsUSwlNblNu-04ALeg49EyHj3jTQJsHivAwB2zA',
  glock18WastelandRebel: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1Y-s2pZKtuK8-ED3SExOJ3vuVWXSyxkBEYvjiBk5r0b3zBZlNzCpImF7MK40TtmtDmZuvktFSP39hCny782i5J7Xw95uYHBKQ7uvqANlqPdCA',
  // Shared / generic knife placeholder
  knife: 'i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frnAVvfb6aqduc_TFVjTCxbx05OU4S3jilE9w4DzRnImtIy2Sa1JzDJEhRPlK7EcO4U8gfA',
};

export const cases: Case[] = [
  // ──────────────────── REVOLUTION CASE ────────────────────
  {
    id: 'revolution',
    name: 'Revolution Case',
    image: img(HASHES.revCase),
    price: 2.49,
    tag: 'HOT',
    skins: [
      { id: 'r1', name: 'Head Shot', weapon: 'AK-47', rarity: 'covert', price: 55.00, image: img(HASHES.ak47HeadShot), wear: 'Minimal Wear' },
      { id: 'r2', name: 'Cyber Security', weapon: 'M4A4', rarity: 'covert', price: 42.00, image: img(HASHES.m4a4CyberSecurity), wear: 'Factory New' },
      { id: 'r3', name: 'Chromatic Aberration', weapon: 'AWP', rarity: 'classified', price: 14.00, image: img(HASHES.awpChromaticAberration), wear: 'Field-Tested' },
      { id: 'r4', name: 'Winterized', weapon: 'Glock-18', rarity: 'classified', price: 16.00, image: img(HASHES.glock18Winterized), wear: 'Factory New' },
      { id: 'r5', name: 'Emphorosaur-S', weapon: 'M4A1-S', rarity: 'restricted', price: 4.20, image: img(HASHES.m4a1sEmphorosaur), wear: 'Field-Tested' },
      { id: 'r6', name: 'Nightwish', weapon: 'AK-47', rarity: 'restricted', price: 3.80, image: img(HASHES.ak47Nightwish), wear: 'Factory New' },
      { id: 'r7', name: 'Ice Coaled', weapon: 'AK-47', rarity: 'milspec', price: 1.40, image: img(HASHES.ak47IceCoaled), wear: 'Battle-Scarred' },
      { id: 'r8', name: 'Jawbreaker', weapon: 'USP-S', rarity: 'milspec', price: 2.10, image: img(HASHES.uspJawbreaker), wear: 'Factory New' },
      { id: 'r9', name: 'Vino Primo', weapon: 'P250', rarity: 'milspec', price: 0.65, image: img(HASHES.ak47IceCoaled), wear: 'Field-Tested' },
      { id: 'r10', name: 'Dezastre', weapon: 'SSG 08', rarity: 'milspec', price: 0.55, image: img(HASHES.glock18Winterized), wear: 'Minimal Wear' },
      { id: 'r11', name: 'Analog Input', weapon: 'Sawed-Off', rarity: 'milspec', price: 0.45, image: img(HASHES.mac10LightBox), wear: 'Factory New' },
      { id: 'r12', name: 'Monkeyflage', weapon: 'MAC-10', rarity: 'industrial', price: 0.35, image: img(HASHES.mac10LightBox), wear: 'Minimal Wear' },
      { id: 'r13', name: 'Vent Rush', weapon: 'P90', rarity: 'consumer', price: 0.22, image: img(HASHES.p90Asiimov), wear: 'Factory New' },
      { id: 'r14', name: 'Clear Polymer', weapon: 'Nova', rarity: 'consumer', price: 0.18, image: img(HASHES.glock18Winterized), wear: 'Field-Tested' },
      { id: 'r15', name: 'Karambit | Doppler', weapon: '★ Karambit', rarity: 'extraordinary', price: 620.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },

  // ──────────────────── KILOWATT CASE ────────────────────
  {
    id: 'kilowatt',
    name: 'Kilowatt Case',
    image: img(HASHES.kilowattCase),
    price: 3.99,
    tag: 'NEW',
    skins: [
      { id: 'k1', name: 'Inheritance', weapon: 'AK-47', rarity: 'covert', price: 98.00, image: img(HASHES.ak47Inheritance), wear: 'Factory New' },
      { id: 'k2', name: 'Black Lotus', weapon: 'M4A1-S', rarity: 'covert', price: 280.00, image: img(HASHES.m4a1sBlackLotus), wear: 'Factory New' },
      { id: 'k3', name: 'Duality', weapon: 'AWP', rarity: 'classified', price: 32.00, image: img(HASHES.awpDuality), wear: 'Field-Tested' },
      { id: 'k4', name: 'Umbral Rabbit', weapon: 'Glock-18', rarity: 'classified', price: 45.00, image: img(HASHES.glock18UmbralRabbit), wear: 'Factory New' },
      { id: 'k5', name: 'Etch Lord', weapon: 'M4A4', rarity: 'restricted', price: 14.00, image: img(HASHES.m4a4EtchLord), wear: 'Minimal Wear' },
      { id: 'k6', name: 'Light Box', weapon: 'MAC-10', rarity: 'restricted', price: 10.50, image: img(HASHES.mac10LightBox), wear: 'Factory New' },
      { id: 'k7', name: 'Uproar', weapon: 'AK-47', rarity: 'milspec', price: 1.80, image: img(HASHES.ak47IceCoaled), wear: 'Field-Tested' },
      { id: 'k8', name: 'Meow 36', weapon: 'Famas', rarity: 'milspec', price: 0.90, image: img(HASHES.glock18UmbralRabbit), wear: 'Factory New' },
      { id: 'k9', name: 'Entombed', weapon: 'XM1014', rarity: 'milspec', price: 0.55, image: img(HASHES.mac10LightBox), wear: 'Minimal Wear' },
      { id: 'k10', name: 'Fragments', weapon: 'SCAR-20', rarity: 'consumer', price: 0.22, image: img(HASHES.m4a4EtchLord), wear: 'Field-Tested' },
      { id: 'k11', name: 'Twin Turbo', weapon: 'Dual Berettas', rarity: 'consumer', price: 0.18, image: img(HASHES.glock18Winterized), wear: 'Factory New' },
      { id: 'k12', name: 'Liquidation', weapon: 'MP5-SD', rarity: 'industrial', price: 0.30, image: img(HASHES.mac10LightBox), wear: 'Factory New' },
      { id: 'k13', name: 'Butterfly Knife | Doppler', weapon: '★ Butterfly Knife', rarity: 'extraordinary', price: 450.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },

  // ──────────────────── DREAMS & NIGHTMARES ────────────────────
  {
    id: 'dreams-nightmares',
    name: 'Dreams & Nightmares',
    image: img(HASHES.dreamsCase),
    price: 0.99,
    tag: 'BEST VALUE',
    skins: [
      { id: 'd1', name: 'Dreams & Nightmares', weapon: 'AK-47', rarity: 'covert', price: 7.50, image: img(HASHES.ak47Dreams), wear: 'Factory New' },
      { id: 'd2', name: 'Off World', weapon: 'M4A1-S', rarity: 'covert', price: 11.00, image: img(HASHES.m4a1sEmphorosaur), wear: 'Minimal Wear' },
      { id: 'd3', name: 'Emerald Pinstripe', weapon: 'MP9', rarity: 'classified', price: 3.80, image: img(HASHES.mac10LightBox), wear: 'Factory New' },
      { id: 'd4', name: 'Digital Threat', weapon: 'Desert Eagle', rarity: 'classified', price: 5.50, image: img(HASHES.deaglePrintstream), wear: 'Field-Tested' },
      { id: 'd5', name: 'Turbo Peek', weapon: 'MP5-SD', rarity: 'restricted', price: 2.20, image: img(HASHES.mac10LightBox), wear: 'Factory New' },
      { id: 'd6', name: 'Acid Fade', weapon: 'M4A4', rarity: 'restricted', price: 2.80, image: img(HASHES.m4a4CyberSecurity), wear: 'Minimal Wear' },
      { id: 'd7', name: 'Copper Galaxy', weapon: 'P90', rarity: 'milspec', price: 1.60, image: img(HASHES.p90Asiimov), wear: 'Factory New' },
      { id: 'd8', name: 'UV', weapon: 'Mac-10', rarity: 'milspec', price: 1.90, image: img(HASHES.mac10LightBox), wear: 'Minimal Wear' },
      { id: 'd9', name: 'Space Monkey', weapon: 'MP7', rarity: 'milspec', price: 0.50, image: img(HASHES.glock18Winterized), wear: 'Field-Tested' },
      { id: 'd10', name: 'Karambit | Case Hardened', weapon: '★ Karambit', rarity: 'extraordinary', price: 520.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },

  // ──────────────────── FRACTURE CASE ────────────────────
  {
    id: 'fracture',
    name: 'Fracture Case',
    image: img(HASHES.fractureCase),
    price: 1.79,
    skins: [
      { id: 'f1', name: 'Bullet Rain', weapon: 'M4A4', rarity: 'covert', price: 48.00, image: img(HASHES.m4a4BulletRain), wear: 'Factory New' },
      { id: 'f2', name: 'Blaze', weapon: 'Desert Eagle', rarity: 'covert', price: 68.00, image: img(HASHES.deagleBlaze), wear: 'Factory New' },
      { id: 'f3', name: 'Printstream', weapon: 'M4A1-S', rarity: 'classified', price: 34.00, image: img(HASHES.m4a1sPrintstream), wear: 'Minimal Wear' },
      { id: 'f4', name: 'Flashback', weapon: 'AK-47', rarity: 'classified', price: 19.00, image: img(HASHES.ak47HeadShot), wear: 'Field-Tested' },
      { id: 'f5', name: 'Desert-Strike', weapon: 'M4A4', rarity: 'restricted', price: 6.50, image: img(HASHES.m4a4CyberSecurity), wear: 'Minimal Wear' },
      { id: 'f6', name: 'Aggressor', weapon: 'AUG', rarity: 'restricted', price: 4.80, image: img(HASHES.m4a4EtchLord), wear: 'Field-Tested' },
      { id: 'f7', name: 'Bright Water', weapon: 'M4A1-S', rarity: 'milspec', price: 2.90, image: img(HASHES.m4a1sEmphorosaur), wear: 'Factory New' },
      { id: 'f8', name: 'Oxide Blaze', weapon: 'P250', rarity: 'milspec', price: 0.60, image: img(HASHES.glock18Winterized), wear: 'Field-Tested' },
      { id: 'f9', name: 'Skulls', weapon: 'Tec-9', rarity: 'milspec', price: 0.45, image: img(HASHES.glock18Winterized), wear: 'Minimal Wear' },
      { id: 'f10', name: 'Talon Knife | Doppler', weapon: '★ Talon Knife', rarity: 'extraordinary', price: 290.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },

  // ──────────────────── PRISMA 2 CASE ────────────────────
  {
    id: 'prisma2',
    name: 'Prisma 2 Case',
    image: img(HASHES.prisma2Case),
    price: 1.29,
    skins: [
      { id: 'p1', name: 'Phantom Disruptor', weapon: 'AK-47', rarity: 'covert', price: 52.00, image: img(HASHES.ak47PhantomDisruptor), wear: 'Minimal Wear' },
      { id: 'p2', name: 'Neo-Noir', weapon: 'Glock-18', rarity: 'covert', price: 28.00, image: img(HASHES.glock18NeoNoir), wear: 'Field-Tested' },
      { id: 'p3', name: 'Decimator', weapon: 'M4A4', rarity: 'classified', price: 18.00, image: img(HASHES.m4a4CyberSecurity), wear: 'Factory New' },
      { id: 'p4', name: 'MK7', weapon: 'M4A1-S', rarity: 'classified', price: 12.00, image: img(HASHES.m4a1sPrintstream), wear: 'Minimal Wear' },
      { id: 'p5', name: 'Prism', weapon: 'AWP', rarity: 'restricted', price: 7.20, image: img(HASHES.awpChromaticAberration), wear: 'Field-Tested' },
      { id: 'p6', name: 'Donderry', weapon: 'Nova', rarity: 'restricted', price: 3.80, image: img(HASHES.glock18NeoNoir), wear: 'Factory New' },
      { id: 'p7', name: 'Graven', weapon: 'SCAR-20', rarity: 'milspec', price: 2.40, image: img(HASHES.m4a4EtchLord), wear: 'Minimal Wear' },
      { id: 'p8', name: 'Typhoon', weapon: 'Five-SeveN', rarity: 'milspec', price: 0.60, image: img(HASHES.glock18Winterized), wear: 'Factory New' },
      { id: 'p9', name: 'Butterfly Knife | Fade', weapon: '★ Butterfly Knife', rarity: 'extraordinary', price: 580.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },

  // ──────────────────── SNAKEBITE CASE ────────────────────
  {
    id: 'snakebite',
    name: 'Snakebite Case',
    image: img(HASHES.snakebiteCase),
    price: 2.89,
    skins: [
      { id: 's1', name: 'Kowloon', weapon: 'AK-47', rarity: 'covert', price: 22.00, image: img(HASHES.ak47Nightwish), wear: 'Factory New' },
      { id: 's2', name: 'Roll Cage', weapon: 'M4A1-S', rarity: 'covert', price: 18.00, image: img(HASHES.m4a1sEmphorosaur), wear: 'Minimal Wear' },
      { id: 's3', name: 'Snake Camo', weapon: 'AUG', rarity: 'classified', price: 9.50, image: img(HASHES.m4a4EtchLord), wear: 'Field-Tested' },
      { id: 's4', name: 'Kumicho Dragon', weapon: 'Desert Eagle', rarity: 'classified', price: 12.00, image: img(HASHES.deaglePrintstream), wear: 'Minimal Wear' },
      { id: 's5', name: 'Snake Strike', weapon: 'M4A4', rarity: 'restricted', price: 4.20, image: img(HASHES.m4a4CyberSecurity), wear: 'Minimal Wear' },
      { id: 's6', name: 'Paw', weapon: 'R8 Revolver', rarity: 'milspec', price: 2.60, image: img(HASHES.glock18Winterized), wear: 'Factory New' },
      { id: 's7', name: 'Limelight', weapon: 'M4A1-S', rarity: 'milspec', price: 0.60, image: img(HASHES.m4a1sPrintstream), wear: 'Field-Tested' },
      { id: 's8', name: 'Karambit | Bright Water', weapon: '★ Karambit', rarity: 'extraordinary', price: 540.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },

  // ──────────────────── RECOIL CASE ────────────────────
  {
    id: 'recoil',
    name: 'Recoil Case',
    image: img(HASHES.recoilCase),
    price: 1.99,
    skins: [
      { id: 're1', name: 'Mecha Industries', weapon: 'AK-47', rarity: 'covert', price: 58.00, image: img(HASHES.ak47HeadShot), wear: 'Minimal Wear' },
      { id: 're2', name: 'Asiimov', weapon: 'P90', rarity: 'covert', price: 30.00, image: img(HASHES.p90Asiimov), wear: 'Factory New' },
      { id: 're3', name: 'Fade', weapon: 'AWP', rarity: 'classified', price: 125.00, image: img(HASHES.awpChromaticAberration), wear: 'Factory New' },
      { id: 're4', name: 'Printstream', weapon: 'Desert Eagle', rarity: 'classified', price: 28.00, image: img(HASHES.deaglePrintstream), wear: 'Factory New' },
      { id: 're5', name: 'Terminal List', weapon: 'AUG', rarity: 'restricted', price: 5.50, image: img(HASHES.m4a4EtchLord), wear: 'Field-Tested' },
      { id: 're6', name: 'Overdrive', weapon: 'Nova', rarity: 'milspec', price: 3.10, image: img(HASHES.glock18Winterized), wear: 'Minimal Wear' },
      { id: 're7', name: 'Restricted Road', weapon: 'SSG 08', rarity: 'milspec', price: 0.50, image: img(HASHES.m4a4EtchLord), wear: 'Field-Tested' },
      { id: 're8', name: 'Shadow Daggers | Doppler', weapon: '★ Shadow Daggers', rarity: 'extraordinary', price: 185.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },

  // ──────────────────── CLUTCH CASE ────────────────────
  {
    id: 'clutch',
    name: 'Clutch Case',
    image: img(HASHES.clutchCase),
    price: 4.49,
    tag: 'HOT',
    skins: [
      { id: 'c1', name: 'Containment Breach', weapon: 'AK-47', rarity: 'covert', price: 185.00, image: img(HASHES.ak47HeadShot), wear: 'Factory New' },
      { id: 'c2', name: 'Hyper Beast', weapon: 'AWP', rarity: 'covert', price: 88.00, image: img(HASHES.awpHyperBeast), wear: 'Factory New' },
      { id: 'c3', name: 'Blueprint', weapon: 'AWP', rarity: 'classified', price: 90.00, image: img(HASHES.awpChromaticAberration), wear: 'Factory New' },
      { id: 'c4', name: 'Printstream', weapon: 'Desert Eagle', rarity: 'classified', price: 28.00, image: img(HASHES.deaglePrintstream), wear: 'Factory New' },
      { id: 'c5', name: 'Mob Leader', weapon: 'Desert Eagle', rarity: 'classified', price: 14.00, image: img(HASHES.deagleBlaze), wear: 'Field-Tested' },
      { id: 'c6', name: 'Fever Dream', weapon: 'P250', rarity: 'restricted', price: 5.00, image: img(HASHES.glock18UmbralRabbit), wear: 'Minimal Wear' },
      { id: 'c7', name: 'M81', weapon: 'M4A4', rarity: 'milspec', price: 3.50, image: img(HASHES.m4a4CyberSecurity), wear: 'Factory New' },
      { id: 'c8', name: 'Whiteout', weapon: 'MP5-SD', rarity: 'milspec', price: 2.90, image: img(HASHES.mac10LightBox), wear: 'Minimal Wear' },
      { id: 'c9', name: 'M9 Bayonet | Doppler', weapon: '★ M9 Bayonet', rarity: 'extraordinary', price: 340.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },

  // ──────────────────── HORIZON CASE ────────────────────
  {
    id: 'horizon',
    name: 'Horizon Case',
    image: img(HASHES.horizonCase),
    price: 5.99,
    skins: [
      { id: 'h1', name: 'Neon Rider', weapon: 'AK-47', rarity: 'covert', price: 32.00, image: img(HASHES.ak47NeonRider), wear: 'Factory New' },
      { id: 'h2', name: 'Asiimov', weapon: 'M4A4', rarity: 'covert', price: 98.00, image: img(HASHES.m4a4CyberSecurity), wear: 'Field-Tested' },
      { id: 'h3', name: 'Wildfire', weapon: 'Glock-18', rarity: 'classified', price: 38.00, image: img(HASHES.glock18NeoNoir), wear: 'Minimal Wear' },
      { id: 'h4', name: 'Wasteland Rebel', weapon: 'Glock-18', rarity: 'classified', price: 12.00, image: img(HASHES.glock18WastelandRebel), wear: 'Factory New' },
      { id: 'h5', name: 'Aquamarine Revenge', weapon: 'AK-47', rarity: 'restricted', price: 24.00, image: img(HASHES.ak47NeonRider), wear: 'Factory New' },
      { id: 'h6', name: 'Printstream', weapon: 'Desert Eagle', rarity: 'restricted', price: 28.00, image: img(HASHES.deaglePrintstream), wear: 'Factory New' },
      { id: 'h7', name: 'Whiteout', weapon: 'MP5-SD', rarity: 'milspec', price: 6.50, image: img(HASHES.mac10LightBox), wear: 'Minimal Wear' },
      { id: 'h8', name: 'Stiletto Knife | Fade', weapon: '★ Stiletto Knife', rarity: 'extraordinary', price: 260.00, image: img(HASHES.knife), wear: 'Factory New' },
    ],
  },
];

export function rollSkin(skins: Skin[]): Skin {
  const rarityWeightMap: Record<Rarity, number> = {
    consumer: 79.92,
    industrial: 15.98,
    milspec: 3.2,
    restricted: 0.64,
    classified: 0.128,
    covert: 0.0256,
    extraordinary: 0.0064,
  };

  const availableRarities = [...new Set(skins.map(s => s.rarity))];
  const totalWeight = availableRarities.reduce((sum, r) => sum + rarityWeightMap[r], 0);
  let rand = Math.random() * totalWeight;

  let selectedRarity: Rarity = availableRarities[0];
  for (const rarity of availableRarities) {
    rand -= rarityWeightMap[rarity];
    if (rand <= 0) {
      selectedRarity = rarity;
      break;
    }
  }

  const rarityPool = skins.filter(s => s.rarity === selectedRarity);
  return rarityPool[Math.floor(Math.random() * rarityPool.length)];
}

export const FAKE_USERS = [
  'xX_Pro_Gamer_Xx', 'SniperElite', 'CaseMaster99', 'FaZe_Wannabe', 'NightStalker',
  'ThunderBolt', 'Shadow_Wolf', 'NeonKnight', 'BladeRunner', 'CryptoKing',
  'ViperStrike', 'GhostProtocol', 'IronFist', 'SilverBullet', 'DarkHorse',
  'AceOfSpades', 'StormBreaker', 'CyberPunk', 'LaserEye', 'QuickDraw',
  'FrostByte', 'NovaStar', 'PhantomX', 'RedZone', 'AlphaWolf',
];
