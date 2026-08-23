// Edge Function — GET /api/health
import { healthResponse } from '../lib/router-core.js';

export const config = { runtime: 'edge' };

export default function handler() {
  return healthResponse(process.env.VT_API_KEY);
}
