// Vercel serverless entry point: handles /api and rewritten /api/* requests
import { createApp } from '../server/app.ts';

const app = createApp();

export default (req: any, res: any) => {
  // Extract real path from Vercel headers if rewritten to /api
  const forwardedUrl = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (forwardedUrl && typeof forwardedUrl === 'string' && forwardedUrl.startsWith('/api')) {
    req.url = forwardedUrl;
  } else if (req.query?.slug) {
    const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    const searchIndex = req.url.indexOf('?');
    const queryString = searchIndex !== -1 ? req.url.slice(searchIndex) : '';
    req.url = `/api/${slug}${queryString}`;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
};
