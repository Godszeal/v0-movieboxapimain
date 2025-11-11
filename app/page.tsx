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
import ProxyTest from "@/components/proxy-test"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 truncate">
                MovieBox API Explorer
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">Interactive API Testing & Documentation</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link href="/landing">
                <Button className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-3 sm:px-4">
                  View Live Website
                </Button>
              </Link>
              <Badge className="bg-blue-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm">v1.0</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 sm:mb-10">
          <ProxyTest />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-white">Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-slate-400">Find movies, TV series, and music</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-white">Trending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-slate-400">Discover trending content</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-white">Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-slate-400">Get download links</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-white">Subtitles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-slate-400">Access subtitles</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-white">Streaming</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-slate-400">Stream content</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-white">Homepage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-slate-400">Featured content</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-white">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-slate-400">Item information</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-white">More</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-slate-400">Recommendations & more</p>
            </CardContent>
          </Card>
        </div>

        {/* API Explorer Tabs */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">API Explorer</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Test all API endpoints and view responses in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="w-full bg-slate-700 mb-4 h-auto flex-wrap sm:grid sm:grid-cols-6">
                <TabsTrigger value="search" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Search
                </TabsTrigger>
                <TabsTrigger value="trending" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Trending
                </TabsTrigger>
                <TabsTrigger value="downloads" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Downloads
                </TabsTrigger>
                <TabsTrigger value="subtitles" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Subtitles
                </TabsTrigger>
                <TabsTrigger value="stream" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Stream
                </TabsTrigger>
                <TabsTrigger value="homepage" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Homepage
                </TabsTrigger>
              </TabsList>

              <TabsList className="w-full bg-slate-700 h-auto flex-wrap sm:grid sm:grid-cols-5">
                <TabsTrigger value="details" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Details
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="popular" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Popular
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="text-xs sm:text-sm flex-1 sm:flex-none">
                  Suggestions
                </TabsTrigger>
                <TabsTrigger value="hot" className="text-xs sm:text-sm flex-1 sm:flex-none">
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
        <Card className="bg-slate-800 border-slate-700 mt-8 sm:mt-10">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">API Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Base URL</h3>
              <code className="bg-slate-900 text-blue-400 px-3 py-2 rounded block text-xs sm:text-sm break-all">
                /api
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Creator</h3>
              <p className="text-slate-400 text-xs sm:text-sm">All API responses include creator: God's Zeal</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
