// Images, fonts and video are never needed for prices and cost the shop the most. "other" is
// mostly the favicon Chrome asks for on its own, outside robots.txt and the queue
const BLOCKED_TYPES = new Set(["image", "font", "media", "other", "manifest", "ping"]);

/**
 * Whether the browser should abort a request: heavy files, and every host other than the page's
 * own and those the adapter lists, so analytics, ads and chat never count our visit.
 */
export function shouldBlockRequest(
  request: { url: string; resourceType: string },
  pageOrigin: string,
  extraHosts: readonly string[] = [],
): boolean {
  if (request.url.startsWith("data:")) return false;
  if (BLOCKED_TYPES.has(request.resourceType)) return true;
  let host: string;
  try {
    host = new URL(request.url).host;
  } catch {
    return true;
  }
  // The exact host only: a shop's own subdomain can host a tracker too
  return host !== new URL(pageOrigin).host && !extraHosts.includes(host);
}
