// Streams a browser multipart upload straight into VirusTotal's /files
// endpoint without ever buffering the body — this is what lets files well
// past Vercel's 4.5 MB buffered-body cap through on the Edge runtime.
// The browser already computed SHA-256 and did the hash lookup before
// calling this, so the server never needs to touch the file's bytes.
const MAX_FILE_BYTES = 32 * 1024 * 1024;
const VT_FILES_URL = 'https://www.virustotal.com/api/v3/files';

export async function relayUpload(request, apiKey) {
  if (!apiKey) {
    return Response.json(
      { ok: false, error: 'Server is missing the VT_API_KEY environment variable.' },
      { status: 500 }
    );
  }
  if (request.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed.' }, { status: 405 });
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return Response.json({ ok: false, error: 'Expected a multipart upload.' }, { status: 400 });
  }

  // browsers set Content-Length on FormData bodies — cheap pre-flight guard
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_FILE_BYTES + 4096) {
    return Response.json(
      { ok: false, code: 'FILE_TOO_LARGE', error: 'File exceeds the 32 MB limit.' },
      { status: 413 }
    );
  }

  let upstream;
  try {
    const headers = { 'x-apikey': apiKey, 'content-type': contentType };
    const contentLength = request.headers.get('content-length');
    // forward only when present — an explicit "undefined"/empty value would
    // be stringified and corrupt the upstream request
    if (contentLength) headers['content-length'] = contentLength;
    upstream = await fetch(VT_FILES_URL, {
      method: 'POST',
      headers,
      body: request.body,
      duplex: 'half'
    });
  } catch (e) {
    return Response.json({ ok: false, error: `Relay to VirusTotal failed: ${e.message}` }, { status: 502 });
  }

  let body = null;
  try {
    body = await upstream.json();
  } catch {}

  if (!upstream.ok) {
    return Response.json(
      { ok: false, error: body?.error?.message || `VirusTotal upload HTTP ${upstream.status}` },
      { status: 502 }
    );
  }

  // small JSON — safe to buffer; the browser polls /api/check/hash until
  // the analysis completes and the report shows up under the digest
  return Response.json({ ok: true, uploaded: true });
}
