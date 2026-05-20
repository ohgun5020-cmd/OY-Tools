import { NextResponse } from "next/server"
import { z } from "zod"

import {
  buildAdminOrderItem,
  createAdminOrderCandidate,
  getAdminOrderCandidates,
} from "@/lib/storage/panel-store"

const createCandidateSchema = z.object({
  targetUrl: z.string().url(),
  serviceId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
})

export async function GET() {
  return NextResponse.json({ candidates: await getAdminOrderCandidates() })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = createCandidateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "게시글 URL, 서비스, 수량을 확인해주세요." }, { status: 400 })
  }

  try {
    const item = await buildAdminOrderItem(parsed.data.serviceId, parsed.data.quantity)
    const candidate = await createAdminOrderCandidate({
      source: "manual",
      targetUrl: parsed.data.targetUrl,
      items: [item],
    })

    return NextResponse.json({ candidate })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "관리자 오더 후보 생성에 실패했습니다." },
      { status: 400 },
    )
  }
}
