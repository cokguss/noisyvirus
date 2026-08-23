// Edge Function — POST /api/check/hash
// Also serves as the polling endpoint after a brand-new file upload: once
// VT's analysis lands under the digest, this returns the full report.
import { checkHash } from '../lib/router-core.js';

export const config = { runtime: 'edge' };

export default function handler(request) {
  return checkHash(request, process.env.VT_API_KEY);
}
