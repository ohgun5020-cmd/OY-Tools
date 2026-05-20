import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiSession } from "@/lib/auth/api"
import { getPanelSettings, updatePanelSettings } from "@/lib/storage/panel-store"

const settingsSchema = z.object({
  marginRate: z.coerce.number().min(0).max(500).optional(),
  currency: z.string().min(3).max(3).optional(),
  defaultPlatform: z.string().min(1).optional(),
})

export async function GET() {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  return NextResponse.json({ settings: await getPanelSettings() })
}

export async function PATCH(request: Request) {
  const auth = await requireApiSession()

  if (auth.response) {
    return auth.response
  }

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 })
  }

  const settings = await updatePanelSettings(parsed.data)

  return NextResponse.json({ settings })
}
