import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Crop, Market, PriceRecord, Listing, Alert } from '../shared/types.ts';
import { generateSeedData, SeedData } from './seed.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

class Database {
  users: User[] = [];
  crops: Crop[] = [];
  markets: Market[] = [];
  prices: PriceRecord[] = [];
  listings: Listing[] = [];
  alerts: Alert[] = [];

  constructor() {
    this.init();
  }

  init() {
    const shouldReset = process.env.SEED_RESET === 'true';
    if (!shouldReset && fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data: SeedData = JSON.parse(raw);
        this.users = data.users || [];
        this.crops = data.crops || [];
        this.markets = data.markets || [];
        this.prices = data.prices || [];
        this.listings = data.listings || [];
        this.alerts = data.alerts || [];
        return;
      } catch (e) {
        console.error('Failed to load data.json, regenerating seed...', e);
      }
    }
    this.reset();
  }

  reset() {
    const seed = generateSeedData();
    this.users = seed.users;
    this.crops = seed.crops;
    this.markets = seed.markets;
    this.prices = seed.prices;
    this.listings = seed.listings;
    this.alerts = seed.alerts;
    this.save();
  }

  save() {
    try {
      const data: SeedData = {
        users: this.users,
        crops: this.crops,
        markets: this.markets,
        prices: this.prices,
        listings: this.listings,
        alerts: this.alerts,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data.json:', e);
    }
  }

  // Lookup helpers
  getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByPhone(phone: string): User | undefined {
    return this.users.find((u) => u.phone === phone);
  }

  getCrop(id: string): Crop | undefined {
    return this.crops.find((c) => c.id === id);
  }

  getMarket(id: string): Market | undefined {
    return this.markets.find((m) => m.id === id);
  }
}

export const db = new Database();
