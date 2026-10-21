import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.ts';
import { ListingCreateSchema, ListingUpdateSchema } from '../../shared/schemas.ts';
import { requireAuth, requireFarmer } from '../middleware/auth.ts';
import { AppError, notFoundError, notOwnerError } from '../middleware/errors.ts';
import { calculateAverageMarketPrice, getPriceLabel } from '../services/pricing.ts';
import { Listing, District, Grade } from '../../shared/types.ts';

export const listingsRouter = Router();

function enrichListing(l: Listing): Listing {
  const user = db.getUser(l.user_id);
  const crop = db.getCrop(l.crop_id);
  const avg = calculateAverageMarketPrice(l.crop_id);
  const label = getPriceLabel(l.asking_price, l.crop_id);

  return {
    ...l,
    seller_name: user?.name || 'Sindh Farmer',
    crop_name: crop?.name || 'Crop',
    crop_name_ur: crop?.name_ur || 'فصل',
    average_market_price: avg,
    price_label: label,
  };
}

// GET /api/listings
listingsRouter.get('/listings', (req: Request, res: Response) => {
  const cropId = req.query.cropId as string;
  const district = req.query.district as string;
  const grade = req.query.grade as string;
  const sort = (req.query.sort as string) || 'newest';
  const status = (req.query.status as string) || 'active';
  const userId = req.query.userId as string;

  let results = db.listings;

  if (status && status !== 'all') {
    results = results.filter((l) => l.status === status);
  }
  if (userId) {
    results = results.filter((l) => l.user_id === userId);
  }
  if (cropId) {
    results = results.filter((l) => l.crop_id === cropId);
  }
  if (district) {
    results = results.filter((l) => l.district === district);
  }
  if (grade) {
    results = results.filter((l) => l.grade === grade);
  }

  const enriched = results.map(enrichListing);

  if (sort === 'price_asc') {
    enriched.sort((a, b) => a.asking_price - b.asking_price);
  } else {
    // newest default
    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return res.json(enriched);
});

// GET /api/listings/:id
listingsRouter.get('/listings/:id', (req: Request, res: Response, next: NextFunction) => {
  const listing = db.listings.find((l) => l.id === req.params.id);
  if (!listing) {
    return next(notFoundError('Listing', 'فصل کا اندراج'));
  }
  return res.json(enrichListing(listing));
});

// POST /api/listings (Farmer only)
listingsRouter.post('/listings', requireFarmer, (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = ListingCreateSchema.parse(req.body);

    const crop = db.getCrop(data.crop_id);
    if (!crop) {
      return next(new AppError(400, 'bad_request', 'Invalid crop selected.', 'منتخب کردہ فصل درست نہیں ہے۔'));
    }

    const newListing: Listing = {
      id: `l_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: req.user!.id,
      crop_id: data.crop_id,
      quantity: data.quantity,
      asking_price: data.asking_price,
      district: data.district as District,
      grade: data.grade as Grade,
      available_from: data.available_from,
      status: 'active',
      contact_phone: data.contact_phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.listings.unshift(newListing);
    db.save();

    return res.status(201).json(enrichListing(newListing));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/listings/:id (Owner only)
listingsRouter.patch('/listings/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) {
      return next(notFoundError('Listing', 'فصل کا اندراج'));
    }

    if (listing.user_id !== req.user!.id) {
      return next(notOwnerError());
    }

    const data = ListingUpdateSchema.parse(req.body);

    if (data.crop_id) listing.crop_id = data.crop_id;
    if (data.quantity !== undefined) listing.quantity = data.quantity;
    if (data.asking_price !== undefined) listing.asking_price = data.asking_price;
    if (data.district) listing.district = data.district as District;
    if (data.grade) listing.grade = data.grade as Grade;
    if (data.available_from) listing.available_from = data.available_from;
    if (data.status) listing.status = data.status;
    if (data.contact_phone) listing.contact_phone = data.contact_phone;
    listing.updated_at = new Date().toISOString();

    db.save();
    return res.json(enrichListing(listing));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/listings/:id (Owner only)
listingsRouter.delete('/listings/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  const idx = db.listings.findIndex((l) => l.id === req.params.id);
  if (idx === -1) {
    return next(notFoundError('Listing', 'فصل کا اندراج'));
  }

  if (db.listings[idx].user_id !== req.user!.id) {
    return next(notOwnerError());
  }

  db.listings.splice(idx, 1);
  db.save();
  return res.status(204).send();
});
