import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { normalizeReport } from './lib/normalize.js';
import * as official from './lib/vt-api.js';
import { scrapeHash, scrapeUrl, scrapeUploadFile, closeBrowser, resolveExecutablePathSafe } from './lib/vt-scraper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }
});

const engine = process.env.VT_API_KEY ? 'official' : 'scraper';
const urlIdOf = (u) => Buffer.from(u).toString('base64').replace(/=+$/, '');

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

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

const HASH_RE = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;

async function engineLookupHash(hash) {
  if (engine === 'official') {
    await throttle.acquire();
    return { ok: true, json: await official.lookupHash(hash) };
  }
  return scrapeHash(hash);
}

async function engineLookupUrl(url) {
  if (engine === 'official') {
    await throttle.acquire();
    return { ok: true, json: await official.lookupUrl(url) };
  }
  return scrapeUrl(url, urlIdOf(url));
}

async function engineScanFile(buffer, filename) {
  if (engine === 'official') {
    await throttle.acquire();
    return { ok: true, json: await official.scanBuffer(buffer, filename) };
  }

  const tmpPath = path.join(os.tmpdir(), `noisy-virus-${Date.now()}-${filename.replace(/[^\w.\-]/g, '_')}`);
  fs.writeFileSync(tmpPath, buffer);
  try {
    return await scrapeUploadFile(tmpPath);
  } finally {
    fs.promises.unlink(tmpPath).catch(() => {});
  }
}

app.use(express.json());
// HTML must always revalidate so phones never serve a stale page that points at old asset versions
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html')) res.set('Cache-Control', 'no-cache');
  next();
});
// temporary request log to diagnose which files the browser actually fetches
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    engine,
    keyConfigured: Boolean(process.env.VT_API_KEY),
    browserReady: engine === 'official' || Boolean(resolveExecutablePathSafe())
  });
});

app.post('/api/check/url', async (req, res) => {
  const raw = String(req.body?.url || '').trim();
  if (!raw) return res.status(400).json({ ok: false, error: 'URL is required.' });

  let target = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `http://${raw}`;
  try {
    const parsed = new URL(target);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error();
    target = parsed.href;
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid URL.' });
  }

  const key = `url:${target}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ ok: true, cached: true, result: cached });

  try {
    const out = await engineLookupUrl(target);
    if (!out.ok) return res.status(404).json({ ok: false, error: out.error });
    const result = normalizeReport(out.json, { type: 'url', target, urlId: urlIdOf(target) });
    cacheSet(key, result);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

app.post('/api/check/hash', async (req, res) => {
  const hash = String(req.body?.hash || '').trim().toLowerCase();
  if (!HASH_RE.test(hash)) {
    return res.status(400).json({ ok: false, error: 'Invalid hash. Use MD5, SHA-1 or SHA-256.' });
  }

  const key = `hash:${hash}`;
  const cached = cacheGet(key);
  if (cached) return res.json({ ok: true, cached: true, result: cached });

  try {
    const out = await engineLookupHash(hash);
    if (!out.ok) return res.status(404).json({ ok: false, error: out.error });
    const result = normalizeReport(out.json, { type: 'file', target: hash });
    cacheSet(key, result);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

app.post('/api/check/file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file received.' });

  const filename = req.file.originalname || 'sample';
  const digest = sha256(req.file.buffer);

  try {
    let out = await engineLookupHash(digest);

    if (!out.ok && !out.notFound) {
      return res.status(502).json({ ok: false, error: out.error });
    }

    if (!out.ok) {
      console.log(`[noisy-virus] ${digest} not on VT yet — uploading ${filename} (${req.file.size} bytes)`);
      out = await engineScanFile(req.file.buffer, filename);
      if (!out.ok) return res.status(502).json({ ok: false, error: out.error });
    }

    const result = normalizeReport(out.json, { type: 'file', target: digest });
    cacheSet(`hash:${digest}`, result);
    res.json({ ok: true, uploaded: Boolean(result.details.sha256 !== digest), result });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  NOISY VIRUS — threat scanner online');
  console.log(`  Engine   : ${engine}${engine === 'official' ? ' (VT API key detected)' : ' (GUI scraper, no key)'}`);
  console.log(`  Browser  : ${resolveExecutablePathSafe() || 'NOT FOUND — set CHROME_PATH'}`);
  console.log(`  Local    : http://localhost:${PORT}`);
  console.log('');
});

process.on('SIGINT', async () => {
  await closeBrowser().catch(() => {});
  process.exit(0);
});
