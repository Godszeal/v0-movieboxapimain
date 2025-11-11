"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, Star, TrendingUp, Film } from "lucide-react"
import Link from "next/link"

interface Movie {
  subjectId: string
  title: string
  cover: string
  rating?: number
  year?: number
  description?: string
  detailPath: string
  genre?: string
}

interface Section {
  title: string
  items: Movie[]
}

export default function LandingPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [banner, setBanner] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomepageContent()
  }, [])

  const fetchHomepageContent = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/homepage")
      const result = await response.json()

      const data = result.data

      // Extract banner
      if (data.operatingList && data.operatingList.length > 0) {
        const bannerSection = data.operatingList.find((item: any) => item.type === "BANNER")
        if (bannerSection?.banner?.items && bannerSection.banner.items.length > 0) {
          const bannerItem = bannerSection.banner.items[0]
          setBanner({
            subjectId: bannerItem.subjectId,
            title: bannerItem.title,
            cover: bannerItem.image?.url || bannerItem.subject?.cover?.url,
            rating: Number.parseFloat(bannerItem.subject?.imdbRatingValue) || 0,
            year: bannerItem.subject?.releaseDate ? new Date(bannerItem.subject.releaseDate).getFullYear() : undefined,
            description: bannerItem.subject?.description,
            detailPath: bannerItem.detailPath,
            genre: bannerItem.subject?.genre,
          })
        }
      }

      // Extract sections
      const sectionsList: Section[] = []

      if (data.operatingList) {
        data.operatingList.forEach((section: any) => {
          if (section.subjects && section.subjects.length > 0) {
            const items: Movie[] = section.subjects.map((item: any) => ({
              subjectId: item.subjectId,
              title: item.title,
              cover: item.cover?.url,
              rating: Number.parseFloat(item.imdbRatingValue) || 0,
              year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined,
              description: item.description,
              detailPath: item.detailPath,
              genre: item.genre,
            }))
            sectionsList.push({
              title: section.title || "Featured",
              items,
            })
          }
        })
      }

      setSections(sectionsList)
    } catch (error) {
      console.error("Error fetching homepage:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">MovieBox</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/movies">
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">Browse Movies</Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="text-white border-slate-600 hover:bg-slate-700 bg-transparent text-sm sm:text-base"
                >
                  API Explorer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      {banner && (
        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
          <img
            src={banner.cover || "/placeholder.svg"}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">{banner.title}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {banner.rating && banner.rating > 0 && (
                    <Badge className="bg-yellow-600 text-white flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {banner.rating}
                    </Badge>
                  )}
                  {banner.year && <Badge variant="secondary">{banner.year}</Badge>}
                  {banner.genre && (
                    <Badge variant="outline" className="text-white border-white">
                      {banner.genre.split(",")[0]}
                    </Badge>
                  )}
                </div>
                {banner.description && (
                  <p className="text-slate-200 text-sm sm:text-base lg:text-lg line-clamp-3">{banner.description}</p>
                )}
                <div className="flex gap-3">
                  <Link href={`/movies/${banner.detailPath}`}>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">{section.title}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {section.items.slice(0, 12).map((movie) => (
                <Link key={movie.subjectId} href={`/movies/${movie.detailPath}`}>
                  <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all cursor-pointer overflow-hidden group">
                    <div className="relative overflow-hidden bg-slate-900 aspect-[2/3]">
                      {movie.cover ? (
                        <img
                          src={movie.cover || "/placeholder.svg"}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-2 sm:p-3">
                      <h4 className="font-semibold text-white truncate text-xs sm:text-sm">{movie.title}</h4>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {movie.rating && movie.rating > 0 && (
                          <Badge className="bg-yellow-600 text-white text-xs">{movie.rating}★</Badge>
                        )}
                        {movie.year && (
                          <Badge variant="secondary" className="text-xs">
                            {movie.year}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-slate-400 text-sm">Created by God's Zeal • Powered by MovieBox API</p>
        </div>
      </footer>
    </div>
  )
}
