import { NextResponse } from "next/server"

import { requireApiSession } from "@/lib/auth/api"
import { refreshPanelOrderStatus } from "@/lib/storage/panel-store"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  const { id } = await context.params

  try {
    const order = await refreshPanelOrderStatus(id)

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "상태 새로고침에 실패했습니다." }, { status: 500 })
  }
}
