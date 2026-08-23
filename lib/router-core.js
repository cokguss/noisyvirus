// Runtime-agnostic /api router shared by the Cloudflare Worker (worker.js)
// and the Vercel functions (api/index.js). Web-standard in, Response out.
// The streaming upload leg lives separately in lib/upload-relay.js.

import { normalizeReport } from './normalize.js';
import { lookupHash, lookupUrl, getUrlId } from './vt-api.js';

const HASH_RE = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;

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

// per-instance memo: absorbs repeat lookups within a warm instance's lifetime
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

export async function handleApi(pathname, request, apiKey) {
  try {
    if (pathname === '/api/health' && request.method === 'GET') {
      return Response.json({ ok: true, engine: 'official', keyConfigured: Boolean(apiKey) });
    }

    if (!apiKey) {
      return Response.json(
        { ok: false, error: 'Server is missing the VT_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    if (pathname === '/api/check/url' && request.method === 'POST') {
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

    if (pathname === '/api/check/hash' && request.method === 'POST') {
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

    return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: e.message || 'Unexpected server error.' }, { status: 502 });
  }
}
