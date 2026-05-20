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
    return NextResponse.json({ error: "Check service, link, and quantity." }, { status: 400 })
  }

  try {
    const order = await createPanelOrder(parsed.data)

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Order failed." }, { status: 500 })
  }
}
