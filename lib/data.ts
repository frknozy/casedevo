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

export const cases: Case[] = [
  {
    id: 'revolution',
    name: 'Revolution Case',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 2.49,
    tag: 'HOT',
    skins: [
      { id: 'r1', name: 'Fade', weapon: 'M4A4', rarity: 'covert', price: 180.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'r2', name: 'Howl', weapon: 'M4A4', rarity: 'extraordinary', price: 1200.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'r3', name: 'Asiimov', weapon: 'AK-47', rarity: 'covert', price: 95.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Battle-Scarred' },
      { id: 'r4', name: 'Neo-Noir', weapon: 'AWP', rarity: 'classified', price: 28.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTqXUpMXknLyP_bUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'r5', name: 'Hyper Beast', weapon: 'AWP', rarity: 'classified', price: 22.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'r6', name: 'Orion', weapon: 'AK-47', rarity: 'restricted', price: 12.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'r7', name: 'Frontside Misty', weapon: 'P250', rarity: 'restricted', price: 5.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'r8', name: 'Candy Apple', weapon: 'M4A1-S', rarity: 'milspec', price: 3.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'r9', name: 'Monkey Business', weapon: 'USP-S', rarity: 'milspec', price: 4.20, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'r10', name: 'Midnight Storm', weapon: 'Glock-18', rarity: 'milspec', price: 2.80, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Battle-Scarred' },
      { id: 'r11', name: 'Crimson Web', weapon: 'Knife', rarity: 'extraordinary', price: 450.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
    ]
  },
  {
    id: 'kilowatt',
    name: 'Kilowatt Case',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 3.99,
    tag: 'NEW',
    skins: [
      { id: 'k1', name: 'Fade', weapon: 'AK-47', rarity: 'covert', price: 340.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'k2', name: 'Neon Revolution', weapon: 'AK-47', rarity: 'covert', price: 15.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'k3', name: 'Hyper Beast', weapon: 'M4A4', rarity: 'classified', price: 35.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'k4', name: 'Neo-Noir', weapon: 'USP-S', rarity: 'classified', price: 45.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'k5', name: 'Stained', weapon: 'AWP', rarity: 'restricted', price: 8.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'k6', name: 'Vulcan', weapon: 'AK-47', rarity: 'restricted', price: 18.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'k7', name: 'Bloodsport', weapon: 'AK-47', rarity: 'milspec', price: 5.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'k8', name: 'Wasteland Rebel', weapon: 'AK-47', rarity: 'milspec', price: 3.20, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'k9', name: 'Doppler', weapon: 'Knife', rarity: 'extraordinary', price: 380.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
    ]
  },
  {
    id: 'dreams-nightmares',
    name: 'Dreams & Nightmares',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 0.99,
    tag: 'BEST VALUE',
    skins: [
      { id: 'd1', name: 'Dreams & Nightmares', weapon: 'AK-47', rarity: 'covert', price: 8.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'd2', name: 'Off World', weapon: 'M4A1-S', rarity: 'covert', price: 12.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'd3', name: 'Emerald Pinstripe', weapon: 'MP9', rarity: 'classified', price: 4.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'd4', name: 'Digital Threat', weapon: 'Desert Eagle', rarity: 'classified', price: 6.20, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'd5', name: 'Acid Fade', weapon: 'M4A4', rarity: 'restricted', price: 3.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'd6', name: 'Turbo Peek', weapon: 'MP5-SD', rarity: 'restricted', price: 2.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'd7', name: 'Copper Galaxy', weapon: 'P90', rarity: 'milspec', price: 1.80, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'd8', name: 'UV', weapon: 'Mac-10', rarity: 'milspec', price: 2.10, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
    ]
  },
  {
    id: 'fracture',
    name: 'Fracture Case',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 1.79,
    skins: [
      { id: 'f1', name: 'Bullet Rain', weapon: 'M4A4', rarity: 'covert', price: 45.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'f2', name: 'Blaze', weapon: 'Desert Eagle', rarity: 'covert', price: 65.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'f3', name: 'Printstream', weapon: 'M4A1-S', rarity: 'classified', price: 32.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'f4', name: 'Flashback', weapon: 'AK-47', rarity: 'classified', price: 18.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'f5', name: 'Desert-Strike', weapon: 'M4A4', rarity: 'restricted', price: 6.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'f6', name: 'Aggressor', weapon: 'AUG', rarity: 'restricted', price: 4.80, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'f7', name: 'Bright Water', weapon: 'M4A1-S', rarity: 'milspec', price: 2.90, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'f8', name: 'Knife', weapon: 'Talon Knife', rarity: 'extraordinary', price: 290.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
    ]
  },
  {
    id: 'prisma2',
    name: 'Prisma 2 Case',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 1.29,
    skins: [
      { id: 'p1', name: 'Hydroponic', weapon: 'AK-47', rarity: 'covert', price: 55.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'p2', name: 'Decimator', weapon: 'M4A4', rarity: 'covert', price: 30.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'p3', name: 'MK7', weapon: 'M4A1-S', rarity: 'classified', price: 14.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'p4', name: 'Eco', weapon: 'Glock-18', rarity: 'classified', price: 9.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'p5', name: 'Donderry', weapon: 'Nova', rarity: 'restricted', price: 3.80, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'p6', name: 'Prism', weapon: 'AWP', rarity: 'restricted', price: 7.20, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'p7', name: 'Graven', weapon: 'SCAR-20', rarity: 'milspec', price: 2.40, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'p8', name: 'Butterfly Knife', weapon: 'Butterfly Knife', rarity: 'extraordinary', price: 420.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
    ]
  },
  {
    id: 'snakebite',
    name: 'Snakebite Case',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 2.89,
    skins: [
      { id: 's1', name: 'Kowloon', weapon: 'AK-47', rarity: 'covert', price: 22.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 's2', name: 'Roll Cage', weapon: 'M4A1-S', rarity: 'covert', price: 18.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 's3', name: 'Snake Camo', weapon: 'AUG', rarity: 'classified', price: 9.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 's4', name: 'Snake Strike', weapon: 'M4A4', rarity: 'restricted', price: 4.20, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 's5', name: 'Paw', weapon: 'R8 Revolver', rarity: 'milspec', price: 2.60, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 's6', name: 'Kumicho Dragon', weapon: 'Desert Eagle', rarity: 'classified', price: 12.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 's7', name: 'Karambit', weapon: 'Karambit', rarity: 'extraordinary', price: 560.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
    ]
  },
  {
    id: 'recoil',
    name: 'Recoil Case',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 1.99,
    skins: [
      { id: 're1', name: 'Asiimov', weapon: 'P90', rarity: 'covert', price: 28.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 're2', name: 'Mecha Industries', weapon: 'AK-47', rarity: 'covert', price: 55.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 're3', name: 'Fade', weapon: 'AWP', rarity: 'classified', price: 120.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 're4', name: 'Terminal List', weapon: 'AUG', rarity: 'restricted', price: 5.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 're5', name: 'Overdrive', weapon: 'Nova', rarity: 'milspec', price: 3.10, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 're6', name: 'Shadow Daggers', weapon: 'Shadow Daggers', rarity: 'extraordinary', price: 180.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
    ]
  },
  {
    id: 'clutch',
    name: 'Clutch Case',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 4.49,
    tag: 'HOT',
    skins: [
      { id: 'c1', name: 'Containment Breach', weapon: 'AK-47', rarity: 'covert', price: 180.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'c2', name: 'Hyper Beast', weapon: 'USP-S', rarity: 'covert', price: 25.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'c3', name: 'Blueprint', weapon: 'AWP', rarity: 'classified', price: 85.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'c4', name: 'Mob Leader', weapon: 'Desert Eagle', rarity: 'classified', price: 14.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'c5', name: 'Fever Dream', weapon: 'P250', rarity: 'restricted', price: 5.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'c6', name: 'M81', weapon: 'M4A4', rarity: 'milspec', price: 3.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'c7', name: 'M9 Bayonet', weapon: 'M9 Bayonet', rarity: 'extraordinary', price: 320.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Doppler' },
    ]
  },
  {
    id: 'horizon',
    name: 'Horizon Case',
    image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f',
    price: 5.99,
    skins: [
      { id: 'h1', name: 'Printstream', weapon: 'Desert Eagle', rarity: 'covert', price: 55.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'h2', name: 'Asiimov', weapon: 'M4A4', rarity: 'covert', price: 95.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Field-Tested' },
      { id: 'h3', name: 'Wildfire', weapon: 'Glock-18', rarity: 'classified', price: 35.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'h4', name: 'Aquamarine Revenge', weapon: 'AK-47', rarity: 'restricted', price: 25.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
      { id: 'h5', name: 'Whiteout', weapon: 'MP5-SD', rarity: 'milspec', price: 6.50, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Minimal Wear' },
      { id: 'h6', name: 'Stiletto Knife', weapon: 'Stiletto Knife', rarity: 'extraordinary', price: 250.00, image: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxH5rd9eDAjcFyv45SaqXeTqnCJuAVfVlz6Q3GJl5MhWBSPN3e9YmEJVUBb4rwdQ9VJKD3bAhH94uzmYOJkYrlDqvoI7TF/360fx360f', wear: 'Factory New' },
    ]
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

export const FAKE_USERS = ['xX_Pro_Gamer_Xx', 'SniperElite', 'CaseMaster99', 'FaZe_Wannabe', 'NightStalker', 'ThunderBolt', 'Shadow_Wolf', 'NeonKnight', 'BladeRunner', 'CryptoKing', 'ViperStrike', 'GhostProtocol', 'IronFist', 'SilverBullet', 'DarkHorse', 'AceOfSpades', 'StormBreaker', 'CyberPunk', 'LaserEye', 'QuickDraw'];
