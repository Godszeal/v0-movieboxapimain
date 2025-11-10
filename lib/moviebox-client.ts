/**
 * TypeScript client for MovieBox API
 * Replicates the Python moviebox_api functionality with proper cookie and header handling
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
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
  Referer: HOST_URL,
  Host: SELECTED_HOST,
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
      const response = await fetch(url, {
        headers: DEFAULT_REQUEST_HEADERS,
        next: { revalidate: 3600 }, // Cache for 1 hour
      })

      if (response.ok) {
        const setCookieHeaders = response.headers.getSetCookie?.() || []
        setCookieHeaders.forEach((cookie) => {
          const parts = cookie.split(";")[0].split("=")
          if (parts.length === 2) {
            globalCookieStore[parts[0].trim()] = parts[1].trim()
          }
        })

        const json = await response.json()
        processApiResponse(json)
      }
    } catch (error) {
      console.warn("Failed to fetch app info, continuing without cookies:", error)
    }
  }

  private buildCookieHeader(): string {
    return Object.entries(globalCookieStore)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ")
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
      throw new Error(`HTTP error! status: ${response.status}`)
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

    const urlObj = new URL(url)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, String(value))
      })
    }

    const cookieHeader = this.buildCookieHeader()
    const headers = {
      ...DEFAULT_REQUEST_HEADERS,
      ...(cookieHeader && { Cookie: cookieHeader }),
      ...customHeaders,
    }

    let lastError: Error | null = null
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetch(urlObj.toString(), {
          headers,
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response
      } catch (error) {
        console.error(`[v0] Attempt ${attempt + 1} failed:`, error)
        lastError = error as Error
        if (attempt < 4) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error("Request failed after 5 attempts")
  }

  async getWithCookiesFromApi(
    url: string,
    params?: Record<string, any>,
    customHeaders?: Record<string, string>,
  ): Promise<any> {
    const response = await this.getWithCookies(url, params, customHeaders)
    const json = await response.json()
    if (json.code !== undefined && json.message !== undefined) {
      return processApiResponse(json)
    }
    return json
  }

  async post(url: string, data: Record<string, any>, customHeaders?: Record<string, string>): Promise<Response> {
    await this.ensureCookiesAssigned()

    const headers = {
      ...DEFAULT_REQUEST_HEADERS,
      "Content-Type": "application/json",
      Cookie: this.buildCookieHeader(),
      ...customHeaders,
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

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
    const response = await this.getWithCookies(url, params, customHeaders)
    return response.json()
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
    const response = await this.getWithCookies(url, params, customHeaders)
    return response.json()
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
    const response = await this.getWithCookies(url, params, customHeaders)
    return response.json()
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
