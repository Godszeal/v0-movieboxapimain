"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ResponseViewerProps {
  data: any
}

export default function ResponseViewer({ data }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-slate-900 border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <h3 className="font-semibold text-white">Response</h3>
        <Button onClick={handleCopy} size="sm" className="bg-slate-700 hover:bg-slate-600 text-white">
          {copied ? "✓ Copied" : "Copy JSON"}
        </Button>
      </div>
      <div className="p-4 overflow-auto max-h-96">
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Card>
  )
}
