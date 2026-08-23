// Edge Function — POST /api/check/url
// Answers fast even for URLs VT has never seen ({ok:true,pending:true});
// the client polls this same route until the report appears.
import { checkUrl } from '../lib/router-core.js';

export const config = { runtime: 'edge' };

export default function handler(request) {
  return checkUrl(request, process.env.VT_API_KEY);
}
