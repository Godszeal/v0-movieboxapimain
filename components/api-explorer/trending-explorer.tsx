"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import ResponseViewer from "./response-viewer"

export default function TrendingExplorer() {
  const [page, setPage] = useState("0")
  const [perPage, setPerPage] = useState("18")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/trending?page=${page}&perPage=${perPage}`)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Page</label>
          <Input
            type="number"
            min="0"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Per Page</label>
          <Input
            type="number"
            min="1"
            max="100"
            value={perPage}
            onChange={(e) => setPerPage(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
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
          "Get Trending"
        )}
      </Button>

      {error && <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">{error}</div>}

      {response && <ResponseViewer data={response} />}
    </div>
  )
}
