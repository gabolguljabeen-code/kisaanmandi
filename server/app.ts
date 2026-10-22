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

  // Database middleware runs before API routes
  app.use('/api', dbMiddleware);
  app.use(dbMiddleware);

  const routers = [
    healthRouter,
    adminRouter,
    usersRouter,
    catalogRouter,
    pricesRouter,
    listingsRouter,
    alertsRouter,
    profitRouter,
  ];

  // Mount API routers under /api as well as root so both /api/... and stripped /... work seamlessly
  for (const router of routers) {
    app.use('/api', router);
    app.use(router);
  }

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
