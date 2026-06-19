import { NextResponse } from "next/server"

import {
  corsHeaders,
  fetchGeneratedImage,
  fetchMagnific,
  getMagnificEditModel,
  getMagnificApiKey,
  readMagnificJson,
  requirePluginAuth,
  taskHasImage,
} from "@/lib/magnific-plugin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function GET(request: Request, context: { params: { taskId: string } }) {
  const auth = requirePluginAuth(request)
  if (!auth.ok) {
    return auth.response
  }

  const apiKey = getMagnificApiKey(request)
  if (!apiKey) {
    return NextResponse.json(
      { error: "Magnific API key is not configured.", code: "magnific_key_required" },
      { status: 503, headers: corsHeaders() },
    )
  }

  const url = new URL(request.url)
  const model = getMagnificEditModel(url.searchParams.get("model"))
  const taskId = encodeURIComponent(context.params.taskId)
  const response = await fetchMagnific(`${model.endpoint}/${taskId}`, apiKey, { method: "GET" })
  const payload = await readMagnificJson(response)

  if (!response.ok) {
    return NextResponse.json(
      { error: "Magnific edit status request failed.", code: "magnific_status_failed", detail: payload },
      { status: 502, headers: corsHeaders() },
    )
  }

  const result: Record<string, unknown> = { ok: true, model, task: payload?.data }
  const generatedUrl = payload?.data?.generated?.[0]
  if (url.searchParams.get("includeImage") === "1" && taskHasImage(payload) && generatedUrl) {
    try {
      Object.assign(result, await fetchGeneratedImage(generatedUrl))
    } catch (error) {
      result.imageFetchError = error instanceof Error ? error.message : "Generated image fetch failed."
    }
  }

  return NextResponse.json(result, { headers: corsHeaders() })
}
