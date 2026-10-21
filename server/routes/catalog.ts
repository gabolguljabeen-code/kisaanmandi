import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const catalogRouter = Router();

catalogRouter.get('/crops', (_req: Request, res: Response) => {
  const publicCrops = db.crops.map(({ id, name, name_ur, category }) => ({
    id,
    name,
    name_ur,
    category,
  }));
  res.json(publicCrops);
});

catalogRouter.get('/markets', (_req: Request, res: Response) => {
  res.json(db.markets);
});
