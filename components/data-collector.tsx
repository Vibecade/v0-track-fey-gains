"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function DataCollector() {
  const [collecting, setCollecting] = useState(false)
  const [message, setMessage] = useState("")

  const collectData = async () => {
    setCollecting(true)
    setMessage("")

    try {
      const response = await fetch("/api/collect-data", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Data collected successfully! Rate: ${data.conversionRate.toFixed(6)}`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage("Failed to collect data")
    } finally {
      setCollecting(false)
    }
  }

  return (
    null
  )
}
