import { Crop, Market, User, PriceRecord, Listing, Alert } from '../shared/types.ts';

export interface SeedData {
  users: User[];
  crops: Crop[];
  markets: Market[];
  prices: PriceRecord[];
  listings: Listing[];
  alerts: Alert[];
}

export const CROPS_SEED: (Crop & { base_price: number })[] = [
  { id: 'c1', name: 'Wheat', name_ur: 'گندم', category: 'Grains', base_price: 3400 },
  { id: 'c2', name: 'Basmati Rice', name_ur: 'باسمتی چاول', category: 'Grains', base_price: 9000 },
  { id: 'c3', name: 'Onion', name_ur: 'پیاز', category: 'Vegetables', base_price: 2800 },
  { id: 'c4', name: 'Tomato', name_ur: 'ٹماٹر', category: 'Vegetables', base_price: 3200 },
  { id: 'c5', name: 'Mango', name_ur: 'آم', category: 'Fruits', base_price: 6500 },
  { id: 'c6', name: 'Banana', name_ur: 'کیلا', category: 'Fruits', base_price: 1800 },
  { id: 'c7', name: 'Mung Bean', name_ur: 'مونگ', category: 'Pulses', base_price: 12000 },
  { id: 'c8', name: 'Cotton', name_ur: 'کپاس', category: 'Cash Crops', base_price: 8500 },
];

export const MARKETS_SEED: Market[] = [
  { id: 'm1', name: 'Zaitoon Wholesale Mandi', district: 'Hyderabad' },
  { id: 'm2', name: 'Rohri Demo Mandi', district: 'Sukkur' },
  { id: 'm3', name: 'Larkana Sample Mandi', district: 'Larkana' },
];

export const USERS_SEED: User[] = [
  { id: 'u1', name: 'Ali Demo', phone: '03000000001', district: 'Sukkur', role: 'Farmer', created_at: '2026-10-01T08:00:00Z' },
  { id: 'u2', name: 'Sana Sample', phone: '03000000002', district: 'Hyderabad', role: 'Buyer', created_at: '2026-10-02T08:00:00Z' },
  { id: 'u3', name: 'Bilal Test', phone: '03000000003', district: 'Larkana', role: 'Farmer', created_at: '2026-10-03T08:00:00Z' },
  { id: 'u4', name: 'Hina Example', phone: '03000000004', district: 'Hyderabad', role: 'Farmer', created_at: '2026-10-04T08:00:00Z' },
  { id: 'u5', name: 'Imran Sample', phone: '03000000005', district: 'Karachi', role: 'Buyer', created_at: '2026-10-05T08:00:00Z' },
  { id: 'u6', name: 'Zainab Demo', phone: '03000000006', district: 'Nawabshah', role: 'Farmer', created_at: '2026-10-06T08:00:00Z' },
];

