import { Request, Response, NextFunction } from 'express';
import { db } from '../db.ts';
import { User } from '../../shared/types.ts';
import { forbiddenRoleError } from './errors.ts';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const userId =
    (req.headers['x-user-id'] as string) ||
    (req.headers['X-User-Id'] as string) ||
    (req.query.userId as string) ||
    req.body?.user_id ||
    'u1';

  let user = db.getUser(userId);
  if (!user) {
    user = {
      id: userId,
      name: 'Sindh Farmer',
      phone: '03000000001',
      district: 'Sukkur',
      role: 'Farmer',
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    db.save();
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
  const userId =
    (req.headers['x-user-id'] as string) ||
    (req.headers['X-User-Id'] as string) ||
    (req.query.userId as string);
  if (userId) {
    req.user = db.getUser(userId);
  }
  next();
}
