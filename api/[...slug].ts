// Vercel serverless entry point: every /api/* request is handled by the Express app.
import { createApp } from '../server/app.ts';

const app = createApp();

export default app;
