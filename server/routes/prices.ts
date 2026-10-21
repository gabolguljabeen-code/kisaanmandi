import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.ts';
import {
  getTodayPrices,
  getPriceStats,
  compareMarketsForCrop,
  getMarketInsight,
} from '../services/pricing.ts';
import { AppError } from '../middleware/errors.ts';

export const pricesRouter = Router();

// GET /api/prices?marketId=&cropId=&days=14
pricesRouter.get('/prices', (req: Request, res: Response, next: NextFunction) => {
  const cropId = req.query.cropId as string;
  const marketId = (req.query.marketId as string) || db.markets[0]?.id;
  let days = parseInt((req.query.days as string) || '14', 10);
  if (isNaN(days) || days <= 0) days = 14;
  if (days > 60) days = 60;

  if (!cropId) {
    return next(new AppError(400, 'bad_request', 'cropId query parameter is required.', 'فصل کی شناختی تفصیل درکار ہے۔'));
  }

  const allDates = Array.from(new Set(db.prices.map((p) => p.date))).sort();
  const selectedDates = allDates.slice(-days);

  const filtered = db.prices
    .filter((p) => p.crop_id === cropId && p.market_id === marketId && selectedDates.includes(p.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  return res.json(filtered);
});

// GET /api/prices/today?marketId=&category=
pricesRouter.get('/prices/today', (req: Request, res: Response) => {
  const marketId = (req.query.marketId as string) || db.markets[0]?.id;
  const category = req.query.category as string;
  const data = getTodayPrices(marketId, category);
  return res.json(data);
});

// GET /api/prices/stats?marketId=&cropId=&days=14
pricesRouter.get('/prices/stats', (req: Request, res: Response, next: NextFunction) => {
  const cropId = req.query.cropId as string;
  const marketId = (req.query.marketId as string) || db.markets[0]?.id;
  let days = parseInt((req.query.days as string) || '14', 10);
  if (isNaN(days) || days <= 0) days = 14;
  if (days > 60) days = 60;

  if (!cropId) {
    return next(new AppError(400, 'bad_request', 'cropId query parameter is required.', 'فصل کی شناختی تفصیل درکار ہے۔'));
  }

  const stats = getPriceStats(cropId, marketId, days);
  return res.json(stats);
});

// GET /api/prices/compare?cropId=
pricesRouter.get('/prices/compare', (req: Request, res: Response, next: NextFunction) => {
  const cropId = req.query.cropId as string;
  if (!cropId) {
    return next(new AppError(400, 'bad_request', 'cropId query parameter is required.', 'فصل کی شناختی تفصیل درکار ہے۔'));
  }

  const comparison = compareMarketsForCrop(cropId);
  // Return comparison array as well as object if needed
  return res.json(comparison.markets);
});

// GET /api/prices/insight?marketId=
pricesRouter.get('/prices/insight', (req: Request, res: Response) => {
  const marketId = (req.query.marketId as string) || db.markets[0]?.id;
  const insight = getMarketInsight(marketId);
  return res.json(insight);
});
