import { head } from "@vercel/blob";
import { CV_FILE_NAME } from "@/constants";

// Cache the CV blob URL in memory so we don't pay a `head()` round-trip on
// every session-creation request. A re-uploaded CV is still picked up
// automatically once the entry expires (or on the next cold start).
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cached: { url: string; expiresAt: number } | null = null;

export async function getCvUrl(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const blob = await head(CV_FILE_NAME, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  cached = { url: blob.url, expiresAt: Date.now() + CACHE_TTL_MS };
  return blob.url;
}
