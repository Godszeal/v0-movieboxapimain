import { type NextRequest, NextResponse } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

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
      const { stdout, stderr } = await execFileAsync("python3", [
        "scripts/moviebox_wrapper.py",
        "downloads",
        subjectId,
        detailPath,
        String(season),
        String(episode),
      ])

      if (stderr) {
        console.error("Python script stderr:", stderr)
      }

      const response = JSON.parse(stdout)
      
      if (response.error) {
        return NextResponse.json(response, { status: 500 })
      }

      return NextResponse.json(response)
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
