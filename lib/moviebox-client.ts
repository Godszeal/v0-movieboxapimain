/**
 * TypeScript client for MovieBox API
 * Replicates the Python moviebox_api functionality with proper cookie and header handling
 *
 * NOTE: Preserves original script format and function names while improving:
 * - cookie parsing & sending,
 * - safer default headers (no manual Host header),
 * - informative logging of non-OK responses (shows body and headers),
 * - automatic mirror-host fallback (tries SELECTED_HOST then other MIRROR_HOSTS),
 * - robust handling for downloads, streams, and subtitles (detects non-JSON HTML responses).
 */

const globalCookieStore: Record<string, string> = {}

const MIRROR_HOSTS = [
  "h5.aoneroom.com",
  "movieboxapp.in",
  "moviebox.pk",
  "moviebox.ph",
  "moviebox.id",
  "v.moviebox.ph",
  "netnaija.video",
]

const SELECTED_HOST = process.env.MOVIEBOX_API_HOST || MIRROR_HOSTS[0]
const HOST_PROTOCOL = "https"
const HOST_URL = `${HOST_PROTOCOL}://${SELECTED_HOST}/`

const DEFAULT_REQUEST_HEADERS = {
  "X-Client-Info": '{"timezone":"Africa/Nairobi"}',
  "Accept-Language": "en-US,en;q=0.5",
  Accept: "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
  Referer: HOST_URL,
  Origin: HOST_URL,
}

export enum SubjectType {
  ALL = 0,
  MOVIES = 1,
  TV_SERIES = 2,
  MUSIC = 6,
}

interface ApiResponse {
  code: number
  message: string
  data: any
}

function getAbsoluteUrl(relativePath: string): string {
  return new URL(relativePath, HOST_URL).toString()
}

function processApiResponse(json: ApiResponse): any {
  if (json.code === 0 && json.message === "ok") {
    return json.data
  }
  throw new Error(`Unsuccessful response from server: ${json.message || "Unknown error"}`)
}

/** Safely read text body from Response */
async function safeText(res: Response) {
  try {
    return await res.text()
  } catch (e) {
    return `<failed to read body: ${String(e)}>`
  }
}

/** Extract a short message from HTML (title or first text snippet) */
function extractHtmlSnippet(html: string) {
  if (!html) return ""
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch && titleMatch[1]) return titleMatch[1].trim()
  // fallback: first 300 chars without tags
  const stripped = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  return stripped.slice(0, 300)
}

/** Parse Set-Cookie header string(s) and merge into globalCookieStore */
function parseAndStoreSetCookie(setCookieHeader: string | null) {
  if (!setCookieHeader) return
  try {
    // split by comma that precedes a new cookie (heuristic)
    const parts = setCookieHeader
      .split(/,(?=[^;=]+=[^;=]+)/g)
      .map((s) => s.trim())
      .filter(Boolean)
    for (const c of parts) {
      const kv = c.split(";")[0].trim()
      const eq = kv.indexOf("=")
      if (eq > 0) {
        const key = kv.slice(0, eq).trim()
        const val = kv.slice(eq + 1).trim()
        if (key) globalCookieStore[key] = val
      }
    }
  } catch (e) {
    console.warn("[moviebox-client] failed to parse set-cookie header", e)
  }
}

function buildCookieHeader(): string {
  return Object.entries(globalCookieStore)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ")
}

/** Replace hostname in a full URL string with a provided host (preserves protocol/path/query) */
function replaceHostInUrl(fullUrl: string, host: string) {
  try {
    const u = new URL(fullUrl)
    u.hostname = host
    u.port = ""
    return u.toString()
  } catch (e) {
    if (fullUrl.startsWith("/")) {
      return `${HOST_PROTOCOL}://${host}${fullUrl}`
    }
    return fullUrl
  }
}

export class MovieBoxClient {
  private appInfoFetched = false

  async ensureCookiesAssigned(): Promise<void> {
    if (!this.appInfoFetched) {
      await this.fetchAppInfo()
      this.appInfoFetched = true
    }
  }

  private async fetchAppInfo(): Promise<void> {
    try {
      const url = getAbsoluteUrl("/wefeed-h5-bff/app/get-latest-app-pkgs?app_name=moviebox")
      const headers = {
        ...DEFAULT_REQUEST_HEADERS,
      }
      const response = await fetch(url, {
        headers,
        credentials: "include",
      })

      const setCookieHeader = response.headers.get("set-cookie") || response.headers.get("Set-Cookie")
      if (setCookieHeader) {
        parseAndStoreSetCookie(setCookieHeader)
      }

      const text = await safeText(response)
      if (!response.ok) {
        console.warn("[v0] fetchAppInfo non-ok response", {
          url,
          status: response.status,
          headers: Array.from(response.headers.entries()),
          body: text.slice(0, 500),
        })
        return
      }

      try {
        const json = JSON.parse(text)
        processApiResponse(json)
      } catch (e) {
        console.warn("[v0] fetchAppInfo returned non-JSON body", text.slice(0, 500))
      }
    } catch (error) {
      console.error("[v0] Error fetching app info:", error)
    }
  }

