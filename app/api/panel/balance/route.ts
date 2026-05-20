import { NextResponse } from "next/server"

import { requireApiSession } from "@/lib/auth/api"
import { getSmmBalance } from "@/lib/smm/client"

export async function GET() {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  try {
    return NextResponse.json({ balance: await getSmmBalance() })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Balance check failed." }, { status: 500 })
  }
}
