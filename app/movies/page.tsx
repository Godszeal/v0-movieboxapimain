"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Play, Download } from "lucide-react"
import Link from "next/link"

interface Movie {
  id: string
  title: string
  poster: string
  rating?: number
  year?: number
  description?: string
  subjectId?: string
  detailPath?: string
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchTrendingMovies()
  }, [])

  const fetchTrendingMovies = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/trending")
      const data = await response.json()

      if (data.error) {
        console.error("[v0] API Error:", data.error)
        setMovies([])
        return
      }

      let movieList = []
      if (data.data && data.data.subjectList && Array.isArray(data.data.subjectList)) {
        movieList = data.data.subjectList
      } else if (Array.isArray(data.data)) {
        movieList = data.data
      } else if (Array.isArray(data)) {
        movieList = data
      }

      if (movieList.length > 0) {
        const formattedMovies = movieList.map((item: any) => ({
          id: item.id || item.subjectId || Math.random().toString(),
          title: item.title || item.name || "Unknown",
          poster: item.cover?.url || item.poster || item.coverUrl,
          rating: item.rating || item.score,
          year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : item.year,
          description: item.description || item.intro,
          subjectId: item.subjectId,
          detailPath: item.detailPath,
        }))
        setMovies(formattedMovies)
      } else {
        setMovies([])
      }
    } catch (error) {
      console.error("[v0] Error fetching trending movies:", error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setSearching(true)
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await response.json()

      let movieList = []
      if (data.data && data.data.subjectList && Array.isArray(data.data.subjectList)) {
        movieList = data.data.subjectList
      } else if (Array.isArray(data.data)) {
        movieList = data.data
      }

      if (movieList.length > 0) {
        const formattedMovies = movieList.map((item: any) => ({
          id: item.id || item.subjectId || Math.random().toString(),
          title: item.title || item.name || "Unknown",
          poster: item.cover?.url || item.poster || item.coverUrl,
          rating: item.rating || item.score,
          year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : item.year,
          description: item.description || item.intro,
          subjectId: item.subjectId,
          detailPath: item.detailPath,
        }))
        setMovies(formattedMovies)
      } else {
        setMovies([])
      }
    } catch (error) {
      console.error("Error searching movies:", error)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">MovieBox</h1>
            <Link href="/">
              <Button
                variant="outline"
                className="text-white border-slate-600 hover:bg-slate-700 bg-transparent text-sm sm:text-base"
              >
                API Explorer
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative w-full">
              <Input
                placeholder="Search movies, TV series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            <Button type="submit" disabled={searching} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">No movies found. Try searching for something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {movies.map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.detailPath}`}>
                <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all cursor-pointer h-full overflow-hidden group">
                  <div className="relative overflow-hidden bg-slate-900 aspect-[2/3]">
                    {movie.poster ? (
                      <img
                        src={movie.poster || "/placeholder.svg"}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs sm:text-sm">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 sm:gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Watch</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white text-white hover:bg-white/20 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-2 sm:p-4">
                    <h3 className="font-semibold text-white truncate text-sm sm:text-base">{movie.title}</h3>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                      {movie.year && (
                        <Badge variant="secondary" className="text-xs">
                          {movie.year}
                        </Badge>
                      )}
                      {movie.rating && <Badge className="bg-yellow-600 text-xs">{movie.rating}★</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
