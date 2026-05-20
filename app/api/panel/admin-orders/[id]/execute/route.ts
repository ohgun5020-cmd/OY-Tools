import { NextResponse } from "next/server"

import { executeAdminOrderCandidate } from "@/lib/storage/panel-store"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    const result = await executeAdminOrderCandidate(id)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "관리자 오더 실행에 실패했습니다." },
      { status: 400 },
    )
  }
}
