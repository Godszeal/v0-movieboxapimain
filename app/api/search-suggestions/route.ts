import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient } from "@/lib/moviebox-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, perPage = 10 } = body

    if (!query) {
      return NextResponse.json({ error: "query is required", creator: "God's Zeal" }, { status: 400 })
    }

    try {
      const response = await movieBoxClient.getSearchSuggestions(query, perPage)

      return NextResponse.json({
        creator: "God's Zeal",
        endpoint: "/api/search-suggestions",
        query,
        perPage,
        data: response,
      })
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/search-suggestions",
          query,
          perPage,
          error: error instanceof Error ? error.message : "API request failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body", creator: "God's Zeal" }, { status: 400 })
  }
}
