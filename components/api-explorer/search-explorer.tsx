"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import ResponseViewer from "./response-viewer"

export default function SearchExplorer() {
  const [query, setQuery] = useState("Inception")
  const [subjectType, setSubjectType] = useState("ALL")
  const [page, setPage] = useState("1")
  const [perPage, setPerPage] = useState("24")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          subjectType,
          page: Number.parseInt(page),
          perPage: Number.parseInt(perPage),
        }),
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Search Query</label>
          <Input
            placeholder="e.g., Inception, Breaking Bad..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Subject Type</label>
          <Select value={subjectType} onValueChange={setSubjectType}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="MOVIES">Movies</SelectItem>
              <SelectItem value="TV_SERIES">TV Series</SelectItem>
              <SelectItem value="MUSIC">Music</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Page</label>
          <Input
            type="number"
            min="1"
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

      <Button onClick={handleSearch} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Searching...
          </>
        ) : (
          "Search"
        )}
      </Button>

      {error && <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded">{error}</div>}

      {response && <ResponseViewer data={response} />}
    </div>
  )
}
