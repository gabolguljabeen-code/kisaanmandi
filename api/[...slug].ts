// Vercel serverless entry point: every /api/* request is handled by the Express app.
import { createApp } from '../server/app.ts';

const app = createApp();

export default (req: any, res: any) => {
  if (req.query?.slug) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    const searchIndex = req.url.indexOf('?');
    const queryString = searchIndex !== -1 ? req.url.slice(searchIndex) : '';
    req.url = `/api/${slug}${queryString}`;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
};
