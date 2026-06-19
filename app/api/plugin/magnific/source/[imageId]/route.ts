import { NextResponse } from "next/server"

import { getTempImage } from "@/lib/magnific-plugin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_request: Request, context: { params: { imageId: string } }) {
  const image = getTempImage(context.params.imageId)
  if (!image) {
    return NextResponse.json({ error: "Image expired or not found." }, { status: 404 })
  }

  const body = new Blob([new Uint8Array(image.bytes)], { type: image.mimeType })
  return new NextResponse(body, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "no-store",
    },
  })
}
