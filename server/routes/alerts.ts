import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.ts';
import { AlertCreateSchema, AlertUpdateSchema } from '../../shared/schemas.ts';
import { requireFarmer } from '../middleware/auth.ts';
import { notFoundError, notOwnerError } from '../middleware/errors.ts';
import { isAlertTriggered } from '../services/alerts.ts';
import { getTodayDate } from '../services/pricing.ts';
import { Alert } from '../../shared/types.ts';

export const alertsRouter = Router();

function enrichAlert(a: Alert): Alert {
  const crop = db.getCrop(a.crop_id);
  const market = db.getMarket(a.market_id);
  const todayDate = getTodayDate();

  const priceRecord = db.prices.find(
    (p) => p.crop_id === a.crop_id && p.market_id === a.market_id && p.date === todayDate
  );
  const latestPrice = priceRecord ? priceRecord.price : 0;
  const triggered = isAlertTriggered(a.condition, latestPrice, a.target_price, a.active_status);

  return {
    ...a,
    crop_name: crop?.name,
    crop_name_ur: crop?.name_ur,
    market_name: market?.name,
    market_district: market?.district,
    latest_price: latestPrice,
    triggered,
  };
}

// GET /api/alerts (Farmer, own alerts)
alertsRouter.get('/alerts', requireFarmer, (req: Request, res: Response) => {
  const userAlerts = db.alerts.filter((a) => a.user_id === req.user!.id);
  const enriched = userAlerts.map(enrichAlert);
  return res.json(enriched);
});

// GET /api/alerts/triggered (Farmer, triggered alerts count & items for badge)
alertsRouter.get('/alerts/triggered', requireFarmer, (req: Request, res: Response) => {
  const userAlerts = db.alerts.filter((a) => a.user_id === req.user!.id);
  const enriched = userAlerts.map(enrichAlert);
  const triggeredItems = enriched.filter((a) => a.triggered);
  return res.json({
    count: triggeredItems.length,
    items: triggeredItems,
  });
});

// POST /api/alerts (Farmer only)
alertsRouter.post('/alerts', requireFarmer, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = AlertCreateSchema.parse(req.body);

    const newAlert: Alert = {
      id: `a_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: req.user!.id,
      crop_id: data.crop_id,
      market_id: data.market_id,
      condition: data.condition,
      target_price: data.target_price,
      active_status: data.active_status !== undefined ? data.active_status : true,
    };

    db.alerts.unshift(newAlert);
    db.save();

    return res.status(201).json(enrichAlert(newAlert));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/alerts/:id (Owner only)
alertsRouter.patch('/alerts/:id', requireFarmer, (req: Request, res: Response, next: NextFunction) => {
  try {
    const alert = db.alerts.find((a) => a.id === req.params.id);
    if (!alert) {
      return next(notFoundError('Alert', 'الرٹ'));
    }

    if (alert.user_id !== req.user!.id) {
      return next(notOwnerError());
    }

    const data = AlertUpdateSchema.parse(req.body);

    if (data.crop_id) alert.crop_id = data.crop_id;
    if (data.market_id) alert.market_id = data.market_id;
    if (data.condition) alert.condition = data.condition;
    if (data.target_price !== undefined) alert.target_price = data.target_price;
    if (data.active_status !== undefined) alert.active_status = data.active_status;

    db.save();
    return res.json(enrichAlert(alert));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/alerts/:id (Owner only)
alertsRouter.delete('/alerts/:id', requireFarmer, (req: Request, res: Response, next: NextFunction) => {
  const idx = db.alerts.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return next(notFoundError('Alert', 'الرٹ'));
  }

  if (db.alerts[idx].user_id !== req.user!.id) {
    return next(notOwnerError());
  }

  db.alerts.splice(idx, 1);
  db.save();
  return res.status(204).send();
});
