import { NextResponse } from "next/server"
import { getCachedData, setCachedData } from "@/lib/supabase/cache"

const CACHE_KEY = "dune_fey_awarded_v4"
const CACHE_DURATION = 1800 // 30 minutes

export const dynamic = "force-dynamic"

async function fetchFromDune() {
  const apiKey = process.env.DUNE_API_KEY

  if (!apiKey) {
    throw new Error("DUNE_API_KEY not configured")
  }

  const response = await fetch("https://api.dune.com/api/v1/query/6177560/results?limit=1000", {
    headers: {
      "X-Dune-API-Key": apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Dune API error: ${response.status}`)
  }

  const data = await response.json()

  let totalFeyAwarded = 0

  if (data.result?.rows && data.result.rows.length > 0) {
    totalFeyAwarded = Number.parseFloat(data.result.rows[0]?.total_fey || "0")
  }

  return {
    totalFeyAwarded: Math.round(totalFeyAwarded),
    lastUpdated: Date.now(),
  }
}

export async function GET() {
  try {
    const cached = await getCachedData<any>(CACHE_KEY)
    if (cached) {
      return NextResponse.json(cached)
    }

    const data = await fetchFromDune()

    await setCachedData(CACHE_KEY, data, CACHE_DURATION)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Dune data:", error)
    return NextResponse.json({ error: "Failed to fetch Dune data" }, { status: 500 })
  }
}
