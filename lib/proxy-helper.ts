// Proxy helper to bypass geo-restrictions
// Converts CDN URLs to use our proxy for regions where the CDN is blocked (EU, North America)

/**
 * Get the current host URL (auto-detects from environment)
 */
export function getHostUrl(): string {
  // Check if we're in browser or server
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // Server-side: use Vercel URL or fallback
  return process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"
}

/**
 * Convert a direct CDN URL to a proxied URL to bypass geo-restrictions
 * @param url - The original CDN URL
 * @returns Proxied URL that routes through our server
 */
export function proxyUrl(url: string): string {
  if (!url) return url

  const hostUrl = getHostUrl()
  // Encode the URL to pass it as a query parameter
  const encodedUrl = encodeURIComponent(url)
  return `${hostUrl}/api/proxy?url=${encodedUrl}`
}

/**
 * Process an object and convert all URL fields to proxied URLs
 * Works recursively on nested objects and arrays
 */
export function proxyUrls(data: any): any {
  if (!data) return data

  if (Array.isArray(data)) {
    return data.map((item) => proxyUrls(item))
  }

  if (typeof data === "object") {
    const processed: any = {}
    for (const [key, value] of Object.entries(data)) {
      // Check if this field contains a URL
      if (
        typeof value === "string" &&
        (value.startsWith("http://") ||
          value.startsWith("https://") ||
          key.toLowerCase().includes("url") ||
          key.toLowerCase().includes("link"))
      ) {
        processed[key] = proxyUrl(value)
      } else if (typeof value === "object") {
        processed[key] = proxyUrls(value)
      } else {
        processed[key] = value
      }
    }
    return processed
  }

  return data
}
