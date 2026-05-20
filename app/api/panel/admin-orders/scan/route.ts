import { NextResponse } from "next/server"

import { buildSuggestedAdminOrderItems } from "@/features/panel/admin-order-rules"
import { fetchLatestInstagramMedia, getInstagramConnectionState } from "@/lib/instagram/client"
import {
  createAdminOrderCandidate,
  findAdminOrderCandidateByTargetUrl,
  getPanelServices,
} from "@/lib/storage/panel-store"

export async function POST() {
  const connection = getInstagramConnectionState()

  if (!connection.configured) {
    return NextResponse.json(
      {
        error: "Instagram API 연결값이 없어 새 게시글 확인을 실행할 수 없습니다.",
        required: ["INSTAGRAM_USER_ID", "INSTAGRAM_ACCESS_TOKEN"],
      },
      { status: 400 },
    )
  }

  try {
    const latestMedia = await fetchLatestInstagramMedia()
    const existing = await findAdminOrderCandidateByTargetUrl(latestMedia.permalink!)

    if (existing) {
      return NextResponse.json({
        candidate: existing,
        created: false,
        message: "이미 등록된 최신 게시글입니다.",
      })
    }

    const services = await getPanelServices()
    const candidate = await createAdminOrderCandidate({
      source: "instagram",
      targetUrl: latestMedia.permalink!,
      profileUrl: connection.profileUrl,
      mediaId: latestMedia.id,
      mediaType: latestMedia.media_type || null,
      caption: latestMedia.caption || null,
      detectedAt: latestMedia.timestamp || new Date().toISOString(),
      items: buildSuggestedAdminOrderItems(services),
      raw: latestMedia as Record<string, unknown>,
    })

    return NextResponse.json({
      candidate,
      created: true,
      message: "최신 게시글을 관리자 오더 후보로 등록했습니다.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Instagram 새 게시글 확인에 실패했습니다." },
      { status: 400 },
    )
  }
}
