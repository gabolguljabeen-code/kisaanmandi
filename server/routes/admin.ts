import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const adminRouter = Router();

adminRouter.post('/admin/reset', (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: {
        code: 'forbidden_role',
        message_en: 'Database reset is disabled in production environment.',
        message_ur: 'پروڈکشن میں ڈیٹا بیس دوبارہ ترتیب دینا ممکن نہیں ہے۔',
      },
    });
  }

  db.reset();
  return res.json({
    message_en: 'Database reseeded successfully with fictional demonstration data.',
    message_ur: 'ڈیٹا بیس کامیابی سے فرضی معلوماتی ڈیٹا سے دوبارہ بھر دیا گیا۔',
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
