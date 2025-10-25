import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient } from "@/lib/moviebox-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "0")
    const perPage = Number.parseInt(searchParams.get("perPage") || "18")

    try {
      const response = await movieBoxClient.getTrending(page, perPage)

      return NextResponse.json({
        creator: "God's Zeal",
        endpoint: "/api/trending",
        page,
        perPage,
        data: response,
      })
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/trending",
          page,
          perPage,
          error: error instanceof Error ? error.message : "API request failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", creator: "God's Zeal" }, { status: 500 })
  }
}
