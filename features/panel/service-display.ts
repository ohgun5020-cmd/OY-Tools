import type { PanelService } from "@/types/panel"

type DisplayableService = Pick<PanelService, "name" | "category" | "platform">

const phraseReplacements: Array<[RegExp, string]> = [
  [/Instagram Auto Views/gi, "인스타그램 자동 조회수"],
  [/Instagram Story Views/gi, "인스타그램 스토리 조회수"],
  [/Instagram Reels Views/gi, "인스타그램 릴스 조회수"],
  [/Instagram Reel Views/gi, "인스타그램 릴스 조회수"],
  [/Instagram Live Views/gi, "인스타그램 라이브 조회수"],
  [/Instagram Profile Visits/gi, "인스타그램 프로필 방문"],
  [/Instagram Impressions/gi, "인스타그램 노출"],
  [/Instagram Reach/gi, "인스타그램 도달"],
  [/Instagram Views/gi, "인스타그램 조회수"],
  [/Instagram Likes/gi, "인스타그램 좋아요"],
  [/Instagram Followers/gi, "인스타그램 팔로워"],
  [/Instagram Comments/gi, "인스타그램 댓글"],
  [/Instagram Saves/gi, "인스타그램 저장"],
  [/Instagram Shares/gi, "인스타그램 공유"],
  [/Instagram Mentions/gi, "인스타그램 멘션"],
  [/Telegram Views/gi, "텔레그램 조회수"],
  [/Telegram Members/gi, "텔레그램 멤버"],
  [/Telegram Reactions/gi, "텔레그램 반응"],
  [/YouTube Views/gi, "유튜브 조회수"],
  [/YouTube Likes/gi, "유튜브 좋아요"],
  [/YouTube Subscribers/gi, "유튜브 구독자"],
  [/TikTok Views/gi, "틱톡 조회수"],
  [/TikTok Likes/gi, "틱톡 좋아요"],
  [/TikTok Followers/gi, "틱톡 팔로워"],
  [/Facebook Views/gi, "페이스북 조회수"],
  [/Facebook Likes/gi, "페이스북 좋아요"],
  [/Facebook Followers/gi, "페이스북 팔로워"],
  [/Twitter Views/gi, "X 조회수"],
  [/Twitter Followers/gi, "X 팔로워"],
  [/Backlink/gi, "백링크"],
  [/Dofollow/gi, "두팔로우"],
  [/Nofollow/gi, "노팔로우"],
]

const wordReplacements: Array<[RegExp, string]> = [
  [/\bInstagram\b/gi, "인스타그램"],
  [/\bTelegram\b/gi, "텔레그램"],
  [/\bYouTube\b/gi, "유튜브"],
  [/\bTikTok\b/gi, "틱톡"],
  [/\bFacebook\b/gi, "페이스북"],
  [/\bTwitter\b/gi, "X"],
  [/\bViews\b/gi, "조회수"],
  [/\bView\b/gi, "조회수"],
  [/\bLikes\b/gi, "좋아요"],
  [/\bLike\b/gi, "좋아요"],
  [/\bFollowers\b/gi, "팔로워"],
  [/\bFollower\b/gi, "팔로워"],
  [/\bComments\b/gi, "댓글"],
  [/\bComment\b/gi, "댓글"],
  [/\bSaves\b/gi, "저장"],
  [/\bSave\b/gi, "저장"],
  [/\bShares\b/gi, "공유"],
  [/\bShare\b/gi, "공유"],
  [/\bMembers\b/gi, "멤버"],
  [/\bReactions\b/gi, "반응"],
  [/\bRepost\b/gi, "리포스트"],
  [/\bAuto\b/gi, "자동"],
  [/\bStory\b/gi, "스토리"],
  [/\bStories\b/gi, "스토리"],
  [/\bReels\b/gi, "릴스"],
  [/\bReel\b/gi, "릴스"],
  [/\bLive\b/gi, "라이브"],
  [/\bProfile\b/gi, "프로필"],
  [/\bVisits\b/gi, "방문"],
  [/\bVisit\b/gi, "방문"],
  [/\bImpressions\b/gi, "노출"],
  [/\bReach\b/gi, "도달"],
  [/\bSpeed\b/gi, "속도"],
  [/\bLevel\b/gi, "레벨"],
  [/\bMonth\b/gi, "개월"],
  [/\bMonths\b/gi, "개월"],
  [/\bPost\b/gi, "게시글"],
  [/\bRefill\b/gi, "리필"],
  [/\bMax\b/gi, "최대"],
  [/\bMin\b/gi, "최소"],
  [/\bStart Time\b/gi, "시작"],
]

