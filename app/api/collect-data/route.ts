import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const CONTRACT_ADDRESS = "0x72f5565ab147105614ca4eb83ecf15f751fd8c50"
const BASE_RPC_URL = "https://mainnet.base.org"

export async function POST() {
  try {
    const xFeyAmount = 1000000

    const functionSignature = "0x4cdad506"
    const paddedAmount = xFeyAmount.toString(16).padStart(64, "0")
    const data = functionSignature + paddedAmount

    const response = await fetch(BASE_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: CONTRACT_ADDRESS,
            data: data,
          },
          "latest",
        ],
        id: 1,
      }),
    })

    const result = await response.json()

    if (result.error) {
      console.error("RPC Error:", result.error)
      return NextResponse.json({ error: "Failed to fetch conversion rate" }, { status: 500 })
    }

    const hexValue = result.result
    const feyAmount = Number.parseInt(hexValue, 16)

    const conversionRate = feyAmount / xFeyAmount
    const totalGain = feyAmount - xFeyAmount
    const percentageGain = (totalGain / xFeyAmount) * 100

    const supabase = createClient()
    const { error: dbError } = await supabase.from("fey_rates").insert({
      xfey_amount: xFeyAmount,
      fey_amount: feyAmount,
      conversion_rate: conversionRate,
      gains_percent: percentageGain,
    })

    if (dbError) {
      console.error("Error saving to database:", dbError)
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      feyAmount,
      conversionRate,
      percentageGain,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error collecting data:", error)
    return NextResponse.json({ error: "Data collection failed" }, { status: 500 })
  }
}
