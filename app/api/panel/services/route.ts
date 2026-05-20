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

export async function POST(request: Request) {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  try {
    const body = (await request.json().catch(() => null)) as { platform?: string } | null
    const platform = body?.platform && body.platform !== "all" ? body.platform : undefined
    const services = await syncPanelServices({ platform })

    return NextResponse.json({ services })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "서비스 동기화에 실패했습니다." }, { status: 500 })
  }
}
