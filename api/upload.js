// Edge Function: streams the browser's multipart upload straight into
// VirusTotal without buffering — the documented way past Vercel's 4.5 MB
// buffered-body cap. The browser has already hashed the file and done the
// hash lookup before hitting this route; after upload it polls
// /api/check/hash until the analysis report appears.
import { relayUpload } from '../lib/upload-relay.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  return relayUpload(request, process.env.VT_API_KEY);
}
