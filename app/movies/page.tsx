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
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

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

  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch("/api/search-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        setSuggestions(data.data.slice(0, 5))
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value)
    fetchSuggestions(value)
  }

  const handleSuggestionClick = (suggestion: any) => {
    const title = suggestion.title || suggestion.name
    setSearchQuery(title)
    setShowSuggestions(false)
    handleSearchWithQuery(title)
  }

  const handleSearchWithQuery = async (query: string) => {
    if (!query.trim()) return

    try {
      setSearching(true)
      setShowSuggestions(false)
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()

      if (data.error) {
        console.error("Search API Error:", data.error)
        setMovies([])
        return
      }

      let searchResults = []
      if (data.data && data.data.subjectList && Array.isArray(data.data.subjectList)) {
        searchResults = data.data.subjectList
      } else if (data.data && Array.isArray(data.data)) {
        searchResults = data.data
      } else if (Array.isArray(data)) {
        searchResults = data
      }

      if (searchResults.length > 0) {
        const formattedMovies = searchResults.map((item: any) => ({
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
      setMovies([])
    } finally {
      setSearching(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    handleSearchWithQuery(searchQuery)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">MovieBox</h1>
            <Link href="/">
              <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700 bg-transparent">
                API Explorer
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Search movies, TV series..."
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => searchQuery.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-white border-b border-slate-700 last:border-0"
                    >
                      <div className="font-medium">{suggestion.title || suggestion.name}</div>
                      {suggestion.releaseDate && (
                        <div className="text-xs text-slate-400">
                          {new Date(suggestion.releaseDate).getFullYear()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={searching} className="bg-blue-600 hover:bg-blue-700">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.detailPath}`}>
                <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all cursor-pointer h-full overflow-hidden group">
                  <div className="relative overflow-hidden bg-slate-900 aspect-video">
                    {movie.poster ? (
                      <img
                        src={movie.poster || "/placeholder.svg"}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-1" />
                        Watch
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white text-white hover:bg-white/20 bg-transparent"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white truncate">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {movie.year && <Badge variant="secondary">{movie.year}</Badge>}
                      {movie.rating && <Badge className="bg-yellow-600">{movie.rating}★</Badge>}
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
