import express from 'express';
import { healthRouter } from './routes/health.ts';
import { adminRouter } from './routes/admin.ts';
import { usersRouter } from './routes/users.ts';
import { catalogRouter } from './routes/catalog.ts';
import { pricesRouter } from './routes/prices.ts';
import { listingsRouter } from './routes/listings.ts';
import { alertsRouter } from './routes/alerts.ts';
import { profitRouter } from './routes/profit.ts';
import { errorHandler } from './middleware/errors.ts';
import { dbMiddleware } from './db.ts';

export function createApp() {
const app = express();
app.use(express.json());
app.use('/api', dbMiddleware);

  // API Routes
  app.use('/api', healthRouter);
  app.use('/api', adminRouter);
  app.use('/api', usersRouter);
  app.use('/api', catalogRouter);
  app.use('/api', pricesRouter);
  app.use('/api', listingsRouter);
  app.use('/api', alertsRouter);
  app.use('/api', profitRouter);

  // Unknown API routes fallback
  app.all('/api/*', (_req, res) => {
    res.status(404).json({
      error: {
        code: 'not_found',
        message_en: 'API endpoint not found.',
        message_ur: 'درخواست کردہ پتہ دستیاب نہیں ہے۔',
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
