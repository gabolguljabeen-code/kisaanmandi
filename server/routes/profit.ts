import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.ts';
import { ProfitCalcSchema } from '../../shared/schemas.ts';
import { calculateProfit } from '../services/profit.ts';
import { getTodayDate } from '../services/pricing.ts';
import { notFoundError } from '../middleware/errors.ts';

export const profitRouter = Router();

profitRouter.post('/profit', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ProfitCalcSchema.parse(req.body);

    const crop = db.getCrop(data.crop_id);
    if (!crop) {
      return next(notFoundError('Crop', 'فصل'));
    }

    const market = db.getMarket(data.market_id);
    if (!market) {
      return next(notFoundError('Market', 'منڈی'));
    }

    const todayDate = getTodayDate();
    const priceRecord = db.prices.find(
      (p) => p.crop_id === data.crop_id && p.market_id === data.market_id && p.date === todayDate
    );

    const marketPrice = priceRecord ? priceRecord.price : 3000;

    const result = calculateProfit(
      marketPrice,
      data.quantity,
      data.cost_per_maund,
      data.price_shift_percent ?? 0
    );

    return res.json(result);
  } catch (err) {
    next(err);
  }
});
