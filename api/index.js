// Catch-all Vercel Function for the small JSON endpoints
// (/api/health, /api/check/url, /api/check/hash). Uploads take a separate
// streaming route (see api/upload.js). Uses the Web Request/Response API.
import { handleApi } from '../lib/router-core.js';

export default async function handler(request) {
  const pathname = new URL(request.url).pathname;
  return handleApi(pathname, request, process.env.VT_API_KEY);
}
