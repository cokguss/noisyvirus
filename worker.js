// Cloudflare Workers entry point (optional alternative host — the primary
// deployment target is Vercel). Static files in ./public are served from
// the assets binding; everything under /api/* shares lib/router-core.js.
// Written with web-standard APIs only.

import { handleApi } from './lib/router-core.js';
import { relayUpload } from './lib/upload-relay.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/check/file') {
      try {
        return await relayUpload(request, env.VT_API_KEY);
      } catch (e) {
        console.error(e);
        return Response.json({ ok: false, error: e.message || 'Unexpected server error.' }, { status: 502 });
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return handleApi(url.pathname, request, env.VT_API_KEY);
    }

    return env.ASSETS.fetch(request);
  }
};
