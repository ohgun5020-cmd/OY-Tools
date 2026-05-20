import { NextResponse } from "next/server"

import { requireApiSession } from "@/lib/auth/api"
import { getPanelServices, syncPanelServices } from "@/lib/storage/panel-store"

export async function GET() {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  return NextResponse.json({ services: await getPanelServices() })
}

export async function POST() {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  try {
    const services = await syncPanelServices()

    return NextResponse.json({ services })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "서비스 동기화에 실패했습니다." }, { status: 500 })
  }
}
