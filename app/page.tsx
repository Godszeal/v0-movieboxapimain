"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import SearchExplorer from "@/components/api-explorer/search-explorer"
import TrendingExplorer from "@/components/api-explorer/trending-explorer"
import DownloadsExplorer from "@/components/api-explorer/downloads-explorer"
import SubtitlesExplorer from "@/components/api-explorer/subtitles-explorer"
import StreamExplorer from "@/components/api-explorer/stream-explorer"
import HomepageExplorer from "@/components/api-explorer/homepage-explorer"
import ItemDetailsExplorer from "@/components/api-explorer/item-details-explorer"
import RecommendationsExplorer from "@/components/api-explorer/recommendations-explorer"
import PopularSearchesExplorer from "@/components/api-explorer/popular-searches-explorer"
import SearchSuggestionsExplorer from "@/components/api-explorer/search-suggestions-explorer"
import HotMoviesExplorer from "@/components/api-explorer/hot-movies-explorer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">MovieBox API Explorer</h1>
              <p className="text-slate-400 mt-1">Interactive API Testing & Documentation</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/movies">
                <Button className="bg-blue-600 hover:bg-blue-700">View Live Website</Button>
              </Link>
              <Badge className="bg-blue-600 text-white px-3 py-1">v1.0</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Find movies, TV series, and music</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Trending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Discover trending content</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Get download links</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Subtitles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Access subtitles</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Streaming</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Stream content</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Homepage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Featured content</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Item information</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">More</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Recommendations & more</p>
            </CardContent>
          </Card>
        </div>

        {/* API Explorer Tabs */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">API Explorer</CardTitle>
            <CardDescription>Test all API endpoints and view responses in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-slate-700 mb-4 overflow-x-auto">
                <TabsTrigger value="search" className="text-xs sm:text-sm">
                  Search
                </TabsTrigger>
                <TabsTrigger value="trending" className="text-xs sm:text-sm">
                  Trending
                </TabsTrigger>
                <TabsTrigger value="downloads" className="text-xs sm:text-sm">
                  Downloads
                </TabsTrigger>
                <TabsTrigger value="subtitles" className="text-xs sm:text-sm">
                  Subtitles
                </TabsTrigger>
                <TabsTrigger value="stream" className="text-xs sm:text-sm">
                  Stream
                </TabsTrigger>
                <TabsTrigger value="homepage" className="text-xs sm:text-sm">
                  Homepage
                </TabsTrigger>
              </TabsList>

              <TabsList className="grid w-full grid-cols-5 bg-slate-700">
                <TabsTrigger value="details" className="text-xs sm:text-sm">
                  Details
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="text-xs sm:text-sm">
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="popular" className="text-xs sm:text-sm">
                  Popular
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="text-xs sm:text-sm">
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="hot" className="text-xs sm:text-sm">
                  Hot
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-6">
                <SearchExplorer />
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <TrendingExplorer />
              </TabsContent>

              <TabsContent value="downloads" className="mt-6">
                <DownloadsExplorer />
              </TabsContent>

              <TabsContent value="subtitles" className="mt-6">
                <SubtitlesExplorer />
              </TabsContent>

              <TabsContent value="stream" className="mt-6">
                <StreamExplorer />
              </TabsContent>

              <TabsContent value="homepage" className="mt-6">
                <HomepageExplorer />
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <ItemDetailsExplorer />
              </TabsContent>

              <TabsContent value="recommendations" className="mt-6">
                <RecommendationsExplorer />
              </TabsContent>

              <TabsContent value="popular" className="mt-6">
                <PopularSearchesExplorer />
              </TabsContent>

              <TabsContent value="suggestions" className="mt-6">
                <SearchSuggestionsExplorer />
              </TabsContent>

              <TabsContent value="hot" className="mt-6">
                <HotMoviesExplorer />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">API Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Base URL</h3>
              <code className="bg-slate-900 text-blue-400 px-3 py-2 rounded block text-sm">/api</code>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
