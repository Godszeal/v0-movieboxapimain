"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play, Download, ArrowLeft, Star, Calendar, Globe } from "lucide-react"
import Link from "next/link"

interface MovieDetails {
  title: string
  description: string
  poster: string
  rating?: number
  year?: number
  duration?: string
  genres?: string[]
  subjectId: string
  detailPath: string
  category?: number
}

interface DownloadLink {
  id: string
  quality: string
  url: string
  size: string
  format?: string
}

interface SubtitleLink {
  id: string
  language: string
  url: string
  size: string
}

interface StreamLink {
  id: string
  quality: string
  url: string
  size: string
  format?: string
}

export default function MovieDetailsPage() {
  const params = useParams()
  const detailPath = params.detailPath as string

  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [downloads, setDownloads] = useState<DownloadLink[]>([])
  const [subtitles, setSubtitles] = useState<SubtitleLink[]>([])
  const [streams, setStreams] = useState<StreamLink[]>([])
  const [loadingDownloads, setLoadingDownloads] = useState(false)
  const [loadingSubtitles, setLoadingSubtitles] = useState(false)
  const [loadingStreams, setLoadingStreams] = useState(false)

  useEffect(() => {
    fetchMovieDetails()
  }, [detailPath])

  const formatFileSize = (bytes: string | number): string => {
    const size = typeof bytes === "string" ? Number.parseInt(bytes) : bytes
    if (!size || isNaN(size)) return "Unknown"
    const gb = size / (1024 * 1024 * 1024)
    const mb = size / (1024 * 1024)
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(2)} MB`
  }

  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/item-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detailPath }),
      })
      const result = await response.json()

      if (result.error) {
        console.error("Error fetching details:", result.error)
        return
      }

      const data = result.data?.data || result.data
      const movieDetails: MovieDetails = {
        title: data.name || data.title || "Unknown",
        description: data.introduction || data.description || "No description available",
        poster: data.coverUrl || data.cover?.url,
        rating: Number.parseFloat(data.imdbScore || data.imdbRatingValue) || 0,
        year: data.year ? Number.parseInt(data.year) : null,
        duration: data.duration,
        genres: data.category?.split(",") || [],
        subjectId: data.id || data.subjectId,
        detailPath: detailPath,
        category: data.category,
      }

      setDetails(movieDetails)

      // Auto-fetch downloads, subtitles, and streams
      if (movieDetails.subjectId) {
        fetchDownloads(movieDetails.subjectId, detailPath)
        fetchSubtitles(movieDetails.subjectId, detailPath)
        fetchStreams(movieDetails.subjectId, detailPath)
      }
    } catch (error) {
      console.error("Error fetching movie details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDownloads = async (subjectId: string, detailPath: string) => {
    try {
      setLoadingDownloads(true)
      const response = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, detailPath, season: 0, episode: 0 }),
      })
      const result = await response.json()

      const downloadList = result.data?.data?.downloads || []
      if (downloadList.length > 0) {
        const downloadLinks: DownloadLink[] = downloadList.map((item: any) => ({
          id: item.id,
          quality: `${item.resolution}p`,
          url: item.url,
          size: formatFileSize(item.size),
          format: "MP4",
        }))
        setDownloads(downloadLinks)
      }
    } catch (error) {
      console.error("Error fetching downloads:", error)
    } finally {
      setLoadingDownloads(false)
    }
  }

  const fetchSubtitles = async (subjectId: string, detailPath: string) => {
    try {
      setLoadingSubtitles(true)
      const response = await fetch("/api/subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, detailPath, season: 0, episode: 0 }),
      })
      const result = await response.json()

      const captionsList = result.data?.data?.captions || []
      if (captionsList.length > 0) {
        const subtitleLinks: SubtitleLink[] = captionsList.map((item: any) => ({
          id: item.id,
          language: item.lanName || item.lan,
          url: item.url,
          size: formatFileSize(item.size),
        }))
        setSubtitles(subtitleLinks)
      }
    } catch (error) {
      console.error("Error fetching subtitles:", error)
    } finally {
      setLoadingSubtitles(false)
    }
  }

  const fetchStreams = async (subjectId: string, detailPath: string) => {
    try {
      setLoadingStreams(true)
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, detailPath, season: 0, episode: 0 }),
      })
      const result = await response.json()

      const streamsList = result.data?.data?.streams || []
      if (streamsList.length > 0) {
        const streamLinks: StreamLink[] = streamsList.map((item: any) => ({
          id: item.id,
          quality: `${item.resolutions}p`,
          url: item.url,
          size: formatFileSize(item.size),
          format: item.format || "MP4",
        }))
        setStreams(streamLinks)
      }
    } catch (error) {
      console.error("Error fetching streams:", error)
    } finally {
      setLoadingStreams(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Movie not found</p>
          <Link href="/movies">
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Movies</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/movies">
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700 bg-transparent">
                API Explorer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Poster Section */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <img
                src={details.poster || "/placeholder.svg"}
                alt={details.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </Card>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 break-words">
                {details.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                {details.rating && details.rating > 0 && (
                  <Badge className="bg-yellow-600 text-white flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {details.rating}
                  </Badge>
                )}
                {details.year && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {details.year}
                  </Badge>
                )}
                {details.duration && <Badge variant="outline">{details.duration}</Badge>}
              </div>
              {details.genres && details.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {details.genres.map((genre, idx) => (
                    <Badge key={idx} variant="outline" className="text-slate-300">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base break-words">{details.description}</p>
            </div>

            {/* Tabs for Downloads, Subtitles, Streams */}
            <Tabs defaultValue="streams" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="streams" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Stream</span>
                </TabsTrigger>
                <TabsTrigger value="downloads" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Downloads</span>
                </TabsTrigger>
                <TabsTrigger value="subtitles" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Subtitles</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="streams" className="space-y-3 mt-4">
                {loadingStreams ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : streams.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 text-sm sm:text-base">No streaming links available</p>
                ) : (
                  streams.map((stream) => (
                    <Card key={stream.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm sm:text-base">{stream.quality}</p>
                          <p className="text-slate-400 text-xs sm:text-sm">
                            {stream.size} • {stream.format}
                          </p>
                        </div>
                        <Button
                          onClick={() => window.open(stream.url, "_blank")}
                          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="downloads" className="space-y-3 mt-4">
                {loadingDownloads ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : downloads.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 text-sm sm:text-base">No download links available</p>
                ) : (
                  downloads.map((download) => (
                    <Card key={download.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm sm:text-base">{download.quality}</p>
                          <p className="text-slate-400 text-xs sm:text-sm">
                            {download.size} • {download.format}
                          </p>
                        </div>
                        <Button
                          onClick={() => window.open(download.url, "_blank")}
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="subtitles" className="space-y-3 mt-4">
                {loadingSubtitles ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : subtitles.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 text-sm sm:text-base">No subtitles available</p>
                ) : (
                  subtitles.map((subtitle) => (
                    <Card key={subtitle.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm sm:text-base break-words">
                            {subtitle.language}
                          </p>
                          <p className="text-slate-400 text-xs sm:text-sm">SRT • {subtitle.size}</p>
                        </div>
                        <Button
                          onClick={() => window.open(subtitle.url, "_blank")}
                          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
