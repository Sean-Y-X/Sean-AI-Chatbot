const CV_MIME_TYPE = "application/pdf";

const CV_TTL_MS = 5 * 60 * 1000;

type CachedCv = {
  data: string;
  etag: string | null;
  fetchedAt: number;
};

let cachedCv: CachedCv | null = null;
// Shared so concurrent session creations trigger one fetch, not one each.
let inFlight: Promise<CachedCv> | null = null;

async function loadCv(previous: CachedCv | null): Promise<CachedCv> {
  const url = process.env.CV_FILE_URL;

  if (!url) {
    throw new Error("CV_FILE_URL is not set");
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: previous?.etag ? { "If-None-Match": previous.etag } : undefined,
  });

  // Unchanged since the last fetch, so keep the bytes we already encoded.
  if (response.status === 304 && previous) {
    return { ...previous, fetchedAt: Date.now() };
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch CV from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const buffer = await response.arrayBuffer();

  return {
    data: Buffer.from(buffer).toString("base64"),
    etag: response.headers.get("etag"),
    fetchedAt: Date.now(),
  };
}

async function getCv(): Promise<CachedCv> {
  if (cachedCv && Date.now() - cachedCv.fetchedAt < CV_TTL_MS) {
    return cachedCv;
  }

  inFlight ??= loadCv(cachedCv)
    .then((cv) => {
      cachedCv = cv;
      return cv;
    })
    .catch((error) => {
      // Serve a stale copy rather than breaking the chat over a blip; only
      // surface the error when there's nothing cached to fall back on.
      if (cachedCv) {
        console.error("Failed to revalidate CV, serving stale copy:", error);
        return cachedCv;
      }

      throw error;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * The CV as an inline document block for the Interactions API.
 */
export async function getCvDocument() {
  const { data } = await getCv();

  return {
    type: "document" as const,
    data,
    mime_type: CV_MIME_TYPE,
  };
}
