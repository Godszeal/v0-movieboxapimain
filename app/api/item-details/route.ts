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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { detailPath } = body

    if (!detailPath) {
      return NextResponse.json(
        { error: "detailPath is required", creator: "God's Zeal" },
        { status: 400, headers: corsHeaders },
      )
    }

    try {
      const response = await movieBoxClient.getItemDetails(detailPath)

      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/item-details",
          detailPath,
          data: response,
        },
        { headers: corsHeaders },
      )
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/item-details",
          detailPath,
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
