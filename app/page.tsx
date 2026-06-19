"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { FIGMA_PLUGIN_URL } from "@/lib/links"

type ActionItem = {
  title: string
  description: string
  icon: string
  primary?: boolean
  badge?: string
}

type UseCase = {
  title: string
  description: string
  icon: string
}

type HeaderUser = {
  name: string
  email: string
  plan: string
  avatarUrl: string | null
}

type LocaleCode = "ko" | "en" | "ja" | "es" | "pt-br"

type PricingPlan = {
  key: "free" | "basic" | "pro"
  name: string
  price: string
  description: string
  features: PricingFeature[]
  includedPrefix?: string
  cta: string
}

type PricingFeature = {
  label: string
  badge?: "HOT" | "NEW"
}

type PaddleCheckoutConfig = {
  provider: "paddle"
  token: string
  environment: "production" | "sandbox"
  priceId: string
  successUrl: string
  customerEmail: string
  customData: {
    user_id: string
    plan: "basic" | "pro"
  }
}

type PaddleCheckoutResponse = {
  checkout?: PaddleCheckoutConfig
  error?: string
  code?: string
}

type PaddleApi = {
  Initialized?: boolean
  Environment?: {
    set: (environment: "sandbox" | "production") => void
  }
  Initialize: (config: { token: string }) => void
  Update?: (config: Record<string, unknown>) => void
  Checkout: {
    open: (config: {
      settings: {
        displayMode: "overlay"
        theme: "light"
        locale: "ko" | "en" | "ja" | "es" | "pt-BR"
        successUrl: string
        variant: "one-page"
      }
      items: Array<{ priceId: string; quantity: number }>
      customer: { email: string }
      customData: PaddleCheckoutConfig["customData"]
    }) => void
  }
}

declare global {
  interface Window {
    Paddle?: PaddleApi
    __pigmaPaddleScript?: Promise<PaddleApi>
  }
}

type FeatureMiniKind = "audit" | "layers" | "align" | "text" | "image" | "generate" | "share" | "video"

type FeatureSlideConfig = {
  id: string
  sectionTitle: string[]
  sectionLead: string
  eyebrow: string
  icon: string
  title: string
  description: string
  actions: ActionItem[]
  mini: FeatureMiniKind
}

const featureSlides: FeatureSlideConfig[] = [
  {
    id: "feature-audit",
    sectionTitle: ["오타는", "배포 전에 컷"],
    sectionLead: "상세페이지와 캠페인 카피의 오타를 콕 집어 주석으로 남기고 바로 고칩니다.",
    eyebrow: "DESIGNER PICK",
    icon: "check_circle",
    title: "검수",
    description: "상세페이지와 캠페인 카피에서 놓치기 쉬운 오타를 배포 전에 착 잡아줍니다.",
    actions: [
      { title: "오타 검수", description: "카피 실수 찾기", icon: "spellcheck", badge: "AI" },
      { title: "주석으로 공유", description: "수정 지점 전달", icon: "rate_review" },
      { title: "결과 패널", description: "후보만 빠르게 확인", icon: "fact_check" },
    ],
    mini: "audit",
  },
  {
    id: "feature-layer-cleanup",
    sectionTitle: ["복잡한 파일도", "손대기 좋게 착"],
    sectionLead: "잠긴 레이어, 컴포넌트, 긴 프레임을 정리해 받은 파일도 바로 수정각으로 만듭니다.",
    eyebrow: "DESIGNER PICK",
    icon: "layers",
    title: "레이어 정리",
    description: "외주 파일이나 복잡한 PSD를 받았을 때 정리 시간을 야무지게 줄입니다.",
    actions: [
      { title: "잠긴 레이어 해제", description: "편집 제한 해제", icon: "lock_open" },
      { title: "컴포넌트 해제", description: "수정 가능한 상태로", icon: "link_off" },
      { title: "긴 프레임 나누기", description: "작업 구간 분리", icon: "splitscreen" },
    ],
    mini: "layers",
  },
  {
    id: "feature-align",
    sectionTitle: ["반픽셀까지", "핏하게 맞추기"],
    sectionLead: "정수 픽셀, 버튼 크기, 모서리 값을 한 번에 착 정돈합니다.",
    eyebrow: "DESIGNER PICK",
    icon: "tune",
    title: "정렬/교정",
    description: "반픽셀, 들쭉날쭉한 버튼, 기울어진 요소를 한 번에 핏하게 맞춥니다.",
    actions: [
      { title: "정수 픽셀 정렬", description: "흐릿한 선 정리", icon: "grid_4x4" },
      { title: "버튼 크기 맞춤", description: "글자 길이에 맞춤", icon: "fit_screen" },
      { title: "모서리 값 정리", description: "둥글기 일괄 조정", icon: "rounded_corner" },
    ],
    mini: "align",
  },
  {
    id: "feature-text",
    sectionTitle: ["시안 안에서", "카피랑 번역까지 끝"],
    sectionLead: "번역, 오타 수정, 하이라이트, 행간 조정까지 왕복 없이 바로 처리합니다.",
    eyebrow: "DESIGNER PICK",
    icon: "text_fields",
    title: "텍스트",
    description: "카피 수정, 번역, 하이라이트, 행간 조정을 시안 안에서 한 번에 끝냅니다.",
    actions: [
      { title: "텍스트 번역", description: "다국어 시안 준비", icon: "translate", badge: "AI" },
      { title: "오타 직접 수정", description: "수정안 바로 반영", icon: "edit_note" },
      { title: "하이라이트", description: "중요 문구 강조", icon: "border_color" },
    ],
    mini: "text",
  },
  {
    id: "feature-image-fix",
    sectionTitle: ["이미지 소스랑 색상", "필요할 때 쓱"],
    sectionLead: "원본 저장, 팔레트 추출, 크롭 영역 조정을 디자인 화면에서 바로 끝냅니다.",
    eyebrow: "DESIGNER PICK",
    icon: "image",
    title: "이미지 보정",
    description: "원본 이미지 추출, 색상 팔레트 확인, 크롭 정리를 디자인 화면 안에서 쓱 처리합니다.",
    actions: [
      { title: "원본 이미지 저장", description: "소스 파일 바로 추출", icon: "download" },
      { title: "색상 추출", description: "팔레트 참고", icon: "palette" },
      { title: "크롭 영역 맞춤", description: "크롭·위치 정리", icon: "crop_free" },
    ],
    mini: "image",
  },
  {
    id: "feature-image-generate",
    sectionTitle: ["잘린 배경도", "자연스럽게 쭉"],
    sectionLead: "이미지 확장, 해상도 향상, 텍스트 추출로 시안 완성도를 끌어올립니다.",
    eyebrow: "DESIGNER PICK",
    icon: "auto_awesome",
    title: "이미지 생성/확장",
    description: "잘린 배경을 자연스럽게 늘리고, 저해상도 이미지를 시안용으로 업그레이드합니다.",
    actions: [
      { title: "이미지 영역 확장", description: "잘린 배경 확장", icon: "crop_free", badge: "AI" },
      { title: "해상도 높이기", description: "디테일 복원", icon: "high_quality", badge: "AI" },
      { title: "이미지 텍스트 추출", description: "글자 레이어화 준비", icon: "text_fields", badge: "AI" },
    ],
    mini: "generate",
  },
  {
    id: "feature-share",
    sectionTitle: ["공유 링크는", "깔끔하게 착"],
    sectionLead: "긴 URL과 프로토타입 링크를 클라이언트에게 보내기 좋게 정리합니다.",
    eyebrow: "DESIGNER PICK",
    icon: "share",
    title: "공유 준비",
    description: "길고 복잡한 Figma 링크와 프로토타입 공유를 몇 초 안에 가볍게 정리합니다.",
    actions: [
      { title: "링크 짧게 만들기", description: "공유용 URL 생성", icon: "link" },
      { title: "프로토타입 링크", description: "리뷰 링크 바로 복사", icon: "content_copy" },
      { title: "QR 코드 생성", description: "검수 링크 공유", icon: "qr_code_2" },
    ],
    mini: "share",
  },
  {
    id: "feature-video",
    sectionTitle: ["정적인 시안도", "움직이면 더 힙"],
    sectionLead: "AI 영상 생성과 GIF/APNG 변환으로 모션 시안을 빠르게 준비합니다.",
    eyebrow: "DESIGNER PICK",
    icon: "auto_awesome",
    title: "영상",
    description: "움직이는 배너와 숏폼 시안을 위해 AI 영상 생성과 GIF/APNG 변환을 준비합니다.",
    actions: [
      { title: "AI 영상 생성", description: "시안용 영상 만들기", icon: "movie", badge: "AI" },
      { title: "영상 GIF 변환", description: "가벼운 모션 공유", icon: "gif_box" },
      { title: "영상 APNG 변환", description: "투명 모션 에셋", icon: "animation" },
      { title: "썸네일 추출", description: "대표 컷 저장", icon: "image" },
    ],
    mini: "video",
  },
]

