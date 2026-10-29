import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api.js';

const CONVEX_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONVEX_URL) ||
  process.env.VITE_CONVEX_URL ||
  'https://exciting-toad-544.ap-southeast-2.convex.cloud';

export const convex = new ConvexHttpClient(CONVEX_URL);
export { api };
