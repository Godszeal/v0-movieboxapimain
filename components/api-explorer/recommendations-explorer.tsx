"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import ResponseViewer from "./response-viewer"

export default function RecommendationsExplorer() {
  const [subjectId, setSubjectId] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    if (!subjectId.trim()) {
      setError("Please enter a subject ID")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId }),
      })
      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-700 text-blue-300 px-4 py-3 rounded text-sm">
        <p className="font-semibold mb-1">Get recommendations based on a movie or series</p>
        <p>Enter a subject ID to get similar content recommendations</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Subject ID</label>
        <Input
          placeholder="e.g., 1234567"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
        />
      </div>

      <Button onClick={handleFetch} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Fetching...
          </>
        ) : (
          "Get Recommendations"
        )}
      </Button>

      {error && <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">{error}</div>}

      {response && <ResponseViewer data={response} />}
    </div>
  )
}
