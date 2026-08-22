const BASE = 'https://www.virustotal.com/api/v3';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function getUrlId(url) {
  return Buffer.from(url).toString('base64').replace(/=+$/, '');
}

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'x-apikey': process.env.VT_API_KEY,
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

async function waitForAnalysis(analysisId, timeoutMs = 150000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const j = await req(`/analyses/${analysisId}`);
    if (j?.data?.attributes?.status === 'completed') return j;
    await sleep(5000);
  }
  throw new Error('VirusTotal analysis timed out. Try again in a minute.');
}

export async function lookupHash(hash) {
  return req(`/files/${hash}`);
}

export async function lookupUrl(url) {
  const id = getUrlId(url);
  try {
    return await req(`/urls/${id}`);
  } catch (e) {
    if (e.status !== 404) throw e;

    const submitted = await req('/urls', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url }).toString()
    });

    const analysisId = submitted?.data?.id;
    if (!analysisId) throw new Error('Failed to submit URL to VirusTotal.');

    await waitForAnalysis(analysisId);
    return req(`/urls/${id}`);
  }
}

export async function scanBuffer(buffer, filename) {
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);

  const uploaded = await req('/files', { method: 'POST', body: form });
  const analysisId = uploaded?.data?.id;
  if (!analysisId) throw new Error('File upload did not return an analysis id.');

  const analysis = await waitForAnalysis(analysisId, 180000);
  const fileId = analysis?.data?.relationships?.item?.data?.id;

  if (fileId) {
    try {
      return await req(`/files/${fileId}`);
    } catch {
      return uploaded;
    }
  }
  return uploaded;
}
