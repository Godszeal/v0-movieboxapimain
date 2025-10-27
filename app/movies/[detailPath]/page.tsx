"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, Download, FileText, ArrowLeft, Star } from "lucide-react"
import Link from "next/link"

interface MovieDetails {
  title?: string
  poster?: string
  rating?: number
  year?: number
  description?: string
  subjectId?: string
  detailPath?: string
  seasons?: any[]
  episodes?: any[]
}

interface DownloadLink {
  quality?: string
  url?: string
  size?: string
}

interface StreamLink {
  url?: string
  quality?: string
}

export default function MovieDetailPage() {
  const params = useParams()
  const detailPath = params.detailPath as string

  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [downloads, setDownloads] = useState<DownloadLink[]>([])
  const [streamUrl, setStreamUrl] = useState<string>("")
  const [subtitles, setSubtitles] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState(0)
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  const [loadingDownloads, setLoadingDownloads] = useState(false)
  const [loadingStream, setLoadingStream] = useState(false)
  const [loadingSubtitles, setLoadingSubtitles] = useState(false)

  useEffect(() => {
    if (detailPath) {
      fetchMovieDetails()
    }
  }, [detailPath])

  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/item-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detailPath }),
      })
      const data = await response.json()

      if (data.error) {
        console.error("API Error:", data.error)
        return
      }

      if (data.data) {
        const item = data.data
        setDetails({
          title: item.title || item.name,
          poster: item.cover?.url || item.poster || item.coverUrl,
          rating: item.rating || item.score,
          year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : item.year,
          description: item.description || item.intro,
          subjectId: item.subjectId,
          detailPath: item.detailPath || detailPath,
          seasons: item.seasons || [],
          episodes: item.episodes || [],
        })
      }
    } catch (error) {
      console.error("Error fetching movie details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDownloads = async () => {
    if (!details?.subjectId || !details?.detailPath) return

    try {
      setLoadingDownloads(true)
      const response = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: details.subjectId,
          detailPath: details.detailPath,
          season: selectedSeason,
          episode: selectedEpisode,
        }),
      })
      const data = await response.json()

      if (data.error) {
        console.error("Download API Error:", data.error)
        return
      }

      if (data.data) {
        const downloadData = data.data
        const links = downloadData.mediaList || downloadData.downloadFiles || []
        setDownloads(links)
      }
    } catch (error) {
      console.error("Error fetching downloads:", error)
    } finally {
      setLoadingDownloads(false)
    }
  }

  const fetchStream = async () => {
    if (!details?.subjectId || !details?.detailPath) return

    try {
      setLoadingStream(true)
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: details.subjectId,
          detailPath: details.detailPath,
          season: selectedSeason,
          episode: selectedEpisode,
        }),
      })
      const data = await response.json()

      if (data.error) {
        console.error("Stream API Error:", data.error)
        return
      }

      if (data.data) {
        const streamData = data.data
        const url = streamData.mediaUrl || streamData.url || streamData.playUrl
        setStreamUrl(url || "")
      }
    } catch (error) {
      console.error("Error fetching stream:", error)
    } finally {
      setLoadingStream(false)
    }
  }

  const fetchSubtitles = async () => {
    if (!details?.subjectId || !details?.detailPath) return

    try {
      setLoadingSubtitles(true)
      const response = await fetch("/api/subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: details.subjectId,
          detailPath: details.detailPath,
          season: selectedSeason,
          episode: selectedEpisode,
        }),
      })
      const data = await response.json()

      if (data.error) {
        console.error("Subtitle API Error:", data.error)
        return
      }

      if (data.data) {
        const subs = data.data.subtitles || data.data.captionFiles || []
        setSubtitles(subs)
      }
    } catch (error) {
      console.error("Error fetching subtitles:", error)
    } finally {
      setLoadingSubtitles(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Movie not found</h2>
          <Link href="/movies">
            <Button>Back to Movies</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/movies">
            <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            {details.poster ? (
              <img
                src={details.poster}
                alt={details.title}
                className="w-full rounded-lg shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-slate-400">No Image</span>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{details.title}</h1>
              <div className="flex items-center gap-3 mb-4">
                {details.year && <Badge variant="secondary">{details.year}</Badge>}
                {details.rating && (
                  <Badge className="bg-yellow-600">
                    <Star className="w-3 h-3 mr-1" />
                    {details.rating}
                  </Badge>
                )}
              </div>
              <p className="text-slate-300 text-lg">{details.description}</p>
            </div>

            {details.seasons && details.seasons.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Select Episode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-slate-300 mb-2 block">Season</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="w-full bg-slate-700 text-white border-slate-600 rounded px-3 py-2"
                    >
                      {details.seasons.map((season: any, idx: number) => (
                        <option key={idx} value={idx + 1}>
                          Season {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 mb-2 block">Episode</label>
                    <select
                      value={selectedEpisode}
                      onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                      className="w-full bg-slate-700 text-white border-slate-600 rounded px-3 py-2"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((ep) => (
                        <option key={ep} value={ep}>
                          Episode {ep}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Stream
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={fetchStream}
                    disabled={loadingStream}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loadingStream ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Stream Link"}
                  </Button>
                  {streamUrl && (
                    <div className="mt-4">
                      <a
                        href={streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm break-all"
                      >
                        Open Stream
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={fetchDownloads}
                    disabled={loadingDownloads}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loadingDownloads ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Downloads"}
                  </Button>
                  {downloads.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {downloads.map((download, idx) => (
                        <div key={idx} className="text-sm">
                          <a
                            href={download.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:underline"
                          >
                            {download.quality || `Download ${idx + 1}`}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Subtitles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={fetchSubtitles}
                    disabled={loadingSubtitles}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loadingSubtitles ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Subtitles"}
                  </Button>
                  {subtitles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {subtitles.map((subtitle, idx) => (
                        <div key={idx} className="text-sm">
                          <a
                            href={subtitle.url || subtitle.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline"
                          >
                            {subtitle.language || `Subtitle ${idx + 1}`}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
