import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiSession } from "@/lib/auth/api"
import { updatePanelServicePreference } from "@/lib/storage/panel-store"

const patchSchema = z.object({
  isFavorite: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
})

export async function PATCH(request: Request, context: { params: Promise<{ serviceId: string }> }) {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json({ error: "서비스 설정값을 확인해주세요." }, { status: 400 })
  }

  const { serviceId } = await context.params
  const service = await updatePanelServicePreference(serviceId, parsed.data)

  return NextResponse.json({ service })
}
