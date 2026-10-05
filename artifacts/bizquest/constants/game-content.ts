export type VentureId = 'lemonade' | 'art' | 'bakes' | 'plants';
export type AvatarAccessory = 'none' | 'cap' | 'glasses' | 'headband' | 'bow';

export interface Venture {
  id: VentureId;
  name: string;
  shortName: string;
  description: string;
  product: string;
  unitCost: number;
  salePrice: number;
  icon: 'water-outline' | 'color-palette-outline' | 'cafe-outline' | 'leaf-outline';
  tone: 'gold' | 'orange' | 'blue' | 'mint';
}

export const VENTURES: Venture[] = [
  {
    id: 'lemonade',
    name: 'Lemonade Stand',
    shortName: 'Lemonade',
    description: 'Mix up a sunny neighborhood favorite.',
    product: 'Fresh lemonade',
    unitCost: 3,
    salePrice: 8,
    icon: 'water-outline',
    tone: 'gold',
  },
  {
    id: 'art',
    name: 'Art & Print Studio',
    shortName: 'Art studio',
    description: 'Turn your creative ideas into mini prints.',
    product: 'Mini art print',
    unitCost: 5,
    salePrice: 12,
    icon: 'color-palette-outline',
    tone: 'orange',
  },
  {
    id: 'bakes',
    name: 'Little Bake Shop',
    shortName: 'Bake shop',
    description: 'Make a treat worth coming back for.',
    product: 'Cookie box',
    unitCost: 4,
    salePrice: 10,
    icon: 'cafe-outline',
    tone: 'blue',
  },
  {
    id: 'plants',
    name: 'Plant Pals',
    shortName: 'Plant shop',
    description: 'Help tiny plants find a happy home.',
    product: 'Starter seedling',
    unitCost: 5,
    salePrice: 14,
    icon: 'leaf-outline',
    tone: 'mint',
  },
];

export interface Quest {
  id: string;
  title: string;
  skill: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface BusinessEvent {
  id: string;
  title: string;
  story: string;
  choices: { label: string; detail: string }[];
}

export const BUSINESS_EVENTS: BusinessEvent[] = [
  {
    id: 'broken-cooler',
    title: 'Uh-oh! The cooler stopped.',
    story: 'The lemonade is getting warm. A few customers are already in line. What is your smartest next move?',
    choices: [
      { label: 'Use my emergency fund', detail: 'Spend 12 Biz Bucks to borrow a cooler and keep serving.' },
      { label: 'Pause and protect the drinks', detail: 'Stop sales, save your stock, and plan a safe restart.' },
      { label: 'Ask my mentor for a hand', detail: 'Spend 5 Biz Bucks and learn how to check the cooler.' },
    ],
  },
  {
    id: 'rainy-market',
    title: 'Rain is coming!',
    story: 'Dark clouds roll over your busy market. Your table is outside and the first drops are falling.',
    choices: [
      { label: 'Rent a covered spot', detail: 'Spend 8 Biz Bucks to stay open and keep your display dry.' },
      { label: 'Move inside with a neighbor', detail: 'Team up, share space, and keep your money safe.' },
      { label: 'Close early and make a plan', detail: 'Protect your supplies and decide what to improve next time.' },
    ],
  },
  {
    id: 'supply-shortage',
    title: 'Your supplier is out!',
    story: 'You need more supplies, but your usual shop has sold out. Customers are expecting you.',
    choices: [
      { label: 'Buy a backup batch', detail: 'Spend 16 Biz Bucks to restock from a different shop.' },
      { label: 'Ask another maker to share', detail: 'Offer a fair trade and keep some money in your wallet.' },
      { label: 'Save your emergency fund', detail: 'Take a short break and compare prices before buying.' },
    ],
  },
];

export const QUESTS: Quest[] = [
  {
    id: 'budget-basics',
    title: 'The Pop-up Budget',
    skill: 'PLAN YOUR MONEY',
    prompt:
      'You have 40 Biz Bucks. A table costs 12 and supplies cost 18. How much can you still save?',
    options: ['10 Biz Bucks', '20 Biz Bucks', '30 Biz Bucks'],
    answerIndex: 0,
    explanation:
      '12 + 18 = 30. Set aside the 10 left over before spending it. A plan helps your business handle surprises.',
  },
  {
    id: 'smart-saver',
    title: 'Save for the Next Batch',
    skill: 'SAVE & REINVEST',
    prompt:
      'Your art prints earned 36 Biz Bucks. The next batch will cost 15. What is a smart first move?',
    options: [
      'Save 15 for supplies, then plan the rest',
      'Spend all 36 on decorations',
      'Give every print away for free',
    ],
    answerIndex: 0,
    explanation:
      'Saving the next batch cost protects your business. Then you can choose how to use the money that remains.',
  },
  {
    id: 'price-puzzle',
    title: 'The Price Puzzle',
    skill: 'REVENUE & COSTS',
    prompt:
      'You make 4 products that cost 3 Biz Bucks each. You sell all 4 for 8 each. What is your profit?',
    options: ['8 Biz Bucks', '20 Biz Bucks', '32 Biz Bucks'],
    answerIndex: 1,
    explanation:
      'Sales bring in 32. Making the products cost 12. Profit is 32 − 12 = 20 Biz Bucks.',
  },
];

export const SKIN_TONES = [
  { name: 'Warm tan', value: '#D99B6E' },
  { name: 'Golden', value: '#F0BC88' },
  { name: 'Cocoa', value: '#9C6347' },
  { name: 'Deep brown', value: '#704633' },
  { name: 'Peach', value: '#F4D0AD' },
];

export const HAIR_COLORS = [
  { name: 'Espresso', value: '#39251F' },
  { name: 'Chestnut', value: '#754128' },
  { name: 'Midnight', value: '#292D3C' },
  { name: 'Copper', value: '#C16C43' },
];

export const SHIRT_COLORS = [
  { name: 'Sunshine', value: '#F3BF43' },
  { name: 'Coral', value: '#F2734E' },
  { name: 'Ocean', value: '#5A9AD0' },
  { name: 'Garden', value: '#5BA57F' },
  { name: 'Lilac', value: '#8970CB' },
];

export const PLAYER_NAMES = ['Alex', 'Jordan', 'Riley', 'Sam'];

export const BADGES = [
  { id: 'first-idea', name: 'Big Idea', detail: 'Started your first business', icon: 'bulb-outline' },
  { id: 'first-sale', name: 'First Sale', detail: 'Made your first sale', icon: 'pricetag-outline' },
  { id: 'first-quest', name: 'Quick Thinker', detail: 'Solved your first money quest', icon: 'flash-outline' },
  { id: 'smart-saver', name: 'Smart Saver', detail: 'Set money aside for later', icon: 'shield-checkmark-outline' },
  { id: 'decision-maker', name: 'Decision Maker', detail: 'Finished every money quest', icon: 'trophy-outline' },
  { id: 'sales-star', name: 'Sales Star', detail: 'Served five customers in one market week', icon: 'star-outline' },
  { id: 'team-player', name: 'Team Player', detail: 'Hired a helper and grew your shop', icon: 'people-outline' },
] as const;
