import { Request, Response, NextFunction } from 'express';
import { db } from '../db.ts';
import { User } from '../../shared/types.ts';
import { unauthorizedError, forbiddenRoleError } from './errors.ts';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'];
  if (!userId || typeof userId !== 'string') {
    return next(unauthorizedError());
  }

  const user = db.getUser(userId);
  if (!user) {
    return next(unauthorizedError());
  }

  req.user = user;
  next();
}

export function requireFarmer(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user?.role !== 'Farmer') {
      return next(forbiddenRoleError());
    }
    next();
  });
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'];
  if (userId && typeof userId === 'string') {
    req.user = db.getUser(userId);
  }
  next();
}
