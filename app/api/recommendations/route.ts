import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient } from "@/lib/moviebox-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subjectId, page = 1, perPage = 24 } = body

    if (!subjectId) {
      return NextResponse.json({ error: "subjectId is required", creator: "God's Zeal" }, { status: 400 })
    }

    try {
      const response = await movieBoxClient.getRecommendations(subjectId, page, perPage)

      return NextResponse.json({
        creator: "God's Zeal",
        endpoint: "/api/recommendations",
        subjectId,
        page,
        perPage,
        data: response,
      })
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/recommendations",
          subjectId,
          page,
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
