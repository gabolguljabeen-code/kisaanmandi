import { startServer } from './server/index.ts';

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[KisanMandi] Fatal server startup error:', err);
    process.exit(1);
  });
}
