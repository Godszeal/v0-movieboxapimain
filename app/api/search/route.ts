import { type NextRequest, NextResponse } from "next/server"
import { movieBoxClient, SubjectType } from "@/lib/moviebox-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, subjectType = "ALL", page = 1, perPage = 24 } = body

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required", creator: "God's Zeal" }, { status: 400 })
    }

    try {
      const subjectTypeValue = SubjectType[subjectType as keyof typeof SubjectType] || SubjectType.ALL
      const response = await movieBoxClient.search(query, subjectTypeValue, page, perPage)

      return NextResponse.json({
        creator: "God's Zeal",
        endpoint: "/api/search",
        query,
        subjectType,
        page,
        perPage,
        data: response,
      })
    } catch (error) {
      console.error("MovieBox API error:", error)
      return NextResponse.json(
        {
          creator: "God's Zeal",
          endpoint: "/api/search",
          query,
          subjectType,
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