const featureActionDetails: Record<string, string> = {
  "오타 검수": "제목, 버튼, 상세 문구를 훑어 놓치기 쉬운 오타와 어색한 표현을 먼저 콕 집어줍니다.",
  "주석으로 공유": "수정 위치를 설명과 함께 남겨 디자이너나 클라이언트가 바로 확인하게 합니다.",
  "결과 패널": "검수 결과를 한 곳에 모아 보여줘서, 화면을 다시 뒤지지 않고 필요한 항목만 고칠 수 있습니다.",
  "잠긴 레이어 해제": "편집이 막힌 레이어를 풀어 바로 수정할 수 있는 상태로 바꿉니다.",
  "컴포넌트 해제": "컴포넌트로 묶인 구조를 풀어 텍스트와 이미지를 따로 손볼 수 있게 만듭니다.",
  "긴 프레임 나누기": "긴 화면이나 상세페이지를 작업하기 좋은 구간으로 쪼개 관리하기 쉽게 정리합니다.",
  "정수 픽셀 정렬": "반픽셀 때문에 흐려지는 선과 박스를 정수 좌표로 맞춰 선명하게 정리합니다.",
  "버튼 크기 맞춤": "글자 길이에 맞춰 여백과 크기를 정돈해 버튼을 딱 맞게 맞춥니다.",
  "모서리 값 정리": "제각각인 둥글기 값을 한 기준으로 맞춰 화면 톤을 깔끔하게 잡습니다.",
  "텍스트 번역": "원본 레이아웃을 보면서 다국어 문구를 넣고, 시안 확인용 번역본을 빠르게 만듭니다.",
  "오타 직접 수정": "발견한 오타나 문구 수정안을 해당 텍스트에 바로 반영해 수정 왕복을 줄입니다.",
  "하이라이트": "중요한 문구나 확인할 영역을 표시해 리뷰할 사람이 먼저 볼 포인트를 알려줍니다.",
  "원본 이미지 저장": "PSD나 문서 안에 묻힌 이미지를 따로 꺼내 다시 쓸 수 있게 저장합니다.",
  "색상 추출": "시안에 쓰인 주요 색을 뽑아 팔레트처럼 확인하고 브랜드 컬러 기준을 맞춥니다.",
  "크롭 영역 맞춤": "이미지의 크롭 위치와 보이는 범위를 정리해 어긋난 부분을 딱 맞춥니다.",
  "이미지 영역 확장": "부족한 배경이나 잘린 이미지를 자연스럽게 늘려 배너와 상세페이지에 맞게 채웁니다.",
  "해상도 높이기": "작게 받았거나 흐린 이미지를 더 선명하게 만들어 시안이나 공유용으로 쓰기 좋게 합니다.",
  "이미지 텍스트 추출": "이미지 안의 글자를 뽑아 편집 가능한 텍스트 레이어로 바꿀 준비를 합니다.",
  "링크 짧게 만들기": "긴 Figma나 리뷰 URL을 보기 쉬운 링크로 줄여 메신저나 메일에 깔끔하게 보냅니다.",
  "프로토타입 링크": "클릭 가능한 화면 흐름을 바로 공유할 수 있게 프로토타입 링크를 빠르게 복사합니다.",
  "QR 코드 생성": "리뷰 링크를 QR 코드로 만들어 모바일에서도 바로 열어보게 합니다.",
  "AI 영상 생성": "정적인 시안을 바탕으로 간단한 움직임 예시나 영상 시안을 만들어 봅니다.",
  "영상 GIF 변환": "무거운 영상 대신 메신저와 문서에 넣기 쉬운 GIF로 가볍게 바꿉니다.",
  "영상 APNG 변환": "투명 배경이 필요한 움직이는 에셋을 APNG로 준비해 디자인에 붙이기 쉽게 합니다.",
  "썸네일 추출": "영상이나 움직이는 결과물에서 대표 장면을 골라 썸네일 이미지로 저장합니다.",
}

const aiActions: ActionItem[] = [
  {
    title: "무드 살리기",
    description: "방향성 빠르게 체크",
    icon: "help_outline",
    primary: true,
    badge: "AI",
  },
  {
    title: "급한 수정 3개",
    description: "우선순위만 착 정리",
    icon: "playlist_add_check",
  },
  {
    title: "카피 톤 맞추기",
    description: "문장 결 살짝 정돈",
    icon: "chat_bubble_outline",
  },
]

const workflowSteps = [
  {
    number: "01",
    title: "쓱 가져오기",
    description: "PSD, AI, EPS, PDF, PPT, SVG를 불러옵니다.",
    icon: "file_upload",
    active: true,
  },
  {
    number: "02",
    title: "착 정리하기",
    description: "레이어와 텍스트를 다루기 쉽게 정돈합니다.",
    icon: "layers",
  },
  {
    number: "03",
    title: "딱 보정하기",
    description: "검수, 오타 수정, 이미지 보정을 필요한 만큼 적용합니다.",
    icon: "tune",
  },
  {
    number: "04",
    title: "바로 공유하기",
    description: "링크로 공유하고 반복 기준을 저장합니다.",
    icon: "share",
  },
]

const workflowLayerRows = [
  { number: "01", label: "Header / nav", color: "bg-[#111]", width: "w-[170px]" },
  { number: "02", label: "Hero text", color: "bg-[#4b5563]", width: "w-[134px]" },
  { number: "03", label: "CTA button", color: "bg-[#006bff]", width: "w-[150px]", active: true },
  { number: "04", label: "Images", color: "bg-[#7a828b]", width: "w-[118px]" },
  { number: "05", label: "Plugin notes", color: "bg-[#a6adb5]", width: "w-[150px]" },
]

const qualityPoints = [
  { label: "레이어", value: "그룹/순서 정리", icon: "layers" },
  { label: "텍스트", value: "편집 가능한 텍스트", icon: "text_fields" },
  { label: "이미지", value: "깨진 이미지 보정", icon: "image" },
  { label: "효과", value: "효과 분리 확인", icon: "auto_fix_high" },
]

const useCases: UseCase[] = [
  {
    title: "묵은 PSD 살리기",
    description: "예전 원본을 Figma에서 다시 만질 때",
    icon: "history",
  },
  {
    title: "외주 파일 정돈",
    description: "받은 파일을 팀 기준으로 정돈할 때",
    icon: "folder_open",
  },
  {
    title: "급한 배너 갈아끼우기",
    description: "문구와 이미지만 빠르게 바꿔야 할 때",
    icon: "campaign",
  },
  {
    title: "상세페이지 다시 손보기",
    description: "PSD 산출물을 다시 쪼개고 고칠 때",
    icon: "storefront",
  },
  {
    title: "브랜드 템플릿 핏 맞추기",
    description: "반복되는 디자인 기준을 맞출 때",
    icon: "palette",
  },
  {
    title: "빠진 요소 체크",
    description: "텍스트와 이미지 깨짐을 확인할 때",
    icon: "check_circle",
  },
  {
    title: "레이어 이름 정돈",
    description: "복잡한 그룹명을 읽기 쉽게 바꿀 때",
    icon: "edit",
  },
  {
    title: "텍스트 다시 쓰기",
    description: "래스터 글자를 편집 가능한 텍스트로 바꿀 때",
    icon: "text_fields",
  },
  {
    title: "이미지 배경 늘리기",
    description: "부족한 배경 영역을 자연스럽게 늘릴 때",
    icon: "open_in_full",
  },
  {
    title: "썸네일 여러 개 뽑기",
    description: "같은 구조로 여러 사이즈를 만들 때",
    icon: "grid_view",
  },
  {
    title: "PPT/PDF 다시 편집",
    description: "문서형 디자인을 다시 편집할 때",
    icon: "description",
  },
  {
    title: "캠페인 소재 스왑",
    description: "시즌 문구와 이미지를 빠르게 바꿀 때",
    icon: "shuffle",
  },
  {
    title: "팀 리뷰 세팅",
    description: "공유 전에 기준대로 정리할 때",
    icon: "playlist_add_check",
  },
  {
    title: "AI 수정각 보기",
    description: "화면을 기준으로 보정 방향을 정할 때",
    icon: "auto_awesome",
  },
  {
    title: "반복 작업 저장",
    description: "자주 쓰는 변환 기준을 저장할 때",
    icon: "tune",
  },
]

const plans: PricingPlan[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    description: "일단 가볍게 찍먹. 작은 파일로 변환 흐름부터 확인해요.",
    features: [
      { label: "무료 베타 PSD 무제한", badge: "HOT" },
      { label: "베타 기간 PSD 무제한 변환" },
      { label: "파일 구조 확인" },
      { label: "작은 파일 테스트" },
      { label: "무료 계정 저장" },
    ],
    cta: "무료 시작",
  },
  {
    key: "basic",
    name: "Basic",
    price: "$2/mo",
    description: "혼자 작업할 때 자주 쓰는 정리 기능을 야무지게 담았어요.",
    features: [
      { label: "잠긴 레이어 해제", badge: "HOT" },
      { label: "긴 프레임 나누기", badge: "HOT" },
      { label: "월 50회 PSD 변환" },
      { label: "컴포넌트 해제" },
      { label: "숨긴 레이어 삭제" },
      { label: "가이드 전체 삭제" },
      { label: "정수 픽셀 교정" },
      { label: "버튼 자동 맞춤" },
      { label: "모서리 정리" },
      { label: "기울기 보정" },
      { label: "텍스트 하이라이트" },
      { label: "텍스트 행간 조정" },
      { label: "이미지 색상 추출" },
      { label: "GIF/APNG 변환" },
    ],
    cta: "Basic 선택",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$5/mo",
    description: "Basic 기능에 AI 검수와 고급 이미지 작업까지 얹은 본격 작업용 플랜이에요.",
    includedPrefix: "Basic 기능 + AI까지",
    features: [
      { label: "월 300회 PSD 변환", badge: "HOT" },
      { label: "오타 검수/직접 수정", badge: "NEW" },
      { label: "텍스트 번역", badge: "NEW" },
      { label: "디자인 읽기/검수" },
      { label: "디자인 일관성 검사" },
      { label: "이미지 텍스트 추출" },
      { label: "참고 이미지 검색" },
      { label: "이미지 프롬프트 편집" },
      { label: "이미지 영역 확장" },
      { label: "이미지 업스케일" },
      { label: "오브젝트 업스케일" },
      { label: "고급 자동화 준비" },
    ],
    cta: "Pro 선택",
  },
]

const fileTypes = ["PSD", "AI", "EPS", "PDF", "PPT", "SVG"]

const conversionSourceRows = [
  { label: "Hero copy merged", width: "w-[190px]", color: "bg-[#d8dce0]" },
  { label: "Text raster 02", width: "w-[172px]", color: "bg-[#d8dce0]" },
  { label: "Layer 144", width: "w-[154px]", color: "bg-[#d8dce0]" },
  { label: "Shadow merged", width: "w-[136px]", color: "bg-[#8c9298]" },
]

const conversionAfterItems = [
  { title: "레이어 구조 유지", body: "Header / Hero / CTA" },
  { title: "편집 가능한 텍스트", body: "글자 수정 가능" },
  { title: "이미지와 효과 정리", body: "보정 포인트 분리" },
  { title: "플러그인 보정 연결", body: "검수와 정리 바로 실행" },
]

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#050505]">
      <SiteHeaderAuthenticated />
      <HeroSection />
      <AiChatSection />
      <WorkflowSection />
      <FileImportSection />
      <UseCasesSection />
      <PricingSection />
      <FinalCta />
      <SiteFooter />
    </main>
  )
}

