import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient } from "@/lib/moviebox-client"
import { proxyUrls } from "@/lib/proxy-helper"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subjectId, detailPath, quality = "best", season = 0, episode = 0 } = body

    if (!subjectId || !detailPath) {
      return NextResponse.json(
        { error: "subjectId and detailPath are required", creator: "God's Zeal" },
        { status: 400, headers: corsHeaders },
      )
    }

    try {
      const response = await movieBoxClient.getStream(subjectId, detailPath, season, episode)

      const proxiedResponse = proxyUrls(response)

      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/stream",
          subjectId,
          detailPath,
          requestedQuality: quality,
          season,
          episode,
          data: proxiedResponse,
        },
        { headers: corsHeaders },
      )
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/stream",
          subjectId,
          detailPath,
          requestedQuality: quality,
          season,
          episode,
          error: error instanceof Error ? error.message : "API request failed",
        },
        { status: 500, headers: corsHeaders },
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body", creator: "God's Zeal" },
      { status: 400, headers: corsHeaders },
    )
  }
}