export function getServiceDisplay(service: DisplayableService) {
  const originalName = cleanProviderText(service.name)
  const originalCategory = cleanProviderText(service.category)

  return {
    name: translateProviderServiceText(originalName),
    category: translateProviderServiceText(originalCategory),
    originalName,
    originalCategory,
  }
}

export function translateServiceName(name: string) {
  return translateProviderServiceText(cleanProviderText(name))
}

export function cleanProviderText(value: string) {
  let text = value

  for (let index = 0; index < 2; index += 1) {
    text = decodeHtmlEntities(text)
  }

  return text.replace(/\s+/g, " ").trim()
}

function translateProviderServiceText(value: string) {
  let text = value

  text = text.replace(/(\d+)-Months?/gi, "$1개월")
  text = text.replace(/(\d+)-Month/gi, "$1개월")
  text = text.replace(/\[([^\]]+)\]/g, (_, content: string) => `[${translateBracketContent(content)}]`)

  for (const [pattern, replacement] of phraseReplacements) {
    text = text.replace(pattern, replacement)
  }

  for (const [pattern, replacement] of wordReplacements) {
    text = text.replace(pattern, replacement)
  }

  text = text.replace(/Website's Entire Pages/gi, "웹사이트 전체 페이지")
  text = text.replace(/In Website's Entire Pages/gi, "웹사이트 전체 페이지")
  text = text.replace(/\bHQ\b/g, "고품질")
  text = text.replace(/\bLQ\b/g, "저가형")
  text = text.replace(/\bNo\b/gi, "없음")
  text = text.replace(/\bYes\b/gi, "있음")
  text = text.replace(/\s+-\s+/g, " - ")

  return text.replace(/\s+/g, " ").trim()
}

function translateBracketContent(value: string) {
  let text = cleanProviderText(value)

  text = text.replace(/^Max\s*:/i, "최대:")
  text = text.replace(/^Min\s*:/i, "최소:")
  text = text.replace(/^Start Time\s*:/i, "시작:")
  text = text.replace(/^Speed\s*:/i, "속도:")
  text = text.replace(/^Refill\s*:/i, "리필:")
  text = text.replace(/^Drop\s*:/i, "감소:")
  text = text.replace(/^Quality\s*:/i, "품질:")
  text = text.replace(/^In Website's Entire Pages$/i, "웹사이트 전체 페이지")
  text = text.replace(/^(\d+)\s*Post$/i, "게시글 $1개")
  text = text.replace(/\bNo\b/gi, "없음")
  text = text.replace(/\bYes\b/gi, "있음")
  text = text.replace(/(\d+(?:\.\d+)?)\s*([KM])\s*\/\s*(?:D|Day)/gi, (_, amount: string, unit: string) => {
    return `일 ${formatCompactAmount(amount, unit)}`
  })
  text = text.replace(/(\d+(?:\.\d+)?)\s*([KM])\b/gi, (_, amount: string, unit: string) => {
    return formatCompactAmount(amount, unit)
  })
  text = text.replace(/(\d+)\s*-\s*(\d+)\s*Hours?/gi, "$1-$2시간")
  text = text.replace(/(\d+)\s*-\s*(\d+)\s*Days?/gi, "$1-$2일")
  text = text.replace(/(\d+)\s*Hours?/gi, "$1시간")
  text = text.replace(/(\d+)\s*Days?/gi, "$1일")

  for (const [pattern, replacement] of wordReplacements) {
    text = text.replace(pattern, replacement)
  }

  return text.replace(/\s+/g, " ").trim()
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
  }

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    const lower = entity.toLowerCase()

    if (lower.startsWith("#x")) {
      const codePoint = Number.parseInt(lower.slice(2), 16)
      return isValidCodePoint(codePoint) ? String.fromCodePoint(codePoint) : match
    }

    if (lower.startsWith("#")) {
      const codePoint = Number.parseInt(lower.slice(1), 10)
      return isValidCodePoint(codePoint) ? String.fromCodePoint(codePoint) : match
    }

    return namedEntities[lower] || match
  })
}

function isValidCodePoint(value: number) {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff
}

function formatCompactAmount(amount: string, unit: string) {
  const numeric = Number(amount)

  if (!Number.isFinite(numeric)) {
    return `${amount}${unit}`
  }

  const multiplier = unit.toUpperCase() === "M" ? 1_000_000 : 1_000
  return new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(numeric * multiplier)
}
