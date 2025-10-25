import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient } from "@/lib/moviebox-client"

export async function GET(request: NextRequest) {
  try {
    try {
      const response = await movieBoxClient.getPopularSearches()

      return NextResponse.json({
        creator: "God's Zeal",
        endpoint: "/api/popular-searches",
        data: response,
      })
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/popular-searches",
          error: error instanceof Error ? error.message : "API request failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", creator: "God's Zeal" }, { status: 500 })
  }
}
