import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiSession } from "@/lib/auth/api"
import { createPanelOrder, getPanelOrders } from "@/lib/storage/panel-store"

const createOrderSchema = z.object({
  serviceId: z.string().min(1),
  link: z.string().url(),
  quantity: z.coerce.number().int().positive(),
})

export async function GET() {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  return NextResponse.json({ orders: await getPanelOrders() })
}

export async function POST(request: Request) {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  const parsed = createOrderSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json({ error: "서비스, 링크, 수량을 확인해주세요." }, { status: 400 })
  }

  try {
    const order = await createPanelOrder(parsed.data)

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "주문 실행에 실패했습니다." }, { status: 500 })
  }
}
