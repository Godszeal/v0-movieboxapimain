import { type NextRequest, NextResponse } from "next/server"

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get("url")

    if (!targetUrl) {
      return NextResponse.json(
        { error: "URL parameter is required", creator: "God's Zeal" },
        { status: 400, headers: corsHeaders },
      )
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(targetUrl)

    // Fetch from the target URL with appropriate headers
    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.themoviedb.org/",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        // Forward Range header for video streaming
        ...(request.headers.get("range") ? { Range: request.headers.get("range")! } : {}),
      },
      redirect: "follow",
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch resource`,
          status: response.status,
          statusText: response.statusText,
          creator: "God's Zeal",
        },
        { status: response.status >= 400 ? response.status : 500, headers: corsHeaders },
      )
    }

    // Get the content type
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    if (contentType.includes("application/json")) {
      const jsonData = await response.json()
      return NextResponse.json(
        { success: true, data: jsonData, creator: "God's Zeal" },
        { status: 200, headers: corsHeaders },
      )
    }

    // Create response with appropriate headers for media content
    const proxyResponse = new NextResponse(response.body, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        // Forward range-related headers for video streaming
        ...(response.headers.get("content-range") ? { "Content-Range": response.headers.get("content-range")! } : {}),
        ...(response.headers.get("accept-ranges") ? { "Accept-Ranges": response.headers.get("accept-ranges")! } : {}),
        ...(response.headers.get("content-length")
          ? { "Content-Length": response.headers.get("content-length")! }
          : {}),
      },
    })

    return proxyResponse
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy request failed", creator: "God's Zeal" },
      { status: 500, headers: corsHeaders },
    )
  }
}
