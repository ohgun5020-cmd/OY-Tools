import "server-only"

export type InstagramMedia = {
  id: string
  caption?: string
  media_type?: string
  media_url?: string
  permalink?: string
  timestamp?: string
  username?: string
}

type InstagramMediaResponse = {
  data?: InstagramMedia[]
  error?: {
    message?: string
  }
}

export function getInstagramConnectionState() {
  const hasUserId = Boolean(process.env.INSTAGRAM_USER_ID)
  const hasAccessToken = Boolean(process.env.INSTAGRAM_ACCESS_TOKEN)

  return {
    configured: hasUserId && hasAccessToken,
    hasUserId,
    hasAccessToken,
    username: process.env.INSTAGRAM_USERNAME || "blueblurbutter",
    profileUrl: process.env.INSTAGRAM_PROFILE_URL || "https://www.instagram.com/blueblurbutter",
  }
}

export async function fetchLatestInstagramMedia() {
  const userId = process.env.INSTAGRAM_USER_ID
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

  if (!userId || !accessToken) {
    throw new Error("INSTAGRAM_USER_ID와 INSTAGRAM_ACCESS_TOKEN을 Railway Variables에 넣어야 새 게시글 확인을 실행할 수 있습니다.")
  }

  const url = new URL(`https://graph.instagram.com/v25.0/${userId}/media`)
  url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp,username")
  url.searchParams.set("limit", "5")
  url.searchParams.set("access_token", accessToken)

  const response = await fetch(url, {
    cache: "no-store",
  })
  const payload = (await response.json()) as InstagramMediaResponse

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || `Instagram API 요청에 실패했습니다. 상태 코드: ${response.status}`)
  }

  const latest = payload.data?.[0]

  if (!latest?.permalink) {
    throw new Error("Instagram API에서 게시글 URL을 찾지 못했습니다.")
  }

  return latest
}
