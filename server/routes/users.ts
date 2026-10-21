import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.ts';
import { UserCreateSchema, UserUpdateSchema } from '../../shared/schemas.ts';
import { requireAuth } from '../middleware/auth.ts';
import { phoneExistsError, AppError } from '../middleware/errors.ts';
import { User, District } from '../../shared/types.ts';

export const usersRouter = Router();

// POST /api/users (Signup)
usersRouter.post('/users', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = UserCreateSchema.parse(req.body);

    const existingUser = db.getUserByPhone(data.phone);
    if (existingUser) {
      return next(phoneExistsError());
    }

    const newUser: User = {
      id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      phone: data.phone,
      district: data.district as District,
      role: data.role,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);

    // If new user is a Farmer, create 2 initial alerts for demo convenience
    if (newUser.role === 'Farmer') {
      const todayDate = db.prices.length > 0 ? db.prices[db.prices.length - 1].date : '';
      const getP = (cId: string, mId: string) => {
        const p = db.prices.find((r) => r.crop_id === cId && r.market_id === mId && r.date === todayDate);
        return p ? p.price : 3000;
      };

      db.alerts.push(
        {
          id: `a1_${newUser.id}`,
          user_id: newUser.id,
          crop_id: 'c3', // Onion
          market_id: 'm1', // Zaitoon
          condition: 'Above',
          target_price: getP('c3', 'm1') - 100, // triggers
          active_status: true,
        },
        {
          id: `a2_${newUser.id}`,
          user_id: newUser.id,
          crop_id: 'c1', // Wheat
          market_id: 'm2', // Rohri
          condition: 'Below',
          target_price: getP('c1', 'm2') + 100, // triggers
          active_status: true,
        }
      );
    }

    db.save();
    return res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id (Self only)
usersRouter.get('/users/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.id !== req.params.id) {
    return next(
      new AppError(
        403,
        'not_owner',
        'You can only view your own profile.',
        'آپ صرف اپنا پروفائل دیکھ سکتے ہیں۔'
      )
    );
  }
  return res.json(req.user);
});

// PATCH /api/users/:id (Self only)
usersRouter.patch('/users/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.id !== req.params.id) {
      return next(
        new AppError(
          403,
          'not_owner',
          'You can only update your own profile.',
          'آپ صرف اپنا پروفائل تبدیل کر سکتے ہیں۔'
        )
      );
    }

    const data = UserUpdateSchema.parse(req.body);

    if (data.phone && data.phone !== req.user.phone) {
      const existing = db.getUserByPhone(data.phone);
      if (existing && existing.id !== req.user.id) {
        return next(phoneExistsError());
      }
    }

    const user = db.getUser(req.params.id);
    if (!user) {
      return next(new AppError(404, 'not_found', 'User not found.', 'صارف نہیں ملا۔'));
    }

    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.district) user.district = data.district as District;

    db.save();
    return res.json(user);
  } catch (err) {
    next(err);
  }
});
