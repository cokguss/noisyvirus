// VirusTotal API v3 client — written against web-standard APIs only
// (fetch / TextEncoder / btoa / FormData / Blob) so the exact same module
// runs in Node and inside Cloudflare Workers. The API key is passed
// explicitly instead of read from process.env for the same reason.
const BASE = 'https://www.virustotal.com/api/v3';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function waitForAnalysis(analysisId, apiKey, timeoutMs = 150000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const j = await req(`/analyses/${analysisId}`, {}, apiKey);
    if (j?.data?.attributes?.status === 'completed') return j;
    await sleep(5000);
  }
  throw new Error('VirusTotal analysis timed out. Try again in a minute.');
}

export async function lookupHash(hash, apiKey) {
  return req(`/files/${hash}`, {}, apiKey);
}

export async function lookupUrl(url, apiKey) {
  const id = getUrlId(url);
  try {
    return await req(`/urls/${id}`, {}, apiKey);
  } catch (e) {
    if (e.status !== 404) throw e;

    const submitted = await req('/urls', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url }).toString()
    }, apiKey);

    const analysisId = submitted?.data?.id;
    if (!analysisId) throw new Error('Failed to submit URL to VirusTotal.');

    await waitForAnalysis(analysisId, apiKey);
    return req(`/urls/${id}`, {}, apiKey);
  }
}

export async function scanBuffer(buffer, filename, apiKey) {
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);

  const uploaded = await req('/files', { method: 'POST', body: form }, apiKey);
  const analysisId = uploaded?.data?.id;
  if (!analysisId) throw new Error('File upload did not return an analysis id.');

  const analysis = await waitForAnalysis(analysisId, apiKey, 180000);
  const fileId = analysis?.data?.relationships?.item?.data?.id;

  if (fileId) {
    try {
      return await req(`/files/${fileId}`, {}, apiKey);
    } catch {
      return uploaded;
    }
  }
  return uploaded;
}
