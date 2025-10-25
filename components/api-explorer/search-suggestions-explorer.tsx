"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import ResponseViewer from "./response-viewer"

export default function SearchSuggestionsExplorer() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/search-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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
        <p className="font-semibold mb-1">Get search suggestions</p>
        <p>Type a query to get autocomplete suggestions</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Search Query</label>
        <Input
          placeholder="e.g., Inception, Breaking..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
          "Get Suggestions"
        )}
      </Button>

      {error && <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">{error}</div>}

      {response && <ResponseViewer data={response} />}
    </div>
  )
}
