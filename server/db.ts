import { createClient } from '@libsql/client';
import type { Request, Response, NextFunction } from 'express';
import { User, Crop, Market, PriceRecord, Listing, Alert } from '../shared/types.ts';
import { generateSeedData, SeedData } from './seed.ts';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || ':memory:',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

class Database {
  users: User[] = [];
  crops: Crop[] = [];
  markets: Market[] = [];
  prices: PriceRecord[] = [];
  listings: Listing[] = [];
  alerts: Alert[] = [];

  private tableReady: Promise<unknown> | null = null;
  private firstLoad = true;
  private pendingSave: Promise<void> = Promise.resolve();

  private apply(data: SeedData) {
    this.users = data.users || [];
    this.crops = data.crops || [];
    this.markets = data.markets || [];
    this.prices = data.prices || [];
    this.listings = data.listings || [];
    this.alerts = data.alerts || [];
  }

  // Load latest data from Turso (runs before each request)
  async load() {
    try {
      if (!this.tableReady) {
        this.tableReady = client.execute(
          'CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY, data TEXT NOT NULL)'
        );
      }
      await this.tableReady;

      const forceReset = this.firstLoad && process.env.SEED_RESET === 'true';
      this.firstLoad = false;

      const res = await client.execute('SELECT data FROM app_state WHERE id = 1');
      if (res.rows.length > 0 && !forceReset) {
        try {
          this.apply(JSON.parse(String(res.rows[0].data)));
          return;
        } catch (e) {
          console.error('Bad data in Turso, reseeding...', e);
        }
      }
      this.apply(generateSeedData());
      await this.persist();
    } catch (err) {
      console.error('Error connecting to Turso, using in-memory state:', err);
      if (this.users.length === 0) {
        this.apply(generateSeedData());
      }
    }
  }

  reset() {
    this.apply(generateSeedData());
    this.save();
  }

  private async persist() {
    const data: SeedData = {
      users: this.users,
      crops: this.crops,
      markets: this.markets,
      prices: this.prices,
      listings: this.listings,
      alerts: this.alerts,
    };
    try {
      await client.execute({
        sql: 'INSERT INTO app_state (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data',
        args: [JSON.stringify(data)],
      });
    } catch (err) {
      console.error('Error persisting to Turso:', err);
    }
  }

  // Same name as before, so the rest of the app still works
  save() {
    this.pendingSave = this.pendingSave
      .then(() => this.persist())
      .catch((e) => console.error('Error saving to Turso:', e));
  }

  flush() {
    return this.pendingSave;
  }

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

// Loads data before each request and waits for saves before replying
export function dbMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalEnd = res.end.bind(res) as any;
  (res as any).end = (...args: any[]) => {
    db.flush().then(() => originalEnd(...args));
    return res;
  };
  db.load().then(() => next()).catch(next);
}
