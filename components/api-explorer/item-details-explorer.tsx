"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import ResponseViewer from "./response-viewer"

export default function ItemDetailsExplorer() {
  const [subjectId, setSubjectId] = useState("")
  const [detailPath, setDetailPath] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    if (!subjectId.trim() || !detailPath.trim()) {
      setError("Please enter both subjectId and detailPath")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/item-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, detailPath }),
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
        <p className="font-semibold mb-1">Get detailed information about a movie or TV series</p>
        <p>Copy subjectId and detailPath from search results to get full details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Subject ID</label>
          <Input
            placeholder="e.g., 1234567"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Detail Path</label>
          <Input
            placeholder="e.g., /movie/inception-2010"
            value={detailPath}
            onChange={(e) => setDetailPath(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>
      </div>

      <Button onClick={handleFetch} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Fetching...
          </>
        ) : (
          "Get Details"
        )}
      </Button>

      {error && <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">{error}</div>}

      {response && <ResponseViewer data={response} />}
    </div>
  )
}
