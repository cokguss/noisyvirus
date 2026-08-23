// VirusTotal API v3 client — written against web-standard APIs only
// (fetch / TextEncoder / btoa / FormData / Blob) so the same module runs in
// Node, Cloudflare Workers, and Vercel Edge functions. The API key is
// passed explicitly instead of read from process.env for the same reason.
const BASE = 'https://www.virustotal.com/api/v3';

export function getUrlId(url) {
  // VT identifies URLs by their unpadded base64 encoding
  const bytes = new TextEncoder().encode(url);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/=+$/, '');
}

async function req(path, opts = {}, apiKey) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'x-apikey': apiKey,
      ...(opts.headers || {})
    }
  });

  let body = null;
  try {
    body = await res.json();
  } catch {}

  if (!res.ok) {
    const err = new Error(body?.error?.message || `VirusTotal API HTTP ${res.status}`);
    err.status = res.status;
    err.code = body?.error?.code || null;
    throw err;
  }
  return body;
}

export async function lookupHash(hash, apiKey) {
  return req(`/files/${hash}`, {}, apiKey);
}

// report for a URL — throws a 404-status error when VT has never seen it
export async function getUrlReport(url, apiKey) {
  return req(`/urls/${getUrlId(url)}`, {}, apiKey);
}

// ask VT to analyze a URL it doesn't know yet; returns immediately with the
// analysis id — the report shows up under the same lookup within moments,
// and the client polls until it does (no server-side waiting: edge functions
// must respond fast)
export async function submitUrl(url, apiKey) {
  const submitted = await req('/urls', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ url }).toString()
  }, apiKey);
  if (!submitted?.data?.id) throw new Error('Failed to submit URL to VirusTotal.');
  return submitted.data.id;
}
