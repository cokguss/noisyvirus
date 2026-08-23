// Local dev server with zero dependencies and zero accounts: mirrors the
// production routing (/api/* -> handlers, everything else -> static
// ./public) using the exact same modules Vercel and Workers deploy.
// Reads VT_API_KEY from .env or the environment.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { handleApi } from './lib/router-core.js';
import { relayUpload } from './lib/upload-relay.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

// minimal .env loader (no dependency): never overrides real env vars
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined && m[2] !== '') process.env[m[1]] = m[2];
  }
} catch {}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2'
};

function serveStatic(pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) return null;
  try {
    return { data: fs.readFileSync(file), type: MIME[path.extname(file)] || 'application/octet-stream' };
  } catch {
    return null;
  }
}

function toWebRequest(req) {
  const host = req.headers.host || `localhost:${process.env.PORT || 3000}`;
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  return new Request(`http://${host}${req.url}`, {
    method: req.method,
    headers: new Headers(req.headers),
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? 'half' : undefined
  });
}

async function send(res, webRes) {
  res.writeHead(webRes.status, Object.fromEntries(webRes.headers));
  if (webRes.body) Readable.fromWeb(webRes.body).pipe(res);
  else res.end();
}

const server = http.createServer(async (req, res) => {
  try {
    const request = toWebRequest(req);
    const pathname = new URL(request.url).pathname;

    let out;
    if (pathname.startsWith('/api/')) {
      out =
        pathname === '/api/check/file'
          ? await relayUpload(request, process.env.VT_API_KEY)
          : await handleApi(pathname, request, process.env.VT_API_KEY);
    } else {
      const hit = serveStatic(pathname);
      out = hit
        ? new Response(hit.data, {
            headers: {
              'content-type': hit.type,
              'cache-control': /\.html$/.test(pathname) || pathname === '/' ? 'no-cache' : 'public, max-age=3600'
            }
          })
        : new Response('Not found', { status: 404 });
    }
    await send(res, out);
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.end('internal error');
  }
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log('');
  console.log('  NOISY VIRUS — local dev (mirrors production routing)');
  console.log(`  Engine : official${process.env.VT_API_KEY ? '' : ' — WARNING: VT_API_KEY not set'}`);
  console.log(`  Local  : http://localhost:${PORT}`);
  console.log('');
});