  private buildCookieHeader(): string {
    return buildCookieHeader()
  }

  async get(url: string, params?: Record<string, any>, customHeaders?: Record<string, string>): Promise<Response> {
    const urlObj = new URL(url)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, String(value))
      })
    }

    const headers = {
      ...DEFAULT_REQUEST_HEADERS,
      ...customHeaders,
    }

    const response = await fetch(urlObj.toString(), {
      headers,
      credentials: "include",
    })

    if (!response.ok) {
      const body = await safeText(response)
      console.error(`[moviebox-client] GET ${urlObj.toString()} returned ${response.status}`, body.slice(0, 500))
      throw new Error(`HTTP error! status: ${response.status} body: ${body.slice(0, 200)}`)
    }

    return response
  }

  async getFromApi(url: string, params?: Record<string, any>): Promise<any> {
    const response = await this.get(url, params)
    const json = await response.json()
    return processApiResponse(json)
  }

  async getWithCookies(
    url: string,
    params?: Record<string, any>,
    customHeaders?: Record<string, string>,
  ): Promise<Response> {
    await this.ensureCookiesAssigned()

    let originalUrl = url
    if (url.startsWith("/")) {
      originalUrl = getAbsoluteUrl(url)
    }

    if (params) {
      const u = new URL(originalUrl)
      Object.entries(params).forEach(([key, value]) => {
        u.searchParams.set(key, String(value))
      })
      originalUrl = u.toString()
    }

    const hostsToTry = [SELECTED_HOST, ...MIRROR_HOSTS.filter((h) => h !== SELECTED_HOST)]

    let lastError: any = null
    for (const host of hostsToTry) {
      const tryUrl = replaceHostInUrl(originalUrl, host)
      const hostBase = `${HOST_PROTOCOL}://${host}`

      const headers = {
        ...DEFAULT_REQUEST_HEADERS,
        Referer: customHeaders?.Referer || DEFAULT_REQUEST_HEADERS.Referer,
        Origin: hostBase,
        ...customHeaders,
      } as Record<string, string>

      const cookieHeader = this.buildCookieHeader()
      if (cookieHeader) {
        headers.Cookie = cookieHeader
      }

      try {
        const response = await fetch(tryUrl, {
          headers,
          credentials: "include",
        })

        const sc = response.headers.get("set-cookie") || response.headers.get("Set-Cookie")
        if (sc) {
          parseAndStoreSetCookie(sc)
        }

        if (response.ok) {
          return response
        }

        const body = await safeText(response)
        console.warn("[moviebox-client] non-ok response from host", {
          host,
          tryUrl,
          status: response.status,
          headers: Array.from(response.headers.entries()),
          body: body.slice(0, 1000),
        })

        lastError = new Error(`Host ${host} returned ${response.status}: ${extractHtmlSnippet(body) || body.slice(0,300)}`)
      } catch (err) {
        console.error(`[moviebox-client] fetch error for host ${host}`, err)
        lastError = err
      }
    }

    if (lastError) {
      throw lastError
    }
    throw new Error(`All MovieBox hosts attempted and failed: ${hostsToTry.join(", ")}`)
  }

  async getWithCookiesFromApi(
    url: string,
    params?: Record<string, any>,
    customHeaders?: Record<string, string>,
  ): Promise<any> {
    const response = await this.getWithCookies(url, params, customHeaders)
    const text = await safeText(response)
    try {
      const json = JSON.parse(text)
      if (json.code !== undefined && json.message !== undefined) {
        return processApiResponse(json)
      }
      return json
    } catch (e) {
      const snippet = extractHtmlSnippet(text)
      console.error("[moviebox-client] getWithCookiesFromApi invalid JSON", {
        url,
        status: response.status,
        snippet,
        bodyPreview: text.slice(0, 800),
      } as any)
      throw new Error(`MovieBox API invalid JSON response (status ${response.status}): ${snippet || text.slice(0,300)}`)
    }
  }

  async post(url: string, data: Record<string, any>, customHeaders?: Record<string, string>): Promise<Response> {
    await this.ensureCookiesAssigned()

    const headers = {
      ...DEFAULT_REQUEST_HEADERS,
      "Content-Type": "application/json",
      ...customHeaders,
    }

    const cookieHeader = this.buildCookieHeader()
    if (cookieHeader) {
      ;(headers as any).Cookie = cookieHeader
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      const body = await safeText(response)
      console.error(`[moviebox-client] POST ${url} returned ${response.status}`, body.slice(0, 500))
      throw new Error(`HTTP error! status: ${response.status} body: ${body.slice(0, 200)}`)
    }

    const sc = response.headers.get("set-cookie") || response.headers.get("Set-Cookie")
    if (sc) parseAndStoreSetCookie(sc)

    return response
  }

  async postToApi(url: string, data: Record<string, any>, customHeaders?: Record<string, string>): Promise<any> {
    const response = await this.post(url, data, customHeaders)
    const json = await response.json()
    return processApiResponse(json)
  }

  // Homepage
  async getHomepage(): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/home")
    return this.getWithCookiesFromApi(url)
  }

  // Search
  async search(query: string, subjectType: SubjectType = SubjectType.ALL, page = 1, perPage = 24): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/search")
    const payload = {
      keyword: query,
      page,
      perPage,
      subjectType: subjectType,
    }
    return this.postToApi(url, payload)
  }

  // Trending
  async getTrending(page = 0, perPage = 18): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/trending")
    const params = {
      page,
      perPage,
    }
    return this.getWithCookiesFromApi(url, params)
  }

  // Popular Searches
  async getPopularSearches(): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/everyone-search")
    return this.getWithCookiesFromApi(url)
  }

  // Search Suggestions
  async getSearchSuggestions(query: string, perPage = 10): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/search-suggest")
    const payload = {
      keyword: query,
      per_page: perPage,
    }
    return this.postToApi(url, payload)
  }

  // Hot Movies and TV Series
  async getHotMoviesAndTVSeries(): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/search-rank")
    return this.getWithCookiesFromApi(url)
  }

  async getDownloads(subjectId: string, detailPath: string, season = 0, episode = 0): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/download")
    const params = {
      subjectId,
      se: season,
      ep: episode,
    }
    const customHeaders = {
      Referer: getAbsoluteUrl(`/movies/${detailPath}`),
    }
    try {
      const response = await this.getWithCookies(url, params, customHeaders)
      const text = await safeText(response)
      try {
        return JSON.parse(text)
      } catch (e) {
        const snippet = extractHtmlSnippet(text)
        console.error("[moviebox-client] getDownloads invalid JSON", {
          subjectId,
          detailPath,
          status: response.status,
          snippet,
          bodyPreview: text.slice(0, 800),
        })
        throw new Error(`MovieBox API invalid JSON response for downloads (status ${response.status}): ${snippet || text.slice(0,300)}`)
      }
    } catch (err) {
      console.error("[moviebox-client] getDownloads failed", { subjectId, detailPath, error: err })
      throw err
    }
  }

  async getSubtitles(subjectId: string, detailPath: string, season = 0, episode = 0): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/download")
    const params = {
      subjectId,
      se: season,
      ep: episode,
    }
    const customHeaders = {
      Referer: getAbsoluteUrl(`/movies/${detailPath}`),
    }
    try {
      const response = await this.getWithCookies(url, params, customHeaders)
      const text = await safeText(response)
      try {
        return JSON.parse(text)
      } catch (e) {
        const snippet = extractHtmlSnippet(text)
        console.error("[moviebox-client] getSubtitles invalid JSON", {
          subjectId,
          detailPath,
          status: response.status,
          snippet,
          bodyPreview: text.slice(0, 800),
        })
        throw new Error(`MovieBox API invalid JSON response for subtitles (status ${response.status}): ${snippet || text.slice(0,300)}`)
      }
    } catch (err) {
      console.error("[moviebox-client] getSubtitles failed", { subjectId, detailPath, error: err })
      throw err
    }
  }

  async getStream(subjectId: string, detailPath: string, season = 0, episode = 0): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/play")
    const params = {
      subjectId,
      se: season,
      ep: episode,
    }
    const customHeaders = {
      Referer: getAbsoluteUrl(`/movies/${detailPath}`),
    }
    try {
      const response = await this.getWithCookies(url, params, customHeaders)
      const text = await safeText(response)
      try {
        return JSON.parse(text)
      } catch (e) {
        const snippet = extractHtmlSnippet(text)
        console.error("[moviebox-client] getStream invalid JSON", {
          subjectId,
          detailPath,
          status: response.status,
          snippet,
          bodyPreview: text.slice(0, 800),
        })
        throw new Error(`MovieBox API invalid JSON response for stream (status ${response.status}): ${snippet || text.slice(0,300)}`)
      }
    } catch (err) {
      console.error("[moviebox-client] getStream failed", { subjectId, detailPath, error: err })
      throw err
    }
  }

  async getItemDetails(detailPath: string): Promise<any> {
    const url = getAbsoluteUrl(`/movies/${detailPath}`)
    const customHeaders = {
      Referer: url,
    }
    return this.getWithCookies(url, {}, customHeaders).then((r) => r.text())
  }

  async getMovieDetails(detailPath: string): Promise<any> {
    return this.getItemDetails(detailPath)
  }

  async getTVSeriesDetails(detailPath: string): Promise<any> {
    return this.getItemDetails(detailPath)
  }

  // Recommendations - Get recommended items based on a subject
  async getRecommendations(subjectId: string, page = 1, perPage = 24): Promise<any> {
    const url = getAbsoluteUrl("/wefeed-h5-bff/web/subject/detail-rec")
    const params = {
      subjectId,
      page,
      perPage,
    }
    return this.getWithCookiesFromApi(url, params)
  }
}

export const movieBoxClient = new MovieBoxClient()
