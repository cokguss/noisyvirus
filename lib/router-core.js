// Runtime-agnostic /api handlers shared by Vercel Edge functions, the
// Cloudflare Worker (worker.js), and the local dev server. Web-standard
// in, Response out — no server-side waiting anywhere: VT analyses are
// resolved by the client polling these same endpoints.

import { normalizeReport } from './normalize.js';
import { lookupHash, getUrlReport, submitUrl, getUrlId } from './vt-api.js';

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

export function healthResponse(apiKey) {
  return Response.json({ ok: true, engine: 'official', keyConfigured: Boolean(apiKey) });
}

export async function checkHash(request, apiKey) {
  const body = await request.json().catch(() => null);
  const hash = String(body?.hash || '').trim().toLowerCase();
  if (!HASH_RE.test(hash)) {
    return Response.json({ ok: false, error: 'Invalid hash. Use MD5, SHA-1 or SHA-256.' }, { status: 400 });
  }

  const key = `hash:${hash}`;
  const cached = cacheGet(key);
  if (cached) return Response.json({ ok: true, cached: true, result: cached });

  let json;
  try {
    await throttle.acquire();
    json = await lookupHash(hash, apiKey);
  } catch (e) {
    // normalize "VT doesn't know this target yet" so callers can branch
    // on it instead of parsing error messages
    if (e.status === 404) {
      return Response.json(
        { ok: false, code: 'NOT_FOUND', error: 'Not found on VirusTotal. It has never been submitted before.' },
        { status: 404 }
      );
    }
    console.error(e);
    return Response.json({ ok: false, error: e.message || 'VirusTotal lookup failed.' }, { status: 502 });
  }

  const result = normalizeReport(json, { type: 'file', target: hash });
  cacheSet(key, result);
  return Response.json({ ok: true, result });
}

export async function checkUrl(request, apiKey) {
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

  try {
    await throttle.acquire();
    const json = await getUrlReport(target, apiKey);
    const result = normalizeReport(json, { type: 'url', target, urlId: getUrlId(target) });
    cacheSet(key, result);
    return Response.json({ ok: true, result });
  } catch (e) {
    if (e.status !== 404) {
      console.error(e);
      return Response.json({ ok: false, error: e.message || 'VirusTotal lookup failed.' }, { status: 502 });
    }
    // unknown to VT — ask for an analysis and answer fast; the report lands
    // under the same lookup seconds later and the client keeps polling
    try {
      await submitUrl(target, apiKey);
      return Response.json({ ok: true, pending: true });
    } catch (e2) {
      console.error(e2);
      return Response.json({ ok: false, error: e2.message || 'Failed to submit URL to VirusTotal.' }, { status: 502 });
    }
  }
}

export async function handleApi(pathname, request, apiKey) {
  if (!pathname.startsWith('/api/')) {
    return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });
  }
  if (!apiKey && pathname !== '/api/health') {
    return Response.json(
      { ok: false, error: 'Server is missing the VT_API_KEY environment variable.' },
      { status: 500 }
    );
  }

  if (pathname === '/api/health' && request.method === 'GET') return healthResponse(apiKey);
  if (pathname === '/api/check/url' && request.method === 'POST') return checkUrl(request, apiKey);
  if (pathname === '/api/check/hash' && request.method === 'POST') return checkHash(request, apiKey);

  return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });
}
