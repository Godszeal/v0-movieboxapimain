"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function ProxyTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)

  const testProxy = async () => {
    setTesting(true)
    setResult(null)

    try {
      const testUrl = "https://mdb.yeshd.net/resource/poster/e1BOR6/e1BOR6f19C7-Q2RWR1Xq0U14c0MJx0qL0.jpg"
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(testUrl)}`

      const response = await fetch(proxyUrl)

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: "Proxy is working correctly!",
          details: `Status: ${response.status}, Content-Type: ${data.contentType || "N/A"}`,
        })
      } else {
        setResult({
          success: false,
          message: "Proxy test failed",
          details: `Status: ${response.status}, Error: ${data.error || "Unknown"}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Proxy test error",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 sm:p-6 space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Proxy Status Test</h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Test if the geo-restriction bypass proxy is working correctly on your deployment.
        </p>
      </div>

      <Button
        onClick={testProxy}
        disabled={testing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
      >
        {testing ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Testing Proxy...
          </>
        ) : (
          "Test Proxy"
        )}
      </Button>

      {result && (
        <div
          className={`p-3 sm:p-4 rounded-lg border text-sm ${
            result.success
              ? "bg-green-900/20 border-green-700 text-green-300"
              : "bg-red-900/20 border-red-700 text-red-300"
          }`}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base">{result.message}</p>
              {result.details && <p className="text-xs sm:text-sm mt-1 opacity-90 break-words">{result.details}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-700 text-blue-300 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-semibold mb-1">About the Proxy</p>
            <p className="text-xs break-words">
              The proxy bypasses geo-restrictions on CDN content that may be blocked in EU and North America regions. It
              routes requests through whitelisted regions like Singapore and Nigeria.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
