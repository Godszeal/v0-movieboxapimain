"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import ResponseViewer from "./response-viewer"

export default function PopularSearchesExplorer() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/popular-searches", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
        <p className="font-semibold mb-1">Get the most popular searches</p>
        <p>See what other users are searching for on MovieBox</p>
      </div>

      <Button onClick={handleFetch} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Fetching...
          </>
        ) : (
          "Get Popular Searches"
        )}
      </Button>

      {error && <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">{error}</div>}

      {response && <ResponseViewer data={response} />}
    </div>
  )
}
