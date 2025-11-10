import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient } from "@/lib/moviebox-client"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    try {
      const response = await movieBoxClient.getPopularSearches()

      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/popular-searches",
          data: response,
        },
        { headers: corsHeaders },
      )
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/popular-searches",
          error: error instanceof Error ? error.message : "API request failed",
        },
        { status: 500, headers: corsHeaders },
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", creator: "God's Zeal" },
      { status: 500, headers: corsHeaders },
    )
  }
}