export function generateSeedData(): SeedData {
  // Generate 14 days of prices ending at today
  const today = new Date();
  const dateStrings: string[] = [];
  for (let d = 13; d >= 0; d--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    dateStrings.push(dt.toISOString().split('T')[0]);
  }

  const prices: PriceRecord[] = [];
  let priceCounter = 1;

  for (let cropIndex = 0; cropIndex < CROPS_SEED.length; cropIndex++) {
    const crop = CROPS_SEED[cropIndex];
    for (let marketIndex = 0; marketIndex < MARKETS_SEED.length; marketIndex++) {
      const market = MARKETS_SEED[marketIndex];
      for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
        const rawPrice =
          crop.base_price *
          (1 +
            0.04 * Math.sin(dayIndex * 0.9 + cropIndex) +
            0.02 * marketIndex -
            0.005 * dayIndex);
        const roundedPrice = Math.round(rawPrice / 10) * 10;
        prices.push({
          id: `p${priceCounter++}`,
          crop_id: crop.id,
          market_id: market.id,
          date: dateStrings[dayIndex],
          price: roundedPrice,
        });
      }
    }
  }

  // Calculate today's average market price for each crop
  const todayDate = dateStrings[13];
  const cropTodayAvg: Record<string, number> = {};
  for (const crop of CROPS_SEED) {
    const todayPrices = prices.filter(
      (p) => p.crop_id === crop.id && p.date === todayDate
    );
    const avg = todayPrices.reduce((sum, p) => sum + p.price, 0) / (todayPrices.length || 1);
    cropTodayAvg[crop.id] = Math.round(avg);
  }

  // Helper to format date offset from today
  const offsetDate = (days: number): string => {
    const dt = new Date(today);
    dt.setDate(today.getDate() + days);
    return dt.toISOString().split('T')[0];
  };

  // 12 Listings: Cover all 8 crops, grades A/B/C, owners u1, u3, u4, u6.
  // 3 sold, 9 active.
  // 4 at average * 1.10, 4 at average * 1.00, 4 at average * 0.90
  const listings: Listing[] = [
    {
      id: 'l1',
      user_id: 'u1',
      crop_id: 'c1', // Wheat
      quantity: 50,
      asking_price: Math.round((cropTodayAvg['c1'] * 1.1) / 10) * 10,
      district: 'Sukkur',
      grade: 'A',
      available_from: offsetDate(4),
      status: 'active',
      contact_phone: '03000000001',
      created_at: '2026-10-10T09:00:00Z',
      updated_at: '2026-10-10T09:00:00Z',
    },
    {
      id: 'l2',
      user_id: 'u3',
      crop_id: 'c2', // Basmati Rice
      quantity: 40,
      asking_price: Math.round((cropTodayAvg['c2'] * 1.1) / 10) * 10,
      district: 'Larkana',
      grade: 'A',
      available_from: offsetDate(6),
      status: 'active',
      contact_phone: '03000000003',
      created_at: '2026-10-11T10:00:00Z',
      updated_at: '2026-10-11T10:00:00Z',
    },
    {
      id: 'l3',
      user_id: 'u4',
      crop_id: 'c3', // Onion
      quantity: 80,
      asking_price: Math.round((cropTodayAvg['c3'] * 1.1) / 10) * 10,
      district: 'Hyderabad',
      grade: 'B',
      available_from: offsetDate(5),
      status: 'active',
      contact_phone: '03000000004',
      created_at: '2026-10-12T11:00:00Z',
      updated_at: '2026-10-12T11:00:00Z',
    },
    {
      id: 'l4',
      user_id: 'u6',
      crop_id: 'c4', // Tomato
      quantity: 60,
      asking_price: Math.round((cropTodayAvg['c4'] * 1.1) / 10) * 10,
      district: 'Nawabshah',
      grade: 'B',
      available_from: offsetDate(3),
      status: 'sold', // 1st sold
      contact_phone: '03000000006',
      created_at: '2026-10-09T08:00:00Z',
      updated_at: '2026-10-15T12:00:00Z',
    },
    {
      id: 'l5',
      user_id: 'u1',
      crop_id: 'c5', // Mango
      quantity: 35,
      asking_price: Math.round((cropTodayAvg['c5'] * 1.0) / 10) * 10,
      district: 'Sukkur',
      grade: 'A',
      available_from: offsetDate(8),
      status: 'active',
      contact_phone: '03000000001',
      created_at: '2026-10-13T14:00:00Z',
      updated_at: '2026-10-13T14:00:00Z',
    },
    {
      id: 'l6',
      user_id: 'u3',
      crop_id: 'c6', // Banana
      quantity: 120,
      asking_price: Math.round((cropTodayAvg['c6'] * 1.0) / 10) * 10,
      district: 'Khairpur',
      grade: 'C',
      available_from: offsetDate(7),
      status: 'active',
      contact_phone: '03000000003',
      created_at: '2026-10-14T09:30:00Z',
      updated_at: '2026-10-14T09:30:00Z',
    },
    {
      id: 'l7',
      user_id: 'u4',
      crop_id: 'c7', // Mung Bean
      quantity: 25,
      asking_price: Math.round((cropTodayAvg['c7'] * 1.0) / 10) * 10,
      district: 'Hyderabad',
      grade: 'B',
      available_from: offsetDate(12),
      status: 'sold', // 2nd sold
      contact_phone: '03000000004',
      created_at: '2026-10-08T07:00:00Z',
      updated_at: '2026-10-14T11:00:00Z',
    },
    {
      id: 'l8',
      user_id: 'u6',
      crop_id: 'c8', // Cotton
      quantity: 75,
      asking_price: Math.round((cropTodayAvg['c8'] * 1.0) / 10) * 10,
      district: 'Nawabshah',
      grade: 'A',
      available_from: offsetDate(15),
      status: 'active',
      contact_phone: '03000000006',
      created_at: '2026-10-15T10:15:00Z',
      updated_at: '2026-10-15T10:15:00Z',
    },
    {
      id: 'l9',
      user_id: 'u1',
      crop_id: 'c2', // Basmati Rice
      quantity: 90,
      asking_price: Math.round((cropTodayAvg['c2'] * 0.9) / 10) * 10,
      district: 'Sukkur',
      grade: 'C',
      available_from: offsetDate(10),
      status: 'active',
      contact_phone: '03000000001',
      created_at: '2026-10-15T16:00:00Z',
      updated_at: '2026-10-15T16:00:00Z',
    },
    {
      id: 'l10',
      user_id: 'u3',
      crop_id: 'c3', // Onion
      quantity: 110,
      asking_price: Math.round((cropTodayAvg['c3'] * 0.9) / 10) * 10,
      district: 'Larkana',
      grade: 'A',
      available_from: offsetDate(14),
      status: 'active',
      contact_phone: '03000000003',
      created_at: '2026-10-16T12:00:00Z',
      updated_at: '2026-10-16T12:00:00Z',
    },
    {
      id: 'l11',
      user_id: 'u4',
      crop_id: 'c1', // Wheat
      quantity: 150,
      asking_price: Math.round((cropTodayAvg['c1'] * 0.9) / 10) * 10,
      district: 'Hyderabad',
      grade: 'B',
      available_from: offsetDate(18),
      status: 'active',
      contact_phone: '03000000004',
      created_at: '2026-10-17T09:00:00Z',
      updated_at: '2026-10-17T09:00:00Z',
    },
    {
      id: 'l12',
      user_id: 'u6',
      crop_id: 'c4', // Tomato
      quantity: 45,
      asking_price: Math.round((cropTodayAvg['c4'] * 0.9) / 10) * 10,
      district: 'Mirpurkhas',
      grade: 'C',
      available_from: offsetDate(9),
      status: 'sold', // 3rd sold
      contact_phone: '03000000006',
      created_at: '2026-10-07T08:00:00Z',
      updated_at: '2026-10-13T10:00:00Z',
    },
  ];

  // Look up today's prices for seed alerts:
  // a1: u1, Onion (c3), Zaitoon (m1), Above, target = today's price − 100 (triggers)
  // a2: u3, Wheat (c1), Rohri (m2), Below, target = today's price + 100 (triggers)
  // a3: u4, Tomato (c4), Larkana (m3), Above, target = today's price + 500 (does not trigger)
  // a4: u6, Mango (c5), Zaitoon (m1), Below, target = today's price − 500 (does not trigger)
  // a5: u1, Cotton (c8), Rohri (m2), Above, target = today's price − 100, active_status = false
  const getTodayPrice = (cId: string, mId: string) => {
    const p = prices.find((item) => item.crop_id === cId && item.market_id === mId && item.date === todayDate);
    return p ? p.price : 3000;
  };

  const alerts: Alert[] = [
    {
      id: 'a1',
      user_id: 'u1',
      crop_id: 'c3', // Onion
      market_id: 'm1', // Zaitoon
      condition: 'Above',
      target_price: getTodayPrice('c3', 'm1') - 100,
      active_status: true,
    },
    {
      id: 'a2',
      user_id: 'u3',
      crop_id: 'c1', // Wheat
      market_id: 'm2', // Rohri
      condition: 'Below',
      target_price: getTodayPrice('c1', 'm2') + 100,
      active_status: true,
    },
    {
      id: 'a3',
      user_id: 'u4',
      crop_id: 'c4', // Tomato
      market_id: 'm3', // Larkana
      condition: 'Above',
      target_price: getTodayPrice('c4', 'm3') + 500,
      active_status: true,
    },
    {
      id: 'a4',
      user_id: 'u6',
      crop_id: 'c5', // Mango
      market_id: 'm1', // Zaitoon
      condition: 'Below',
      target_price: getTodayPrice('c5', 'm1') - 500,
      active_status: true,
    },
    {
      id: 'a5',
      user_id: 'u1',
      crop_id: 'c8', // Cotton
      market_id: 'm2', // Rohri
      condition: 'Above',
      target_price: getTodayPrice('c8', 'm2') - 100,
      active_status: false,
    },
  ];

  return {
    users: [...USERS_SEED],
    crops: CROPS_SEED.map(({ base_price, ...c }) => c),
    markets: [...MARKETS_SEED],
    prices,
    listings,
    alerts,
  };
}
