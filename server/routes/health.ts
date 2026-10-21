import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    counts: {
      users: db.users.length,
      crops: db.crops.length,
      markets: db.markets.length,
      prices: db.prices.length,
      listings: db.listings.length,
      alerts: db.alerts.length,
    },
  });
});
