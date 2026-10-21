import { startServer } from './server/index.ts';

startServer().catch((err) => {
  console.error('[KisanMandi] Fatal server startup error:', err);
  process.exit(1);
});
