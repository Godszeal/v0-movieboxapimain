import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient } from "@/lib/moviebox-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { detailPath } = body

    if (!detailPath) {
      return NextResponse.json({ error: "detailPath is required", creator: "God's Zeal" }, { status: 400 })
    }

    try {
      const response = await movieBoxClient.getItemDetails(detailPath)

      return NextResponse.json({
        creator: "God's Zeal",
        endpoint: "/api/item-details",
        detailPath,
        data: response,
      })
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/item-details",
          detailPath,
          error: error instanceof Error ? error.message : "API request failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body", creator: "God's Zeal" }, { status: 400 })
  }
}