function useSessionUser() {
  const [user, setUser] = useState<HeaderUser | null>(null)

  useEffect(() => {
    let active = true

    fetch("/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((data: { user?: HeaderUser | null }) => {
        if (active) {
          setUser(data.user || null)
        }
      })
      .catch(() => {
        if (active) {
          setUser(null)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return user
}

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-icons-round select-none ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-6 sm:px-10 md:grid md:h-[104px] md:grid-cols-[148px_1fr_auto] lg:px-12">
        <a
          href="#top"
          className="flex items-center text-black"
          aria-label="PIGER 홈"
        >
          <PigmaLogo className="h-[18px] w-auto md:h-[19px]" />
        </a>
        <nav className="hidden items-center justify-start gap-14 pl-7 text-base font-bold text-[#0a0a0a] md:flex">
          <a href="#product" className="transition hover:text-[#005bff]">
            제품
          </a>
          <a href="#features" className="transition hover:text-[#005bff]">
            기능
          </a>
          <a href="#pricing" className="transition hover:text-[#005bff]">
            가격
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-5">
          <LanguageSwitch current="ko" />
          <a href="/login" className="hidden font-bold text-[#0a0a0a] transition hover:text-[#005bff] sm:inline-flex">
            로그인
          </a>
          <a
            href="/signup"
            className="inline-flex h-12 min-w-[92px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-4 text-sm sm:min-w-[116px] sm:px-5 font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0] md:h-14 md:min-w-[132px] md:rounded-2xl md:px-7 md:text-base"
          >
            시작하기
            <MaterialIcon name="arrow_forward" className="text-[16px]" />
          </a>
        </div>
      </div>
    </header>
  )
}

function SiteHeaderAuthenticated() {
  const user = useSessionUser()

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-6 sm:px-10 md:grid md:h-[104px] md:grid-cols-[148px_1fr_auto] lg:px-12">
        <a href="#top" className="flex items-center text-black" aria-label="PIGER 홈">
          <PigmaLogo className="h-[18px] w-auto md:h-[19px]" />
        </a>

        <nav className="hidden items-center justify-start gap-14 pl-7 text-base font-bold text-[#0a0a0a] md:flex">
          <a href="#product" className="transition hover:text-[#005bff]">
            제품
          </a>
          <a href="#features" className="transition hover:text-[#005bff]">
            기능
          </a>
          <a href="#pricing" className="transition hover:text-[#005bff]">
            가격
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-5">
          <LanguageSwitch current="ko" />
          {user ? (
            <>
              <a href="/dashboard" className="hidden font-bold text-[#0a0a0a] transition hover:text-[#005bff] sm:inline-flex">
                <span className="inline-flex items-center gap-2.5">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Profile photo"
                      className="size-8 rounded-full object-cover ring-1 ring-black/5"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#eef5ff] text-xs font-black text-[#005bff] ring-1 ring-[#d5e6ff]">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span>{user.name}님</span>
                </span>
              </a>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex h-12 min-w-[92px] items-center justify-center gap-2 rounded-xl bg-[#050505] px-4 text-sm sm:min-w-[116px] sm:px-5 font-bold text-white shadow-[0_10px_14px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-[#1c1c1c] md:h-14 md:min-w-[132px] md:rounded-2xl md:px-7 md:text-base"
                >
                  로그아웃
                  <MaterialIcon name="logout" className="text-[16px]" />
                </button>
              </form>
            </>
          ) : (
            <>
              <a href="/login" className="hidden font-bold text-[#0a0a0a] transition hover:text-[#005bff] sm:inline-flex">
                로그인
              </a>
              <a
                href="/signup"
                className="inline-flex h-12 min-w-[92px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-4 text-sm sm:min-w-[116px] sm:px-5 font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0] md:h-14 md:min-w-[132px] md:rounded-2xl md:px-7 md:text-base"
              >
                시작하기
                <MaterialIcon name="arrow_forward" className="text-[16px]" />
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function LanguageSwitch({ current }: { current: LocaleCode }) {
  const items: Array<{ code: LocaleCode; label: string; href: string }> = [
    { code: "ko", label: "KO", href: "/?lang=ko" },
    { code: "en", label: "EN", href: "/en?lang=en" },
    { code: "ja", label: "JP", href: "/ja?lang=ja" },
    { code: "es", label: "ES", href: "/es?lang=es" },
    { code: "pt-br", label: "BR", href: "/pt-br?lang=pt-br" },
  ]

  return (
    <div className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#f1f4f8] p-1 text-[9px] font-black text-[#5f6670] ring-1 ring-[#e1e7f0] sm:h-10 sm:text-xs">
      {items.map((item) => (
        <a
          key={item.code}
          href={item.href}
          aria-current={current === item.code ? "page" : undefined}
          className={
            current === item.code
              ? "inline-flex h-7 min-w-6 items-center justify-center rounded-full bg-[#050505] px-1.5 text-white shadow-[0_6px_14px_rgba(15,24,42,0.14)] sm:h-8 sm:min-w-8 sm:px-2"
              : "inline-flex h-7 min-w-6 items-center justify-center rounded-full px-1.5 transition hover:text-[#005bff] sm:h-8 sm:min-w-8 sm:px-2"
          }
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}

function PigmaLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/assets/piger-wordmark.svg"
      alt="PIGER"
      className={className}
      width={100}
      height={20}
    />
  )
}

function HeroDemoVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const replayDelayRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (replayDelayRef.current !== null) {
        window.clearTimeout(replayDelayRef.current)
      }
    }
  }, [])

  function replayAfterDelay() {
    if (replayDelayRef.current !== null) {
      window.clearTimeout(replayDelayRef.current)
    }

    replayDelayRef.current = window.setTimeout(() => {
      const video = videoRef.current

      if (!video) {
        return
      }

      video.currentTime = 0
      void video.play()
    }, 3000)
  }

  return (
    <video
      ref={videoRef}
      src="/assets/psd-figma-demo.mp4"
      className="block aspect-video h-auto w-full object-cover mix-blend-multiply"
      autoPlay
      muted
      playsInline
      preload="metadata"
      style={{ mixBlendMode: "multiply" }}
      aria-hidden="true"
      onEnded={replayAfterDelay}
    />
  )
}

function HeroSection() {
  return (
    <section id="top" className="bg-white px-6 pb-20 pt-0 sm:px-10 lg:px-12">
      <div className="mx-auto -mt-12 max-w-[1120px] text-center">
        <div className="pointer-events-none relative z-0 mx-auto w-[80%] max-w-[784px] overflow-hidden select-none">
          <HeroDemoVideo />
        </div>
        <div className="relative z-10 -mt-16">
          <p className="mx-auto mb-7 flex h-10 w-[240px] items-center justify-center rounded-[10px] text-[13px] font-black text-[#0a0a0a]">
            FIG EXPORT TO PSD
          </p>
          <h1 className="mx-auto max-w-[1120px] text-[38px] font-black leading-[1.12] text-black sm:text-[52px] lg:text-[64px]">
            PIGER로
            <br />
            FIG를 PSD로 쓱 내보내기
          </h1>
          <p className="mx-auto mt-7 max-w-[760px] text-[17px] leading-8 text-[#5f6368] sm:text-[19px]">
            Figma 작업물을 PSD로 넘길 때 필요한 과정만 가볍게 정리합니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={FIGMA_PLUGIN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#005bff] px-6 text-[15px] font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0] sm:w-[170px]"
            >
              무료 시작
              <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </a>
            <a
              href="#pricing"
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-bold text-[#0a0a0a] shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 sm:w-[180px]"
            >
              <MaterialIcon name="attach_money" className="text-[16px]" />
              가격 보기
            </a>
          </div>
        </div>
        <HeroWorkspace />
      </div>
    </section>
  )
}

function HeroWorkspace() {
  const conversionProgress = useAnimatedConversionProgress()
  const exportOptionsReady = conversionProgress === 100

  return (
    <div
      id="product"
      className="mt-[52px] w-full overflow-hidden rounded-2xl bg-white text-left shadow-[0_14px_40px_rgba(0,0,0,0.04)]"
    >
      <div className="flex h-11 items-center gap-2 bg-[#090909] px-5 text-white">
        <span className="size-2.5 rounded-full bg-[#ff6b5a]" />
        <span className="size-2.5 rounded-full bg-[#ffd166]" />
        <span className="size-2.5 rounded-full bg-[#21c55d]" />
        <span className="ml-3 inline-flex items-center gap-2 text-sm">
          <PigmaLogo className="h-[10px] w-auto brightness-0 invert" />
          export workspace
        </span>
        <span className="ml-auto hidden text-[11px] text-white/80 md:inline">
          source.fig -&gt; <PigmaLogo className="inline-block h-[8px] w-auto brightness-0 invert" /> -&gt; exported psd
        </span>
      </div>
      <div className="grid min-w-0 gap-5 p-7 lg:grid-cols-[300px_1fr_302px]">
        <div className="rounded-[14px] bg-white p-5 ring-1 ring-black/5">
          <div className="mb-5 flex items-center gap-3 text-[#0a0a0a]">
            <MaterialIcon name="description" className="text-[20px]" />
            <strong className="text-sm">source.fig</strong>
          </div>
          {["Header / Menu", "Hero / Text", "Button / CTA", "Effects / Shadow"].map((item) => (
            <div key={item} className="mt-2 flex items-center gap-3 text-xs text-[#7a7f85]">
              <span className="size-2 rounded-[2px] bg-[#d9dde1]" />
              {item}
            </div>
          ))}
        </div>
        <div className="rounded-[14px] bg-[#f3f4f6] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <MaterialIcon name="autorenew" className="text-[24px] text-[#0a0a0a]" />
              <h2 className="text-[22px] font-black leading-none">자동 내보내기</h2>
            </div>
            <AnimatedConversionProgressValue progress={conversionProgress} className="text-4xl" />
          </div>
          <AnimatedConversionProgressBar progress={conversionProgress} className="mt-5" />
          <p className="mt-4 text-[13px] font-medium text-[#0a0a0a]">
            레이어, 텍스트, 효과를 PSD로 내보낼 수 있게 정리
          </p>
        </div>
        <div className="rounded-[14px] bg-white p-5 ring-1 ring-black/5">
          <div className="mb-4 flex items-center gap-3">
            <MaterialIcon name="ios_share" className="text-[20px]" />
            <strong className="text-lg">내보내기 준비</strong>
          </div>
          {["레이어 유지", "텍스트 편집", "팀 공유 준비"].map((item) => (
            <div key={item} className="flex h-[30px] items-center justify-between text-[15px] text-[#5f6368]">
              <span>{item}</span>
              <ConversionOptionToggle enabled={exportOptionsReady} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ConversionOptionToggle({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={
        enabled
          ? "relative inline-flex h-[22px] w-[54px] shrink-0 items-center rounded-full bg-[#111] text-[6.5px] font-black text-white transition-colors duration-200"
          : "relative inline-flex h-[22px] w-[54px] shrink-0 items-center rounded-full bg-[#d8dee8] text-[6.5px] font-black text-[#657082] transition-colors duration-200"
      }
      aria-label={enabled ? "ON" : "OFF"}
    >
      <span
        className={
          enabled
            ? "absolute right-[3px] size-4 rounded-full bg-white transition-all duration-200"
            : "absolute left-[3px] size-4 rounded-full bg-white transition-all duration-200"
        }
      />
    </span>
  )
}

function useAnimatedConversionProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduceMotion) {
      setProgress(100)
      return
    }

    const fillDuration = 3000
    const holdDuration = 5000
    const cycleDuration = fillDuration + holdDuration
    let frame = 0
    let cycleStart = performance.now()

    const tick = (now: number) => {
      const elapsed = (now - cycleStart) % cycleDuration
      const nextProgress = elapsed <= fillDuration ? Math.round((elapsed / fillDuration) * 100) : 100

      setProgress(nextProgress)

      if (elapsed < 16 && now - cycleStart > cycleDuration) {
        cycleStart = now
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frame)
  }, [])

  return progress
}

function AnimatedConversionProgressValue({ progress, className = "" }: { progress: number; className?: string }) {
  return <strong className={`${className} font-black tabular-nums`}>{progress}%</strong>
}

function AnimatedConversionProgressBar({ progress, className = "" }: { progress: number; className?: string }) {
  return (
    <div className={`${className} rounded-full bg-white p-1`}>
      <div
        className="h-1.5 rounded-full bg-[#005bff]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function AiChatSection() {
  return (
    <section id="features" className="bg-[#050505] px-6 py-20 text-white sm:px-10 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-[1248px]">
        <p className="text-center text-[13px] font-black tracking-[0.18em] text-white/45">PLUGIN MENU</p>
        <h2 className="mx-auto mt-5 max-w-[760px] text-center text-[34px] font-black leading-[1.2] sm:text-[46px]">
          자주 쓰는 PIGER 도구, 한눈에 착
        </h2>
        <p className="mx-auto mt-5 max-w-[620px] text-center text-[15px] leading-7 text-white/62">
          검수, 정리, 보정, 공유까지 작업 중 바로 꺼내 쓰기 좋게 모았습니다.
        </p>
        <FeatureActionGrid />
      </div>
    </section>
  )
}

function FeatureActionGrid() {
  const items = featureSlides.flatMap((slide) =>
    slide.actions.map((action) => ({
      ...action,
      category: slide.title,
      sourceId: slide.id,
    })),
  )

  return (
    <div className="mt-12 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, index) => (
        <article
          key={`${item.sourceId}-${item.title}`}
          tabIndex={0}
          className="group relative min-h-[162px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.075] p-[18px] text-left outline-none transition duration-200 hover:-translate-y-1 hover:border-white hover:bg-white focus:-translate-y-1 focus:border-white focus:bg-white"
        >
          <div className="transition duration-200 group-hover:-translate-y-2 group-hover:opacity-0 group-focus:-translate-y-2 group-focus:opacity-0">
            <div className="flex items-start">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#050505]">
                <MaterialIcon name={item.icon} className="text-[21px]" />
              </span>
            </div>
            <p className="mt-4 text-[11px] font-black leading-4 text-[#6ea8ff]">{item.category}</p>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 break-keep text-[17px] font-black leading-6 text-white">{item.title}</h3>
              {item.badge ? (
                <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#005bff] px-2 text-[9px] font-black leading-none text-white">
                  {item.badge}
                </span>
              ) : (
                <span className="shrink-0 text-[9px] font-black leading-none text-white/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
            </div>
            <p className="mt-2 break-keep text-[12.5px] leading-5 text-white/62">{item.description}</p>
          </div>
          <p className="pointer-events-none absolute inset-0 flex translate-y-3 items-center px-5 text-[14px] font-bold leading-6 text-[#050505] opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
            {featureActionDetails[item.title] || item.description}
          </p>
        </article>
      ))}
    </div>
  )
}

function FeatureSlide({
  id,
  eyebrow,
  icon,
  title,
  description,
  actions,
  mini,
  index,
  total,
}: FeatureSlideConfig & { index: number; total: number }) {
  return (
    <article
      id={id}
      className="relative h-[406px] w-full min-w-full shrink-0 overflow-hidden rounded-lg border border-[#e7ecf3] bg-white text-left shadow-[0_18px_34px_-18px_rgba(15,24,42,0.10)]"
    >
      <MaterialIcon name={icon} className="absolute left-10 top-11 text-[28px] leading-7 text-[#006bff]" />
      <div className="absolute left-[78px] top-[50px] text-[13px] font-medium leading-4 text-[#273142]">{eyebrow}</div>
      <div className="absolute left-[412px] top-[50px] w-[74px] text-right text-[12px] font-bold leading-4 text-[#9ca3af]">
        {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <h3 className="absolute left-10 top-24 h-[46px] w-[340px] text-[34px] font-black leading-[42px] text-[#111827]">
        {title}
      </h3>
      <p className="absolute left-10 top-[158px] h-[62px] w-[414px] text-[17px] leading-7 text-[#4b5563]">
        {description}
      </p>

      <div className="absolute left-[524px] top-[54px] grid w-[178px] gap-[10px]">
        {actions.map((action, actionIndex) => (
          <ActionButton key={`${id}-${action.title}`} action={{ ...action, primary: action.primary ?? actionIndex === 0 }} />
        ))}
      </div>
      <FeatureMiniPreview kind={mini} />
    </article>
  )
}

function FeatureMiniPreview({ kind }: { kind: FeatureMiniKind }) {
  switch (kind) {
    case "audit":
      return <AuditMiniPreview />
    case "layers":
      return <LayerMiniPreview />
    case "align":
      return <AlignMiniPreview />
    case "text":
      return <TextMiniPreview />
    case "image":
      return <ImageMiniPreview />
    case "generate":
      return <GenerateMiniPreview />
    case "share":
      return <ShareMiniPreview />
    case "video":
      return <VideoMiniPreview />
  }
}

function MiniPreviewShell({ children }: { children: ReactNode }) {
  return (
    <div className="absolute left-[68px] top-[264px] h-[124px] w-[610px] rounded-[10px] border border-[#d8e3ef] bg-[#f8fafc]">
      {children}
    </div>
  )
}

function MiniHeading({ children }: { children: ReactNode }) {
  return <p className="absolute left-6 top-[17px] text-[12px] font-bold leading-[14px] text-[#111827]">{children}</p>
}

function AuditMiniPreview() {
  return (
    <MiniPreviewShell>
      <MiniHeading>카피 검수</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[260px] rounded-lg border border-[#d8e3ef] bg-white">
        <span className="absolute left-[22px] top-[13px] h-[6px] w-[92px] rounded-full bg-[#111]" />
        <span className="absolute left-[22px] top-[28px] h-[5px] w-[170px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[22px] top-[42px] h-[5px] w-[156px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[111px] top-[40px] h-2.5 w-[69px] rounded-full bg-[#ffe2e5]" />
        <span className="absolute left-[111px] top-[53px] h-1 w-[69px] rounded-full bg-[#ff4d55]" />
      </div>
      <span className="absolute left-[283px] top-[58px] flex h-[19px] w-[25px] items-center justify-center rounded-full bg-[#ff4d55] text-[12px] font-black leading-none text-white">
        !
      </span>
      <div className="absolute left-[330px] top-[45px] h-16 w-[238px] rounded-lg border border-[#cfe0ff] bg-white">
        <strong className="absolute left-5 top-[10px] text-[11px] leading-[11px] text-[#111827]">오타 후보</strong>
        <span className="absolute left-[108px] top-2 flex h-[17px] w-[30px] items-center justify-center rounded-full bg-[#006bff] text-[9px] font-black text-white">
          3
        </span>
        {[0, 1, 2].map((row) => (
          <div key={row} className="absolute left-[25px] flex h-3 items-center gap-3" style={{ top: `${28 + row * 11}px` }}>
            <span className={row < 2 ? "flex size-[11px] items-center justify-center rounded-[3px] bg-[#27b36a] text-white" : "size-[11px] rounded-[3px] border border-[#c6d0da]"}>{row < 2 ? <MaterialIcon name="check" className="text-[8px]" /> : null}</span>
            <span className="h-1 rounded-full bg-[#c6d0da]" style={{ width: `${114 - row * 17}px` }} />
          </div>
        ))}
      </div>
    </MiniPreviewShell>
  )
}

function LayerMiniPreview() {
  return (
    <MiniPreviewShell>
      <MiniHeading>레이어 정리</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[208px] rounded-lg bg-[#111]">
        <strong className="absolute left-5 top-[10px] text-[8px] leading-[10px] text-white">복잡한 파일</strong>
        <span className="absolute left-[22px] top-[28px] size-2 rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[38px] top-[30px] h-1.5 w-[96px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[22px] top-[44px] size-2 rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[38px] top-[46px] h-1.5 w-[128px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[60px] top-[56px] size-2 rounded-full bg-[#006bff]" />
        <span className="absolute left-[76px] top-[58px] h-1.5 w-[104px] rounded-full bg-[#006bff]" />
        <span className="absolute right-5 top-[38px] text-[8px] text-[#c6d0da]">잠금</span>
      </div>
      <MaterialIcon name="arrow_forward" className="absolute left-[270px] top-[69px] text-[18px] text-[#006bff]" />
      <div className="absolute left-[292px] top-[51px] grid gap-2">
        <span className="flex h-[18px] w-12 items-center justify-center rounded-full bg-[#006bff] text-[8px] font-bold text-white">해제</span>
        <span className="flex h-[18px] w-12 items-center justify-center rounded-full bg-[#27b36a] text-[8px] font-bold text-white">분리</span>
      </div>
      <div className="absolute left-[367px] top-[43px] h-[66px] w-[201px] rounded-lg border border-[#cfe0ff] bg-white">
        <strong className="absolute left-5 top-[10px] text-[8px] leading-[10px] text-[#111827]">정리된 레이어</strong>
        <span className="absolute left-5 top-[27px] h-1.5 w-[118px] rounded-full bg-[#006bff]" />
        <span className="absolute left-[145px] top-[27px] h-1.5 w-6 rounded-full bg-[#27b36a]" />
        {[0, 1, 2].map((row) => (
          <span key={row} className="absolute left-5 h-1.5 rounded-full bg-[#c6d0da]" style={{ top: `${38 + row * 10}px`, width: `${98 - row * 14}px` }} />
        ))}
        {[0, 1, 2].map((row) => (
          <span key={row} className="absolute left-[145px] h-1.5 w-6 rounded-full bg-[#c6d0da]" style={{ top: `${38 + row * 10}px` }} />
        ))}
      </div>
    </MiniPreviewShell>
  )
}

function AlignMiniPreview() {
  return (
    <MiniPreviewShell>
      <MiniHeading>픽셀 교정</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[318px] rounded-lg border border-[#d8e3ef] bg-white">
        {[36, 88, 140, 192, 244].map((left) => (
          <span key={left} className="absolute top-2 h-[50px] w-px bg-[#d8e3ef]" style={{ left }} />
        ))}
        {[17, 34, 51].map((top) => (
          <span key={top} className="absolute left-0 h-px w-full bg-[#e7ecf3]" style={{ top }} />
        ))}
        <span className="absolute left-9 top-[20px] h-5 w-[54px] rounded bg-[#cfd7df]" />
        <span className="absolute left-[122px] top-8 h-5 w-[54px] rounded bg-[#cfd7df]" />
        <span className="absolute left-[204px] top-[23px] h-[22px] w-[52px] rounded-md bg-[#111]" />
        <span className="absolute left-[268px] top-[23px] h-[22px] w-[52px] rounded-md bg-[#006bff]" />
      </div>
      <span className="absolute left-[370px] top-[66px] text-[8px] font-bold text-[#006bff]">1px</span>
      <div className="absolute left-[402px] top-[51px] h-11 w-[166px] rounded-lg border border-[#cfe0ff] bg-white">
        <strong className="absolute left-4 top-2.5 text-[8px] leading-[10px] text-[#111827]">버튼 자동 맞춤</strong>
        <span className="absolute left-4 top-[28px] size-2 rounded-[2px] bg-[#27b36a]" />
        <span className="absolute left-[30px] top-[30px] h-1.5 w-[98px] rounded-full bg-[#006bff]" />
        <span className="absolute left-[136px] top-[28px] size-2 rounded-[2px] bg-[#27b36a]" />
      </div>
    </MiniPreviewShell>
  )
}

function TextMiniPreview() {
  return (
    <MiniPreviewShell>
      <MiniHeading>텍스트 정리</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[205px] rounded-lg border border-[#d8e3ef] bg-white">
        <span className="absolute left-[18px] top-[12px] text-[7px] font-bold text-[#9ca3af]">KR</span>
        <span className="absolute left-[18px] top-[28px] h-1.5 w-[108px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[18px] top-[43px] h-1.5 w-[132px] rounded-full bg-[#ffe2e5]" />
        <span className="absolute left-[18px] top-[55px] h-[3px] w-[132px] rounded-full bg-[#ff4d55]" />
      </div>
      <MaterialIcon name="arrow_forward" className="absolute left-[268px] top-[68px] text-[18px] text-[#111]" />
      <div className="absolute left-[291px] top-[50px] grid gap-2">
        <span className="flex h-[18px] w-[58px] items-center justify-center rounded-full bg-[#006bff] text-[8px] font-bold text-white">번역</span>
        <span className="flex h-[18px] w-[58px] items-center justify-center rounded-full bg-[#111] text-[8px] font-bold text-white">행간</span>
      </div>
      <div className="absolute left-[367px] top-[43px] h-[66px] w-[201px] rounded-lg border border-[#cfe0ff] bg-white">
        <span className="absolute left-5 top-[13px] text-[7px] font-bold text-[#006bff]">EN</span>
        <span className="absolute left-5 top-[28px] h-1.5 w-[128px] rounded-full bg-[#111]" />
        <span className="absolute left-5 top-[40px] h-1.5 w-[148px] rounded-full bg-[#ffd45a]" />
        <span className="absolute left-5 top-[52px] h-1.5 w-[92px] rounded-full bg-[#c6d0da]" />
        <span className="absolute right-[28px] top-[19px] h-[42px] w-[3px] rounded-full bg-[#006bff]" />
      </div>
    </MiniPreviewShell>
  )
}

function ImageMiniPreview() {
  return (
    <MiniPreviewShell>
      <MiniHeading>이미지 소스</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[178px] rounded-lg border-2 border-[#006bff] bg-[#eaf3ff]">
        <div className="absolute left-[16px] top-[11px] h-6 w-[144px] rounded bg-[#d7ecff]" />
        <div className="absolute left-[16px] top-[34px] h-5 w-[144px] rounded bg-[#d7f8df]" />
        <span className="absolute left-[47px] top-[18px] h-[36px] w-[46px] rounded bg-[#1f2328]" />
        <span className="absolute right-[18px] top-[15px] size-3 rounded-full bg-[#ffd45a]" />
      </div>
      <MaterialIcon name="arrow_forward" className="absolute left-[252px] top-[68px] text-[18px] text-[#006bff]" />
      <div className="absolute left-[350px] top-[45px] h-[62px] w-[218px] rounded-lg border border-[#d8e3ef] bg-white">
        <strong className="absolute left-5 top-3 text-[8px] leading-[10px] text-[#111827]">원본 + 팔레트</strong>
        <span className="absolute right-[28px] top-2 flex h-[17px] w-12 items-center justify-center rounded-full bg-[#111] text-[8px] font-black text-white">PNG</span>
        {["#006bff", "#27b36a", "#ffd45a"].map((color, index) => (
          <span key={color} className="absolute top-[34px] size-[18px] rounded-full" style={{ left: `${25 + index * 31}px`, backgroundColor: color }} />
        ))}
        <span className="absolute left-[128px] top-[39px] h-1.5 w-[74px] rounded-full bg-[#c6d0da]" />
      </div>
    </MiniPreviewShell>
  )
}

function GenerateMiniPreview() {
  return (
    <MiniPreviewShell>
      <MiniHeading>AI 이미지 확장</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[302px] rounded-lg border border-[#cfe0ff] bg-white">
        <div className="absolute left-4 top-3 h-9 w-[112px] rounded bg-[#eef6ff]">
          {[0, 1, 2, 3].map((dot) => (
            <span key={dot} className="absolute size-[5px] rounded-full bg-[#d8eaff]" style={{ left: `${18 + dot * 32}px`, top: dot % 2 ? 25 : 10 }} />
          ))}
        </div>
        <span className="absolute left-[93px] top-3 h-9 w-[94px] rounded bg-[#111]" />
        <span className="absolute left-[89px] top-3 h-9 w-1 rounded-full bg-[#006bff]" />
        <span className="absolute left-[190px] top-3 h-9 w-1 rounded-full bg-[#006bff]" />
        <div className="absolute left-[196px] top-3 h-9 w-[88px] rounded bg-[#eef6ff]">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="absolute size-[5px] rounded-full bg-[#d8eaff]" style={{ left: `${18 + dot * 28}px`, top: dot % 2 ? 25 : 10 }} />
          ))}
        </div>
      </div>
      <div className="absolute left-[374px] top-[45px] h-[62px] w-[194px] rounded-lg border border-[#d8e3ef] bg-white">
        <strong className="absolute left-5 top-3 text-[8px] leading-[10px] text-[#111827]">업스케일 / OCR</strong>
        <span className="absolute left-5 top-[28px] flex h-[17px] w-12 items-center justify-center rounded-full bg-[#006bff] text-[8px] font-black text-white">2x</span>
        <span className="absolute left-[78px] top-[34px] h-1.5 w-[88px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-5 top-[47px] flex h-[17px] w-14 items-center justify-center rounded-full bg-[#111] text-[8px] font-black text-white">TEXT</span>
        <span className="absolute left-[86px] top-[53px] h-1.5 w-[72px] rounded-full bg-[#c6d0da]" />
      </div>
    </MiniPreviewShell>
  )
}

function ShareMiniPreview() {
  return (
    <MiniPreviewShell>
      <MiniHeading>공유 준비</MiniHeading>
      <div className="absolute left-[42px] top-[45px] h-[30px] w-[225px] rounded-full border border-[#d7dee8] bg-white">
        <span className="absolute left-[18px] top-[10px] text-[7px] font-bold text-[#9ca3af]">URL</span>
        <span className="absolute left-[55px] top-[13px] h-1 w-[134px] rounded-full bg-[#c6d0da]" />
      </div>
      <MaterialIcon name="arrow_forward" className="absolute left-[280px] top-[51px] text-[20px] text-[#006bff]" />
      <span className="absolute left-[340px] top-[43px] flex h-[34px] w-[156px] items-center justify-center rounded-xl bg-[#006bff] text-[11px] font-bold text-white">짧은 링크</span>
      <span className="absolute left-[510px] top-[47px] flex h-[26px] w-[58px] items-center justify-center rounded-full bg-[#111] text-[10px] font-bold text-white">복사</span>
      <div className="absolute left-[86px] top-[88px] h-[15px] w-[373px] rounded-full bg-[#111]">
        <div className="h-full w-[66%] rounded-full bg-[#27b36a]" />
        <span className="absolute left-[74px] top-[3px] text-[7px] font-bold leading-[9px] text-white">프로토타입 리뷰 준비</span>
      </div>
      <span className="absolute left-[473px] top-[88px] flex h-[9px] w-[11px] items-center justify-center rounded-[3px] bg-[#27b36a] text-white">
        <MaterialIcon name="check" className="text-[7px]" />
      </span>
    </MiniPreviewShell>
  )
}

function VideoMiniPreview() {
  return (
    <MiniPreviewShell>
      <MiniHeading>모션 변환</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[202px] rounded-lg bg-[#111]">
        <span className="absolute left-[85px] top-[24px] flex h-5 w-7 items-center justify-center rounded bg-[#006bff] text-[10px] text-white">▶</span>
        <span className="absolute left-[126px] top-2 flex h-[18px] w-[65px] items-center justify-center rounded-full bg-[#006bff] text-[8px] font-bold text-white">AI 생성</span>
      </div>
      <div className="absolute left-[281px] top-[45px] h-[38px] w-[179px] rounded-lg border border-[#d8e3ef] bg-white">
        {[0, 1, 2, 3, 4].map((frame) => (
          <span key={frame} className={frame === 2 ? "absolute top-[11px] h-[17px] w-[23px] rounded bg-[#006bff]" : "absolute top-[11px] h-[17px] w-[23px] rounded bg-[#d1d7df]"} style={{ left: `${17 + frame * 30}px` }} />
        ))}
      </div>
      <div className="absolute left-[295px] top-[94px] h-[5px] w-[213px] rounded-full bg-[#c6d0da]">
        <div className="h-full w-[56%] rounded-full bg-[#111]" />
      </div>
      <span className="absolute left-[491px] top-[52px] flex h-[17px] w-[60px] items-center justify-center rounded-full bg-[#ffd45a] text-[8px] font-bold text-[#111]">GIF</span>
      <span className="absolute left-[491px] top-[81px] flex h-[17px] w-[77px] items-center justify-center rounded-full bg-[#7c55f6] text-[8px] font-bold text-white">APNG</span>
    </MiniPreviewShell>
  )
}

function AuditVisual() {
  return (
    <div className="grid content-start gap-3 rounded-[14px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
      <div className="flex items-center justify-between">
        <strong className="text-lg">오타 후보</strong>
        <span className="inline-flex h-10 min-w-14 items-center justify-center rounded-full bg-[#006bff] px-5 text-lg font-black text-white">
          3
        </span>
      </div>
      <div className="mt-1 grid gap-3">
        {[
          ["오타 검수", "bg-[#ff4d55]"],
          ["주석으로 공유", "bg-[#c8d0dc]"],
          ["결과 패널", "bg-[#c8d0dc]"],
        ].map(([label, color]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="flex size-6 items-center justify-center rounded-md bg-[#27b36a] text-white">
              <MaterialIcon name="check" className="text-[14px]" />
            </span>
            <span className={`h-2 flex-1 rounded-full ${color}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function LayerCleanupVisual() {
  return (
    <div className="grid content-center gap-4 rounded-[14px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
      <div className="rounded-xl bg-[#111] px-4 py-6 text-center text-sm font-bold text-white">잠금</div>
      <div className="flex items-center justify-center gap-3">
        <MaterialIcon name="arrow_forward" className="text-[24px] text-[#006bff]" />
        <div className="grid gap-2">
          <span className="rounded-full bg-[#006bff] px-7 py-2 text-center text-sm font-bold text-white">해제</span>
          <span className="rounded-full bg-[#27b36a] px-7 py-2 text-center text-sm font-bold text-white">분리</span>
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#e7ecf3]">
        <strong className="text-sm">정리된 레이어</strong>
        <div className="mt-3 grid gap-2">
          <span className="h-2 w-4/5 rounded-full bg-[#006bff]" />
          <span className="h-2 rounded-full bg-[#c8d0dc]" />
          <span className="h-2 w-3/4 rounded-full bg-[#c8d0dc]" />
        </div>
      </div>
    </div>
  )
}

function AlignmentVisual() {
  return (
    <div className="rounded-[14px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
      <div className="flex items-center justify-between">
        <strong className="text-lg">픽셀 교정</strong>
        <span className="rounded-full bg-[#006bff] px-5 py-2 text-sm font-black text-white">1px</span>
      </div>
      <div className="mt-6 grid gap-3">
        {[80, 100, 72].map((width) => (
          <div key={width} className="flex items-center gap-3">
            <MaterialIcon name="grid_view" className="text-[16px] text-[#006bff]" />
            <span className="h-2 rounded-full bg-[#c8d0dc]" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-full bg-[#006bff] px-5 py-3 text-center text-sm font-bold text-white">
        버튼 자동 맞춤
      </div>
    </div>
  )
}

function TextVisual() {
  return (
    <div className="grid content-start gap-4 rounded-[14px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
      <div className="flex items-center gap-4">
        <MaterialIcon name="arrow_forward" className="text-[24px] text-[#111]" />
        <div className="grid flex-1 gap-2">
          <span className="rounded-full bg-[#006bff] px-6 py-2 text-sm font-bold text-white">번역</span>
          <span className="rounded-full bg-[#111] px-6 py-2 text-sm font-bold text-white">행간</span>
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#e7ecf3]">
        <strong className="text-sm text-[#006bff]">EN</strong>
        <span className="mt-4 block h-2 rounded-full bg-[#111]" />
        <span className="mt-2 block h-2 rounded-full bg-[#ffd45a]" />
        <span className="mt-2 block h-2 w-2/3 rounded-full bg-[#c8d0dc]" />
      </div>
    </div>
  )
}

function ImageSourceVisual() {
  return (
    <div className="grid content-center gap-4 rounded-[14px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#006bff] px-5 py-2 text-sm font-bold text-white">이미지 소스</span>
        <MaterialIcon name="arrow_forward" className="text-[24px] text-[#006bff]" />
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#e7ecf3]">
        <div className="flex items-center justify-between">
          <strong className="text-sm">원본 + 팔레트</strong>
          <span className="rounded-full bg-[#111] px-3 py-1 text-[10px] font-bold text-white">PNG</span>
        </div>
        <div className="mt-4 flex gap-2">
          {["#006bff", "#27b36a", "#ffd45a", "#111"].map((color) => (
            <span key={color} className="size-8 rounded" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ImageGenerateVisual() {
  return (
    <div className="rounded-[14px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
      <strong className="text-lg">업스케일 / OCR</strong>
      <div className="mt-5 grid grid-cols-[90px_1fr] gap-3">
        <span className="rounded-full bg-[#006bff] px-5 py-2 text-center text-sm font-black text-white">2x</span>
        <span className="h-3 self-center rounded-full bg-[#c8d0dc]" />
        <span className="rounded-full bg-[#111] px-5 py-2 text-center text-sm font-black text-white">TEXT</span>
        <span className="h-3 self-center rounded-full bg-[#c8d0dc]" />
      </div>
      <div className="mt-6 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-[#e7ecf3]">
        잘린 배경 자연 확장
      </div>
    </div>
  )
}

function ShareVisual() {
  return (
    <div className="grid content-start gap-4 rounded-[14px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
      <div className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#9ca3af] ring-1 ring-[#d7dee8]">URL</div>
      <div className="flex items-center gap-3">
        <MaterialIcon name="arrow_forward" className="text-[24px] text-[#006bff]" />
        <span className="flex-1 rounded-full bg-[#006bff] px-5 py-3 text-center text-sm font-bold text-white">짧은 링크</span>
        <span className="rounded-full bg-[#111] px-5 py-3 text-sm font-bold text-white">복사</span>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#111]">
        <div className="h-full w-2/3 rounded-full bg-[#27b36a]" />
      </div>
    </div>
  )
}

function VideoVisual() {
  return (
    <div className="grid content-start gap-4 rounded-[14px] border border-[#dbe7ff] bg-[#f8fbff] p-5">
      <div className="rounded-xl bg-[#111] p-5 text-white">
        <div className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-lg bg-[#006bff] text-xl">▶</span>
          <span className="rounded-full bg-[#006bff] px-5 py-2 text-sm font-bold">AI 생성</span>
        </div>
      </div>
      <div className="grid gap-3">
        <span className="rounded-full bg-[#ffd45a] px-5 py-2 text-sm font-black text-[#111]">GIF</span>
        <span className="rounded-full bg-[#7c55f6] px-5 py-2 text-sm font-black text-white">APNG</span>
      </div>
    </div>
  )
}

function ConvertVisual() {
  const conversionProgress = useAnimatedConversionProgress()

  return (
    <div className="rounded-[14px] bg-[#f3f4f6] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <MaterialIcon name="autorenew" className="text-[24px] text-[#0a0a0a]" />
          <strong className="text-lg">자동 변환</strong>
        </div>
        <AnimatedConversionProgressValue progress={conversionProgress} className="text-3xl" />
      </div>
      <AnimatedConversionProgressBar progress={conversionProgress} className="mt-5" />
      <div className="mt-5 grid gap-2 text-xs text-[#657082]">
        {["source.psd 분석", "텍스트 추출", "효과 분리"].map((item) => (
          <div key={item} className="flex items-center gap-2 rounded bg-white px-3 py-2">
            <MaterialIcon name="check" className="text-[14px] text-[#005bff]" />
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function QualityVisual() {
  return (
    <div className="grid content-start gap-3">
      {qualityPoints.map((point) => {
        return (
          <div key={point.label} className="flex items-center gap-3 rounded-lg bg-[#f7f9fc] p-4 ring-1 ring-[#e7ecf3]">
            <MaterialIcon name={point.icon} className="shrink-0 text-[20px] text-[#0a0a0a]" />
            <div>
              <strong className="block text-sm text-[#333]">{point.label}</strong>
              <span className="text-xs text-[#5f6368]">{point.value}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ImageFixVisual() {
  return (
    <div className="grid content-start gap-3">
      <div className="rounded-lg border border-[#e7ecf3] bg-[#fafafa] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#60656b]">BEFORE</span>
          <MaterialIcon name="image" className="text-[16px] text-[#9ca3af]" />
        </div>
        <div className="mt-5 h-20 rounded bg-[#e5e7eb]" />
      </div>
      <div className="rounded-lg border border-[#dbe7ff] bg-[#f8fbff] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#005bff]">AFTER</span>
          <MaterialIcon name="open_in_full" className="text-[16px] text-[#005bff]" />
        </div>
        <div className="mt-5 h-20 rounded bg-white shadow-inner">
          <div className="h-full w-full rounded bg-[linear-gradient(135deg,#eaf3ff,#ffffff_55%,#dbe7ff)]" />
        </div>
      </div>
    </div>
  )
}

function PresetVisual() {
  return (
    <div className="rounded-[14px] bg-white p-5 ring-1 ring-[#e7ecf3]">
      <div className="mb-4 flex items-center gap-3">
        <MaterialIcon name="tune" className="text-[20px] text-[#005bff]" />
        <strong className="text-lg">저장된 기준</strong>
      </div>
      {["레이어 이름 정리", "이미지 누락 검사", "텍스트 추출", "효과 분리"].map((item) => (
        <div key={item} className="flex h-[34px] items-center justify-between text-sm text-[#5f6368]">
          <span>{item}</span>
          <ConversionOptionToggle enabled />
        </div>
      ))}
    </div>
  )
}

function ActionButton({ action }: { action: ActionItem }) {
  return (
    <div
      className={
        action.primary
          ? "h-[58px] w-[178px] rounded-lg bg-[#006bff] px-4 py-[11px] text-white"
          : "h-[58px] w-[178px] rounded-lg border border-[#e3e9f1] bg-[#f3f6fa] px-4 py-[11px] text-[#111827]"
      }
    >
      <div className="flex items-center gap-2">
        <MaterialIcon name={action.icon} className="shrink-0 text-[22px] leading-[22px]" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <strong className="min-w-0 whitespace-nowrap text-[13px] leading-[18px]">{action.title}</strong>
            {action.badge ? (
              <span className="inline-flex h-3 min-w-[18px] items-center justify-center rounded-full border border-[#d5e6ff] bg-white px-1 text-[7px] font-bold leading-[9px] text-[#006bff]">
                {action.badge}
              </span>
            ) : null}
          </div>
          <p className={action.primary ? "mt-1 text-[10.5px] leading-[14px] text-[#eaf3ff]" : "mt-1 text-[10.5px] leading-[14px] text-[#657082]"}>
            {action.description}
          </p>
        </div>
      </div>
    </div>
  )
}

function WorkflowSection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStepIndex((current) => (current + 1) % workflowSteps.length)
    }, 1900)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="bg-[#fafafa] px-6 pb-[52px] pt-24 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-[1248px]">
        <div className="text-center">
          <p className="inline-flex h-10 items-center justify-center text-[13px] font-black leading-5 text-[#0a0a0a]">HOW IT WORKS</p>
          <h2 className="mt-5 text-[34px] font-black leading-[1.22] text-[#0a0a0a] sm:text-[46px] sm:leading-[56px]">
            PSD를 수정할 수 있는
            <br />
            화면으로 바꾸는 쉬운 루틴
          </h2>
          <p className="mt-6 text-[18px] leading-8 text-[#5f6368] sm:text-[22px]">
            가져오고 정리한 뒤, 필요한 보정만 골라 착 적용합니다.
          </p>
        </div>

        <div className="mt-[52px] grid gap-8 lg:grid-cols-[552px_620px] lg:items-start lg:justify-between">
          <div className="grid gap-[14px] lg:h-[428px] lg:grid-rows-4">
            {workflowSteps.map((step, index) => {
              const isActive = index === activeStepIndex

              return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStepIndex(index)}
                aria-current={isActive ? "step" : undefined}
                className={
                  isActive
                    ? "grid min-h-[88px] grid-cols-[62px_1fr_24px] items-center gap-5 rounded-2xl bg-white px-5 py-4 text-left ring-2 ring-[#005bff]/15 transition duration-500 lg:min-h-0"
                    : "grid min-h-[88px] grid-cols-[62px_1fr_24px] items-center gap-5 rounded-2xl bg-white px-5 py-4 text-left transition duration-500 hover:-translate-y-0.5 lg:min-h-0"
                }
              >
                <span
                  className={
                    isActive
                      ? "flex size-14 items-center justify-center rounded-xl bg-[#111] text-[17px] font-black leading-[22px] text-white transition duration-500"
                      : "flex size-14 items-center justify-center rounded-xl bg-[#f1f2f4] text-[17px] font-black leading-[22px] text-[#111] transition duration-500"
                  }
                >
                  {step.number}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[21px] font-black leading-7 text-[#0a0a0a]">{step.title}</h3>
                  <p className="mt-1 truncate text-sm leading-[22px] text-[#5e5e5e]">{step.description}</p>
                </div>
                <MaterialIcon
                  name={step.icon}
                  className={isActive ? "text-[24px] text-[#005bff] transition duration-500" : "text-[24px] text-[#5f6368] transition duration-500"}
                />
              </button>
              )
            })}
          </div>

          <div className="overflow-hidden rounded-2xl bg-[#f1f2f4] shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
            <div className="flex h-[42px] items-center bg-[#090909] px-[18px]">
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="ml-2 size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="ml-2 size-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-5 text-[11px] font-black leading-4 text-white">
                source.psd&nbsp; -&gt;&nbsp; piger&nbsp; -&gt;&nbsp; team-ready figma
              </span>
            </div>

            <div className="grid justify-center gap-5 px-5 pb-[50px] pt-[30px] md:grid-cols-[236px_44px_236px] md:items-center">
              <WorkflowLayerPanel variant="source" activeStepIndex={activeStepIndex} />
              <WorkflowTransferIndicator />
              <WorkflowLayerPanel variant="ready" activeStepIndex={activeStepIndex} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WorkflowTransferIndicator() {
  return (
    <div className="hidden h-[116px] items-center justify-center md:flex" aria-label="변환 중">
      <div className="relative flex h-12 w-full items-center justify-center">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#d5dde8]" />
        <span className="relative flex size-9 items-center justify-center rounded-full bg-white text-[#005bff] shadow-[0_10px_22px_rgba(15,24,42,0.08)] ring-1 ring-[#dbe7ff]">
          <MaterialIcon name="sync" className="animate-spin text-[19px]" />
        </span>
      </div>
    </div>
  )
}

function WorkflowLayerPanel({ variant, activeStepIndex }: { variant: "source" | "ready"; activeStepIndex: number }) {
  const isReady = variant === "ready"
  const activeLayerIndex = activeStepIndex === 3 ? workflowLayerRows.length - 1 : activeStepIndex
  const completedLayerCount = activeStepIndex === 3 ? workflowLayerRows.length : Math.min(workflowLayerRows.length, activeLayerIndex + 1)

  return (
    <div className="h-[306px] rounded-[14px] bg-white px-5 pb-7 pt-6">
      <h3 className="text-[18px] font-black leading-[22px] text-[#0a0a0a]">
        {isReady ? "team-ready figma" : "source.psd"}
      </h3>
      <p className="mt-0.5 text-xs leading-[18px] text-[#7a7f85]">
        {isReady ? "editable · shared · reviewed" : "48 layers · mixed effects"}
      </p>

      <div className="mt-5 grid gap-2.5">
        {workflowLayerRows.map((row, index) => {
          const isActive = index === activeLayerIndex
          const isComplete = index < completedLayerCount

          return (
          <div
            key={`${variant}-${row.number}`}
            className={
              isReady
                ? `grid h-[27px] grid-cols-[22px_1fr_18px] items-center gap-2 rounded-[7px] px-1.5 transition duration-500 ${isComplete ? "bg-[#eef5ff]" : "bg-[#f5f6f8]"}`
                : "flex h-6 items-center gap-2"
            }
          >
            <span
              className={
                isReady
                  ? `flex h-4 w-[22px] items-center justify-center rounded-[5px] text-[7px] font-black leading-none text-white transition duration-500 ${isComplete ? row.color : "bg-[#aeb7c2]"}`
                  : `flex size-[18px] items-center justify-center rounded-[5px] text-[7px] font-black leading-none text-white transition duration-500 ${isActive ? "bg-[#006bff]" : row.color}`
              }
            >
              {row.number}
            </span>
            {isReady ? (
              <>
                <span className="text-sm leading-[18px] text-[#111]">{row.label.replace(" / nav", "")}</span>
                <span className={isComplete ? "text-center text-sm font-bold text-[#006bff] transition duration-500" : "text-center text-sm font-bold text-[#6f747b] transition duration-500"}>
                  ✓
                </span>
              </>
            ) : (
              <span className={`${row.width} rounded-md px-2.5 text-[13px] leading-6 text-[#111] transition duration-500 ${isActive ? "bg-[#ddebff]" : "bg-[#e4e7ea]"}`}>
                {row.label}
              </span>
            )}
          </div>
          )
        })}
      </div>

      {isReady ? (
        <div className="relative mt-4 h-7 overflow-hidden rounded-[7px] bg-[#111]">
          <div
            className="absolute inset-y-0 left-0 bg-[#005bff] transition duration-500"
            style={{ width: `${Math.max(26, (completedLayerCount / workflowLayerRows.length) * 100)}%` }}
          />
          <span className="relative z-10 flex h-full items-center justify-center text-xs font-bold text-white">
            팀 공유 준비 완료
          </span>
        </div>
      ) : null}
    </div>
  )
}

function FileImportSection() {
  const [conversionStep, setConversionStep] = useState(0)
  const activeFileTypeIndex = conversionStep % fileTypes.length
  const activeSourceRowIndex = conversionStep % conversionSourceRows.length
  const completedAfterCount = (conversionStep % conversionAfterItems.length) + 1
  const activeQualityIndex = conversionStep % qualityPoints.length

  useEffect(() => {
    const timer = window.setInterval(() => {
      setConversionStep((current) => (current + 1) % 24)
    }, 1500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="bg-white px-6 pb-[62px] pt-[94px] sm:px-10 lg:px-12">
      <div className="mx-auto max-w-[1184px] text-center">
        <p className="inline-flex h-10 items-center justify-center text-[13px] font-black leading-5 text-[#0a0a0a]">
          CONVERSION QUALITY
        </p>
        <h2 className="mt-5 text-[34px] font-black leading-[1.22] text-[#0a0a0a] sm:text-[46px] sm:leading-[56px]">
          PSD뿐만 아니라
          <br />
          다양한 파일도 가볍게 데려옵니다
        </h2>
        <p className="mx-auto mt-6 max-w-[960px] text-[17px] leading-[30px] text-[#5f6368] sm:text-[20px]">
          PSD, AI, EPS, PDF, PPT, SVG까지 불러와 레이어와 텍스트를 Figma에서 다시 만질 수 있게 정리합니다.
        </p>

        <div className="mt-[52px] overflow-hidden rounded-2xl bg-white text-left shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
          <div className="flex h-11 items-center bg-[#090909] px-[22px] text-white">
            <span className="size-2.5 rounded-full bg-[#ff6b5f]" />
            <span className="ml-2 size-2.5 rounded-full bg-[#ffca4b]" />
            <span className="ml-2 size-2.5 rounded-full bg-[#32d074]" />
            <span className="ml-8 text-[13px] leading-4">source files&nbsp; -&gt;&nbsp; piger&nbsp; -&gt;&nbsp; editable figma</span>
          </div>

          <div className="bg-[#fbfbfb] px-[34px] pb-5 pt-5">
            <div className="flex min-h-[54px] flex-wrap items-center gap-2 rounded-2xl bg-[#f4f5f6] px-6 py-3">
              <span className="mr-5 text-[10px] font-bold leading-[14px] text-[#5f6368]">SUPPORTED IMPORTS</span>
              {fileTypes.map((type) => (
                <span
                  key={type}
                  className={
                    fileTypes[activeFileTypeIndex] === type
                      ? "inline-flex h-[30px] min-w-[62px] items-center justify-center rounded-full bg-[#0b0b0b] px-5 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition duration-500"
                      : "inline-flex h-[30px] min-w-[52px] items-center justify-center rounded-full bg-white px-5 text-[11px] font-bold text-[#111] transition duration-500"
                  }
                >
                  {type}
                </span>
              ))}
              <span className="ml-auto inline-flex items-center gap-2 text-[13px] font-bold text-[#111]">
                <span className="size-2 animate-pulse rounded-full bg-[#006bff]" />
                계속 업데이트 중
              </span>
            </div>

            <div className="mt-[22px] grid gap-8 lg:grid-cols-[340px_84px_608px] lg:items-center">
              <div className="h-[206px] rounded-[14px] bg-white p-6">
                <p className="text-[11px] font-black leading-4 text-[#4d5157]">BEFORE</p>
                <h3 className="mt-1.5 text-[24px] font-black leading-[30px] text-black">source files</h3>
                <p className="mt-0.5 text-[13px] leading-[18px] text-[#9aa0a6]">psd · ai · eps · pdf · ppt · svg</p>
                <div className="mt-4 grid gap-1">
                  {conversionSourceRows.map((row, index) => {
                    const isActive = index === activeSourceRowIndex

                    return (
                    <div key={row.label} className="flex h-[18px] items-center gap-2">
                      <span className={isActive ? "size-2 rounded-[3px] bg-[#006bff] transition duration-500" : "size-2 rounded-[3px] bg-[#c8cdd2] transition duration-500"} />
                      <span className={`${row.width} ${isActive ? "translate-x-1 bg-[#ddebff] text-[#005bff]" : `${row.color} text-[#5f6368]`} rounded-[5px] px-2.5 text-[11px] leading-[18px] transition duration-500`}>
                        {row.label}
                      </span>
                    </div>
                    )
                  })}
                </div>
              </div>

              <div className="hidden h-20 w-[84px] flex-col items-center justify-center gap-2 rounded-full bg-[#fafafa] text-[#005bff] lg:flex">
                <MaterialIcon name="sync" className="animate-spin text-[26px]" />
                <span className="text-[9px] font-black leading-none text-[#111]">변환 중</span>
              </div>

              <div className="h-[206px] rounded-[14px] bg-white p-6">
                <p className="text-[11px] font-black leading-4 text-[#4f545a]">AFTER</p>
                <h3 className="mt-1.5 text-[24px] font-black leading-[30px] text-black">editable figma</h3>
                <p className="mt-0.5 text-xs leading-[18px] text-[#737373]">layers · text · images · effects are ready to edit</p>
                <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {conversionAfterItems.map((item, index) => {
                    const isComplete = index < completedAfterCount

                    return (
                    <div key={item.title} className={isComplete ? "grid grid-cols-[12px_1fr] gap-2.5 transition duration-500" : "grid grid-cols-[12px_1fr] gap-2.5 opacity-55 transition duration-500"}>
                      <span className={isComplete ? "mt-1 size-3 rounded bg-[#006bff] transition duration-500" : "mt-1 size-3 rounded bg-[#8a9097] transition duration-500"} />
                      <div>
                        <strong className="block text-[13px] leading-[18px] text-[#111]">{item.title}</strong>
                        <span className="text-xs leading-[17px] text-[#7a828b]">{item.body}</span>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {qualityPoints.map((point, index) => (
            <div
              key={point.label}
              className={index === activeQualityIndex ? "flex h-12 -translate-y-1 items-center gap-3 rounded-2xl bg-white px-[18px] text-left shadow-[0_18px_36px_rgba(0,91,255,0.13)] ring-1 ring-[#dbe7ff] transition duration-500" : "flex h-12 items-center gap-3 rounded-2xl bg-white px-[18px] text-left shadow-[0_14px_40px_rgba(0,0,0,0.04)] transition duration-500"}
            >
              <MaterialIcon name={point.icon} className={index === activeQualityIndex ? "text-[20px] text-[#005bff] transition duration-500" : "text-[20px] text-[#0a0a0a] transition duration-500"} />
              <strong className="text-[15px] font-black leading-5 text-[#333]">{point.label}</strong>
              <span className="text-[13px] text-[#5f6368]">{point.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  const [activeUseCaseIndex, setActiveUseCaseIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveUseCaseIndex((current) => (current + 1) % useCases.length)
    }, 900)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="bg-[#050505] px-6 py-24 text-white sm:px-10 lg:px-12">
      <div className="mx-auto max-w-[1216px]">
        <p className="text-center text-[15px] font-bold text-[#9a9a9a]">USE CASES</p>
        <h2 className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[32px] font-black leading-[1.25] sm:text-[36px]">
          <span>이럴 때</span>
          <PigmaLogo className="h-[28px] w-auto brightness-0 invert sm:h-[31px]" />
          <span>가 빠릅니다</span>
        </h2>
        <p className="mt-4 text-center text-[17px] leading-7 text-[#b8b8b8]">
          실제 작업할 때 바로 생각나는 15가지 활용 예시입니다.
        </p>
        <div className="mt-12 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {useCases.map((item, index) => {
            const isActive = index === activeUseCaseIndex

            return (
            <article
              key={item.title}
              onMouseEnter={() => setActiveUseCaseIndex(index)}
              className={
                isActive
                  ? "group relative h-full min-h-[174px] overflow-hidden rounded-2xl border border-[#005bff] bg-white p-5 text-[#050505] shadow-[0_24px_70px_rgba(0,91,255,0.38)] transition-[background-color,border-color,box-shadow,color] duration-500"
                  : "group relative h-full min-h-[174px] overflow-hidden rounded-2xl border border-white/5 bg-[#171717] p-5 text-white transition-[background-color,border-color,box-shadow,color] duration-500 hover:border-white/20 hover:bg-[#202020]"
              }
            >
              <span
                className={
                  isActive
                    ? "absolute inset-x-0 top-0 h-1 origin-left scale-x-100 bg-[#005bff] transition duration-500"
                    : "absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#005bff] transition duration-500 group-hover:scale-x-100"
                }
              />
              <div
                className={
                  isActive
                    ? "flex size-[38px] rotate-[-8deg] items-center justify-center rounded-[10px] bg-[#005bff] text-white shadow-[0_12px_26px_rgba(0,91,255,0.34)] transition duration-500"
                    : "flex size-[38px] items-center justify-center rounded-[10px] bg-white text-[#050505] transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#005bff] group-hover:text-white"
                }
              >
                <MaterialIcon name={item.icon} className="text-[20px]" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className={isActive ? "mt-2 text-[12.5px] leading-[18px] text-[#333]" : "mt-2 text-[12.5px] leading-[18px] text-[#bdbdbd]"}>
                {item.description}
              </p>
            </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-[1020px] text-center">
        <p className="text-[13px] font-black text-[#60656b]">PRICING</p>
        <h2 className="mt-7 text-[34px] font-black leading-[1.22] sm:text-[40px]">
          가격은 가볍게
          <br />
          기능은 야무지게
        </h2>
        <div className="mt-12 grid gap-5 text-left md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="group flex min-h-[430px] flex-col rounded-lg bg-white p-6 text-[#050505] shadow-[0_18px_40px_rgba(15,24,42,0.08)] ring-1 ring-[#e7ecf3] transition duration-200 hover:-translate-y-1 hover:bg-[#050505] hover:text-white hover:ring-[#050505] hover:shadow-[0_18px_40px_rgba(15,24,42,0.16)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black">{plan.name}</h3>
                <MaterialIcon name="arrow_forward" className="text-[16px]" />
              </div>
              <p className="mt-6 text-4xl font-black">{plan.price}</p>
              <p className="mt-3 text-sm text-[#60656b] transition group-hover:text-white/70">{plan.description}</p>
              {plan.includedPrefix ? (
                <p className="mt-5 text-[11px] font-black leading-4 text-[#005bff] transition group-hover:text-white">
                  {plan.includedPrefix}
                </p>
              ) : null}
              <div
                className={`${plan.includedPrefix ? "mt-2" : "mt-5"} mb-7 flex min-h-[132px] flex-wrap content-start gap-1.5`}
                aria-label={`${plan.name} included features`}
              >
                {plan.features.map((feature) => (
                  <span
                    key={feature.label}
                    className="inline-flex min-h-[26px] items-center gap-1 rounded-full bg-[#f5f7fb] px-2.5 text-[10.5px] font-black leading-3 text-[#303844] ring-1 ring-[#e4eaf3] transition group-hover:bg-white/10 group-hover:text-white group-hover:ring-white/15"
                  >
                    {feature.badge ? (
                      <em className={feature.badge === "HOT" ? "not-italic text-[8px] font-black leading-none text-[#005bff] group-hover:text-white" : "not-italic text-[8px] font-black leading-none text-[#27b36a] group-hover:text-white"}>
                        {feature.badge}
                      </em>
                    ) : null}
                    {feature.label}
                  </span>
                ))}
              </div>
              <PricingPlanButton plan={plan} />
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 rounded-lg bg-[#fafafa] px-5 py-3 text-xs text-[#60656b] ring-1 ring-[#e7ecf3]">
          초기 가격은 Figma 플러그인 MVP 기준이며 출시 전 달라질 수 있습니다.
        </p>
      </div>
    </section>
  )
}

function loadPaddle() {
  if (window.Paddle) {
    return Promise.resolve(window.Paddle)
  }

  if (window.__pigmaPaddleScript) {
    return window.__pigmaPaddleScript
  }

  window.__pigmaPaddleScript = new Promise<PaddleApi>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]')
    const script = existingScript || document.createElement("script")

    script.addEventListener("load", () => {
      if (window.Paddle) {
        resolve(window.Paddle)
      } else {
        reject(new Error("Paddle.js를 불러오지 못했습니다."))
      }
    })
    script.addEventListener("error", () => reject(new Error("Paddle.js를 불러오지 못했습니다.")))

    if (!existingScript) {
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"
      script.async = true
      document.head.appendChild(script)
    }
  })

  return window.__pigmaPaddleScript
}

async function openPaddleCheckout(checkout: PaddleCheckoutConfig) {
  const paddle = await loadPaddle()

  if (!paddle.Initialized) {
    if (checkout.environment === "sandbox") {
      paddle.Environment?.set("sandbox")
    }

    paddle.Initialize({ token: checkout.token })
  }

  paddle.Checkout.open({
    settings: {
      displayMode: "overlay",
      theme: "light",
      locale: "ko",
      successUrl: checkout.successUrl,
      variant: "one-page",
    },
    items: [{ priceId: checkout.priceId, quantity: 1 }],
    customer: { email: checkout.customerEmail },
    customData: checkout.customData,
  })
}

function PricingPlanButton({ plan }: { plan: PricingPlan }) {
  const [pending, setPending] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const className =
    "mt-auto inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#050505] text-sm font-bold text-white transition group-hover:bg-white group-hover:text-[#050505] disabled:cursor-wait disabled:opacity-70"

  if (plan.key === "free") {
    return (
      <a href={FIGMA_PLUGIN_URL} target="_blank" rel="noreferrer" className={className}>
        {plan.cta}
      </a>
    )
  }

  async function startCheckout() {
    setPending(true)
    setCheckoutError(null)

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: plan.key }),
      })

      if (response.status === 401) {
        window.location.href = "/signup"
        return
      }

      const data = (await response.json().catch(() => null)) as PaddleCheckoutResponse | null
      if (!response.ok || !data?.checkout) {
        setCheckoutError(data?.error || "결제 페이지를 여는 중 문제가 발생했습니다.")
        setPending(false)
        return
      }

      await openPaddleCheckout(data.checkout)
      setPending(false)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "결제 페이지를 여는 중 문제가 발생했습니다.")
      setPending(false)
    }
  }

  return (
    <>
      <button type="button" onClick={startCheckout} disabled={pending} className={className}>
        {pending ? "결제창 이동 중" : plan.cta}
      </button>
      {checkoutError ? (
        <p className="mt-3 rounded-lg bg-[#fff4f4] px-3 py-2 text-center text-xs font-bold leading-5 text-[#d92d20] transition group-hover:bg-white/10 group-hover:text-[#ffd6db]">
          {checkoutError}
        </p>
      ) : null}
    </>
  )
}

function FinalCta() {
  return (
    <section className="bg-[#050505] px-6 py-20 text-white sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold text-[#9a9a9a]">READY</p>
          <h2 className="mt-4 text-[32px] font-black leading-[1.2] sm:text-[40px]">
            바로 psd 변환!
            <br />
            수정도 빠르게!
          </h2>
        </div>
        <a
          href={FIGMA_PLUGIN_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-6 text-[15px] font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0]"
        >
          무료 시작
          <MaterialIcon name="arrow_forward" className="text-[16px]" />
        </a>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="bg-[#050505] px-6 pb-10 text-white sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6 border-t border-white/10 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
        <div>
          <PigmaLogo className="h-[18px] w-auto brightness-0 invert" />
          <span>PSD를 Figma-ready 구조로 바꾸는 플러그인</span>
        </div>
        <div className="flex flex-wrap gap-6">
          <a href="/psd-export" className="transition hover:text-white">
            PSD Export
          </a>
          <a href="/psd-converter" className="transition hover:text-white">
            PSD 변환
          </a>
          <a href="#product" className="transition hover:text-white">
            제품
          </a>
          <a href="#features" className="transition hover:text-white">
            기능
          </a>
          <a href="#pricing" className="transition hover:text-white">
            가격
          </a>
          <a href="/login" className="transition hover:text-white">
            로그인
          </a>
          <a href="/signup" className="transition hover:text-white">
            회원가입
          </a>
          <a href="/terms" className="transition hover:text-white">
            Terms
          </a>
          <a href="/privacy" className="transition hover:text-white">
            Privacy
          </a>
          <a href="/refund-policy" className="transition hover:text-white">
            Refunds
          </a>
        </div>
      </div>
    </footer>
  )
}
