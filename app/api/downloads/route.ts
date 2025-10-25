import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient } from "@/lib/moviebox-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subjectId, detailPath, season = 0, episode = 0 } = body

    if (!subjectId || !detailPath) {
      return NextResponse.json(
        { error: "subjectId and detailPath are required", creator: "God's Zeal" },
        { status: 400 },
      )
    }

    try {
      const response = await movieBoxClient.getDownloads(subjectId, detailPath, season, episode)

      return NextResponse.json({
        creator: "God's Zeal",
        endpoint: "/api/downloads",
        subjectId,
        detailPath,
        season,
        episode,
        data: response,
      })
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/downloads",
          subjectId,
          detailPath,
          season,
          episode,
          error: error instanceof Error ? error.message : "API request failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body", creator: "God's Zeal" }, { status: 400 })
  }
}
