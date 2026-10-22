import { z } from 'zod';
import { DISTRICTS } from './types.ts';

export const phoneRegex = /^03\d{9}$/;

export const UserCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be between 2 and 60 characters' })
    .max(60, { message: 'Name must be between 2 and 60 characters' }),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: 'Phone must be an 11-digit Pakistani number (03XXXXXXXXX)' }),
  district: z.enum(DISTRICTS),
  role: z.enum(['Farmer', 'Buyer']),
});

export const UserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  phone: z.string().trim().regex(phoneRegex).optional(),
  district: z.enum(DISTRICTS).optional(),
});

export const ListingCreateSchema = z.object({
  crop_id: z.string().min(1, { message: 'Crop is required' }),
  quantity: z.coerce.number().positive({ message: 'Quantity must be greater than 0' }),
  asking_price: z.coerce.number().positive({ message: 'Asking price must be greater than 0' }),
  district: z.enum(DISTRICTS),
  grade: z.enum(['A', 'B', 'C']),
  available_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date format must be YYYY-MM-DD' })
    .refine(
      (val) => {
        const todayStr = new Date().toISOString().split('T')[0];
        return val >= todayStr;
      },
      { message: 'Available-from date cannot be in the past' }
    ),
  contact_phone: z
    .string()
    .trim()
    .regex(phoneRegex, { message: 'Phone must be an 11-digit Pakistani number (03XXXXXXXXX)' }),
});

export const ListingUpdateSchema = z.object({
  crop_id: z.string().min(1).optional(),
  quantity: z.coerce.number().positive().optional(),
  asking_price: z.coerce.number().positive().optional(),
  district: z.enum(DISTRICTS).optional(),
  grade: z.enum(['A', 'B', 'C']).optional(),
  available_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  contact_phone: z.string().trim().regex(phoneRegex).optional(),
  status: z.enum(['active', 'sold']).optional(),
});

export const AlertCreateSchema = z.object({
  crop_id: z.string().min(1, { message: 'Crop is required' }),
  market_id: z.string().min(1, { message: 'Market is required' }),
  condition: z.enum(['Above', 'Below']),
  target_price: z.coerce.number().positive({ message: 'Target price must be greater than 0' }),
  active_status: z.boolean().optional().default(true),
});

export const AlertUpdateSchema = z.object({
  crop_id: z.string().min(1).optional(),
  market_id: z.string().min(1).optional(),
  condition: z.enum(['Above', 'Below']).optional(),
  target_price: z.coerce.number().positive().optional(),
  active_status: z.boolean().optional(),
});

export const ProfitCalcSchema = z.object({
  crop_id: z.string().min(1, { message: 'Crop is required' }),
  market_id: z.string().min(1, { message: 'Market is required' }),
  quantity: z.coerce.number().positive({ message: 'Quantity must be greater than 0' }),
  cost_per_maund: z.coerce.number().min(0, { message: 'Cost per maund must be non-negative' }),
  price_shift_percent: z.coerce
    .number()
    .int()
    .min(-20, { message: 'Shift cannot be less than -20%' })
    .max(20, { message: 'Shift cannot exceed 20%' })
    .optional()
    .default(0),
});

export const ProfitCalculateSchema = ProfitCalcSchema;
