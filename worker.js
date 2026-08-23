// Cloudflare Workers entry point.
// Static files in ./public are served straight from the assets binding
// (see wrangler.jsonc); everything under /api/* lands here. Written with
// web-standard APIs only — no Express, no multer, no Puppeteer.

import { normalizeReport } from './lib/normalize.js';
import { lookupHash, lookupUrl, scanBuffer, getUrlId } from './lib/vt-api.js';

const MAX_FILE_BYTES = 32 * 1024 * 1024;

// VT free tier allows ~4 requests/minute — queue instead of failing
class Throttle {
  constructor(max, windowMs) {
    this.max = max;
    this.windowMs = windowMs;
    this.hits = [];
  }
  async acquire() {
    for (;;) {
      const now = Date.now();
      this.hits = this.hits.filter((t) => now - t < this.windowMs);
      if (this.hits.length < this.max) {
        this.hits.push(now);
        return;
      }
      const wait = this.windowMs - (now - this.hits[0]) + 50;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
const throttle = new Throttle(4, 60000);

// per-isolate memo: resets on redeploy/idle eviction but absorbs repeat
// lookups within a warm isolate's lifetime for free
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;
function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.data;
  if (hit) cache.delete(key);
  return null;
}
function cacheSet(key, data) {
  cache.set(key, { at: Date.now(), data });
}

async function sha256Hex(data) {
  const view = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return Array.from(view, (b) => b.toString(16).padStart(2, '0')).join('');
}

const HASH_RE = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;

async function engineLookupHash(hash, apiKey) {
  try {
    await throttle.acquire();
    return { ok: true, json: await lookupHash(hash, apiKey) };
  } catch (e) {
    // normalize "VT doesn't know this target yet" so callers can branch
    // on .notFound instead of parsing error messages
    if (e.status === 404) {
      return { ok: false, notFound: true, error: 'Not found on VirusTotal. It has never been submitted before.' };
    }
    throw e;
  }
}

export default {
  async fetch(request, env) {
    const apiKey = env.VT_API_KEY;
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (!apiKey) {
        return Response.json(
          { ok: false, error: 'Server is missing the VT_API_KEY secret. Run: wrangler secret put VT_API_KEY' },
          { status: 500 }
        );
      }

      try {
        if (url.pathname === '/api/health' && request.method === 'GET') {
          return Response.json({ ok: true, engine: 'official', keyConfigured: true });
        }

        if (url.pathname === '/api/check/url' && request.method === 'POST') {
          const body = await request.json().catch(() => null);
          const raw = String(body?.url || '').trim();
          if (!raw) return Response.json({ ok: false, error: 'URL is required.' }, { status: 400 });

          let target = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `http://${raw}`;
          try {
            const parsed = new URL(target);
            if (!/^https?:$/.test(parsed.protocol)) throw new Error();
            target = parsed.href;
          } catch {
            return Response.json({ ok: false, error: 'Invalid URL.' }, { status: 400 });
          }

          const key = `url:${target}`;
          const cached = cacheGet(key);
          if (cached) return Response.json({ ok: true, cached: true, result: cached });

          await throttle.acquire();
          const json = await lookupUrl(target, apiKey);
          const result = normalizeReport(json, { type: 'url', target, urlId: getUrlId(target) });
          cacheSet(key, result);
          return Response.json({ ok: true, result });
        }

        if (url.pathname === '/api/check/hash' && request.method === 'POST') {
          const body = await request.json().catch(() => null);
          const hash = String(body?.hash || '').trim().toLowerCase();
          if (!HASH_RE.test(hash)) {
            return Response.json({ ok: false, error: 'Invalid hash. Use MD5, SHA-1 or SHA-256.' }, { status: 400 });
          }

          const key = `hash:${hash}`;
          const cached = cacheGet(key);
          if (cached) return Response.json({ ok: true, cached: true, result: cached });

          const out = await engineLookupHash(hash, apiKey);
          if (!out.ok) {
            return Response.json({ ok: false, code: 'NOT_FOUND', error: out.error }, { status: 404 });
          }
          const result = normalizeReport(out.json, { type: 'file', target: hash });
          cacheSet(key, result);
          return Response.json({ ok: true, result });
        }

        if (url.pathname === '/api/check/file' && request.method === 'POST') {
          const form = await request.formData();
          const file = form.get('file');
          if (!(file instanceof File)) {
            return Response.json({ ok: false, error: 'No file received.' }, { status: 400 });
          }
          if (file.size > MAX_FILE_BYTES) {
            return Response.json(
              { ok: false, code: 'FILE_TOO_LARGE', error: 'File exceeds the 32 MB limit.' },
              { status: 413 }
            );
          }

          const digest = await sha256Hex(await file.arrayBuffer());

          // hash first: if VT already knows the file it never gets uploaded
          let out = await engineLookupHash(digest, apiKey);
          if (!out.ok && !out.notFound) {
            return Response.json({ ok: false, error: out.error }, { status: 502 });
          }
          if (!out.ok) {
            console.log(`[noisy-virus] ${digest} not on VT yet — uploading ${file.name} (${file.size} bytes)`);
            out = { ok: true, json: await scanBuffer(await file.arrayBuffer(), file.name, apiKey) };
          }

          const result = normalizeReport(out.json, { type: 'file', target: digest });
          cacheSet(`hash:${digest}`, result);
          return Response.json({ ok: true, uploaded: Boolean(result.details.sha256 !== digest), result });
        }

        return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });
      } catch (e) {
        console.error(e);
        return Response.json({ ok: false, error: e.message || 'Unexpected server error.' }, { status: 502 });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
