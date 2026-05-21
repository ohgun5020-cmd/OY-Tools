"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  FileText,
  FolderOpen,
  HelpCircle,
  History,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Maximize2,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Palette,
  Pencil,
  RefreshCw,
  Settings,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Store,
  TextCursorInput,
  Type,
  UploadCloud,
  WandSparkles,
} from "lucide-react"

type ActionItem = {
  title: string
  description: string
  icon: LucideIcon
  primary?: boolean
  badge?: string
}

type UseCase = {
  title: string
  description: string
  icon: LucideIcon
}

const aiActions: ActionItem[] = [
  {
    title: "의도 살리기",
    description: "디자인 방향 질문",
    icon: HelpCircle,
    primary: true,
    badge: "AI",
  },
  {
    title: "우선 수정 3개",
    description: "바로 고칠 항목 정리",
    icon: ClipboardCheck,
  },
  {
    title: "카피 톤 맞추기",
    description: "텍스트 흐름 제안",
    icon: MessageCircle,
  },
]

const workflowSteps = [
  {
    number: "01",
    title: "가져오기",
    description: "PSD, PDF, PPTX 같은 원본 파일을 드롭합니다.",
  },
  {
    number: "02",
    title: "분석",
    description: "레이어, 텍스트, 이미지, 효과를 분리합니다.",
  },
  {
    number: "03",
    title: "보정",
    description: "깨진 이미지와 누락 요소를 빠르게 확인합니다.",
  },
  {
    number: "04",
    title: "전달",
    description: "Figma에서 바로 수정 가능한 구조로 넘깁니다.",
  },
]

const qualityPoints = [
  { label: "레이어", value: "그룹/순서 정리", icon: Layers },
  { label: "텍스트", value: "편집 가능한 텍스트", icon: TextCursorInput },
  { label: "이미지", value: "깨진 이미지 보정", icon: ImageIcon },
  { label: "효과", value: "효과 분리 확인", icon: WandSparkles },
]

const useCases: UseCase[] = [
  {
    title: "오래된 PSD 수정",
    description: "예전 원본을 Figma에서 다시 만질 때",
    icon: History,
  },
  {
    title: "외주 원본 정리",
    description: "받은 파일을 팀 기준으로 정돈할 때",
    icon: FolderOpen,
  },
  {
    title: "급한 배너 교체",
    description: "문구와 이미지만 빠르게 바꿔야 할 때",
    icon: Megaphone,
  },
  {
    title: "상세페이지 재편집",
    description: "PSD 산출물을 다시 쪼개고 고칠 때",
    icon: Store,
  },
  {
    title: "브랜드 템플릿 정리",
    description: "반복되는 디자인 기준을 맞출 때",
    icon: Palette,
  },
  {
    title: "누락 요소 검수",
    description: "텍스트와 이미지 깨짐을 확인할 때",
    icon: CheckCircle2,
  },
  {
    title: "레이어 이름 정리",
    description: "복잡한 그룹명을 읽기 쉽게 바꿀 때",
    icon: Pencil,
  },
  {
    title: "텍스트 재활용",
    description: "래스터 글자를 편집 가능한 텍스트로",
    icon: Type,
  },
  {
    title: "이미지 확장",
    description: "부족한 배경 영역을 자연스럽게 늘릴 때",
    icon: Maximize2,
  },
  {
    title: "썸네일 변형",
    description: "같은 구조로 여러 사이즈를 만들 때",
    icon: LayoutGrid,
  },
  {
    title: "PPT/PDF 변환",
    description: "문서형 디자인을 다시 편집할 때",
    icon: FileText,
  },
  {
    title: "캠페인 소재 교체",
    description: "시즌 문구와 이미지를 빠르게 바꿀 때",
    icon: Shuffle,
  },
  {
    title: "팀 리뷰 준비",
    description: "공유 전에 기준대로 정리할 때",
    icon: ClipboardCheck,
  },
  {
    title: "AI 수정 제안",
    description: "화면 기준으로 보정 방향을 물을 때",
    icon: Sparkles,
  },
  {
    title: "반복 작업 자동화",
    description: "자주 쓰는 변환 기준을 저장할 때",
    icon: SlidersHorizontal,
  },
]

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "가볍게 파일 구조를 확인합니다.",
    features: ["월 3회 변환", "기본 레이어 정리", "작은 파일 테스트"],
    cta: "무료 시작",
  },
  {
    name: "Basic",
    price: "$2",
    description: "개인 작업자가 자주 쓰기 좋은 구성입니다.",
    features: ["월 30회 변환", "텍스트 추출", "AI 디자인 질문"],
    cta: "Basic 선택",
    featured: true,
  },
  {
    name: "Pro",
    price: "$5",
    description: "외주와 반복 작업을 함께 처리합니다.",
    features: ["무제한 큐", "효과 분리", "팀 전달용 리포트"],
    cta: "Pro 선택",
  },
]

const fileTypes = ["PSD", "AI", "PDF", "PPTX", "FIG", "SKETCH"]

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#050505]">
      <SiteHeader />
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

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-6 sm:px-10 md:grid md:h-[104px] md:grid-cols-[148px_1fr_auto] lg:px-12">
        <a
          href="#top"
          className="flex items-center text-black"
          aria-label="PIGMA 홈"
        >
          <PigmaLogo className="h-[18px] w-[100px] md:h-[19px]" />
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
        <div className="flex items-center gap-9">
          <a href="#login" className="hidden font-bold text-[#0a0a0a] transition hover:text-[#005bff] sm:inline-flex">
            로그인
          </a>
          <a
            href="#pricing"
            className="inline-flex h-12 min-w-[116px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-5 text-sm font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0] md:h-14 md:min-w-[132px] md:rounded-2xl md:px-7 md:text-base"
          >
            시작하기
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  )
}

function PigmaLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/assets/pigma-wordmark.svg"
      alt="PIGMA"
      className={className}
      width={100}
      height={18}
    />
  )
}

function HeroSection() {
  return (
    <section id="top" className="bg-[#fafafa] px-6 pb-24 pt-16 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-[1120px] text-center">
        <p className="mx-auto mb-7 flex h-10 w-[220px] items-center justify-center gap-2 rounded-[10px] text-[13px] font-black text-[#0a0a0a]">
          <span>PSD TO</span>
          <PigmaLogo className="h-[10px] w-auto" />
        </p>
        <h1 className="mx-auto max-w-[1120px] text-[42px] font-black leading-[1.08] text-black sm:text-[56px] lg:text-[72px]">
          <span className="inline-flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
            <PigmaLogo className="h-[38px] w-auto sm:h-[50px] lg:h-[64px]" />
            <span>로</span>
          </span>
          <br />
          PSD를 바로 싹싹
        </h1>
        <p className="mx-auto mt-7 max-w-[760px] text-[17px] leading-8 text-[#5f6368] sm:text-[19px]">
          레이어와 텍스트를 살리고, 필요한 보정만 플러그인처럼 펼쳐 씁니다.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#pricing"
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#005bff] px-6 text-[15px] font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0] sm:w-[170px]"
          >
            무료 시작
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a
            href="#pricing"
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-bold text-[#0a0a0a] shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 sm:w-[180px]"
          >
            <DollarSign className="size-4" aria-hidden="true" />
            가격 보기
          </a>
        </div>
        <HeroWorkspace />
      </div>
    </section>
  )
}

function HeroWorkspace() {
  const conversionProgress = useAnimatedConversionProgress()
  const importOptionsEnabled = conversionProgress === 100

  return (
    <div
      id="product"
      className="mt-[76px] w-full overflow-hidden rounded-2xl bg-white text-left shadow-[0_14px_40px_rgba(0,0,0,0.04)]"
    >
      <div className="flex h-11 items-center gap-2 bg-[#090909] px-5 text-white">
        <span className="size-2.5 rounded-full bg-[#ff6b5a]" />
        <span className="size-2.5 rounded-full bg-[#ffd166]" />
        <span className="size-2.5 rounded-full bg-[#21c55d]" />
        <span className="ml-3 inline-flex items-center gap-2 text-sm">
          <PigmaLogo className="h-[10px] w-auto brightness-0 invert" />
          convert workspace
        </span>
        <span className="ml-auto hidden text-[11px] text-white/80 md:inline">
          source files -&gt; <PigmaLogo className="inline-block h-[8px] w-auto brightness-0 invert" /> -&gt; figma-ready
        </span>
      </div>
      <div className="grid min-w-0 gap-5 p-7 lg:grid-cols-[300px_1fr_302px]">
        <div className="rounded-[14px] bg-white p-5 ring-1 ring-black/5">
          <div className="mb-5 flex items-center gap-3 text-[#0a0a0a]">
            <FileText className="size-5" aria-hidden="true" />
            <strong className="text-sm">source.psd</strong>
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
              <RefreshCw className="size-6 text-[#0a0a0a]" aria-hidden="true" />
              <h2 className="text-[22px] font-black leading-none">자동 변환</h2>
            </div>
            <AnimatedConversionProgressValue progress={conversionProgress} className="text-4xl" />
          </div>
          <AnimatedConversionProgressBar progress={conversionProgress} className="mt-5" />
          <p className="mt-4 text-[13px] font-medium text-[#0a0a0a]">
            텍스트, 효과, 레이어를 바로 편집 가능한 구조로 정리
          </p>
        </div>
        <div className="rounded-[14px] bg-white p-5 ring-1 ring-black/5">
          <div className="mb-4 flex items-center gap-3">
            <Settings className="size-5" aria-hidden="true" />
            <strong className="text-lg">가져오기 옵션</strong>
          </div>
          {["레이어 정리", "텍스트 변환", "효과 분리"].map((item) => (
            <div key={item} className="flex h-[30px] items-center justify-between text-[15px] text-[#5f6368]">
              <span>{item}</span>
              <ConversionOptionToggle enabled={importOptionsEnabled} />
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
          ? "inline-flex h-[22px] w-[54px] items-center rounded-full bg-[#111] px-1 text-[7px] font-bold text-white transition-colors duration-200"
          : "inline-flex h-[22px] w-[54px] items-center justify-end rounded-full bg-[#d8dee8] px-1 text-[7px] font-bold text-[#657082] transition-colors duration-200"
      }
      aria-label={enabled ? "ON" : "OFF"}
    >
      {enabled ? "ON" : "OFF"}
      <span
        className={
          enabled
            ? "ml-auto size-4 rounded-full bg-white transition-all duration-200"
            : "order-first mr-auto size-4 rounded-full bg-white transition-all duration-200"
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
    const holdDuration = 1000
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
    <section id="features" className="px-6 py-24 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-[1120px] text-center">
        <p className="text-[13px] font-black text-[#111]">PLUGIN MENU</p>
        <h2 className="mt-8 text-[34px] font-black leading-[1.25] text-[#050505] sm:text-[40px]">
          시안 방향을
          <br />
          AI에게 바로 묻기
        </h2>
        <p className="mt-5 text-[17px] leading-7 text-[#60656b]">
          캡처한 화면 기준으로 의도, 흐름, 타이포 피드백을 빠르게 받습니다.
        </p>
        <FeatureCarousel />
      </div>
    </section>
  )
}

function FeatureCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const slides = [
    {
      id: "feature-ai-chat",
      eyebrow: "DESIGNER PICK",
      title: "AI 디자인 채팅",
      description: "선택 화면을 보며 의도, 흐름, 타이포 방향을 바로 묻고 수정 우선순위를 얻습니다.",
      visual: <AiChatVisual />,
    },
    {
      id: "feature-audit",
      eyebrow: "DESIGNER PICK",
      title: "검수",
      description: "상세페이지와 캠페인 카피에서 민망한 오타를 배포 전에 잡아줍니다.",
      visual: <AuditVisual />,
    },
    {
      id: "feature-layer-cleanup",
      eyebrow: "DESIGNER PICK",
      title: "레이어와 텍스트 정리",
      description: "외주·PSD·복잡한 파일을 넘겨받았을 때 정리 시간을 크게 줄입니다.",
      visual: <LayerCleanupVisual />,
    },
    {
      id: "feature-align",
      eyebrow: "DESIGNER PICK",
      title: "정렬/교정",
      description: "반픽셀, 들쭉날쭉한 버튼, 기울어진 요소를 한 번에 깔끔하게 맞춥니다.",
      visual: <AlignmentVisual />,
    },
    {
      id: "feature-text",
      eyebrow: "DESIGNER PICK",
      title: "텍스트",
      description: "카피 수정, 번역, 하이라이트, 행간 조정을 시안 안에서 바로 끝냅니다.",
      visual: <TextVisual />,
    },
    {
      id: "feature-image-fix",
      eyebrow: "DESIGNER PICK",
      title: "이미지 보정",
      description: "원본 이미지 추출, 색상 팔레트, 크롭 정리를 디자인 작업 안에서 바로 처리합니다.",
      visual: <ImageSourceVisual />,
    },
    {
      id: "feature-image-generate",
      eyebrow: "DESIGNER PICK",
      title: "이미지 생성/확장",
      description: "잘린 배경을 자연스럽게 늘리고, 저해상도 이미지를 시안용으로 끌어올립니다.",
      visual: <ImageGenerateVisual />,
    },
    {
      id: "feature-share",
      eyebrow: "DESIGNER PICK",
      title: "공유/기타",
      description: "길고 복잡한 Figma 링크와 프로토타입 공유를 몇 초 안에 정리합니다.",
      visual: <ShareVisual />,
    },
    {
      id: "feature-video",
      eyebrow: "DESIGNER PICK",
      title: "영상",
      description: "움직이는 배너와 숏폼 시안을 위해 AI 영상 생성과 GIF/APNG 변환을 준비합니다.",
      visual: <VideoVisual />,
    },
  ]
  const lastIndex = slides.length - 1
  const canGoPrev = activeIndex > 0
  const canGoNext = activeIndex < lastIndex
  const scrollToSlide = (slideIndex: number) => {
    const nextIndex = Math.max(0, Math.min(lastIndex, slideIndex))
    const scroller = scrollerRef.current

    setActiveIndex(nextIndex)
    scroller?.scrollTo({
      left: scroller.clientWidth * nextIndex,
      behavior: "smooth",
    })
  }

  const syncActiveSlide = () => {
    const scroller = scrollerRef.current

    if (!scroller) return

    const nextIndex = Math.max(0, Math.min(lastIndex, Math.round(scroller.scrollLeft / scroller.clientWidth)))
    setActiveIndex(nextIndex)
  }

  return (
    <div className="relative mx-auto mt-12 w-full max-w-[746px]">
      <div className="overflow-hidden pb-4">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={syncActiveSlide}
        >
          {slides.map((slide, index) => (
            <FeatureSlide key={slide.id} {...slide} index={index + 1} total={slides.length} />
          ))}
        </div>
      </div>
      <div className="mt-0 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollToSlide(activeIndex - 1)}
          disabled={!canGoPrev}
          className="inline-flex size-9 items-center justify-center rounded-full border border-[#e7ecf3] bg-white text-[#050505] shadow-sm transition hover:border-[#005bff] hover:text-[#005bff] disabled:cursor-default disabled:text-[#c8d0dc] disabled:hover:border-[#e7ecf3]"
          aria-label="이전 기능 슬라이드로 이동"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollToSlide(index)}
              className={index === activeIndex ? "h-2 w-6 rounded-full bg-[#005bff]" : "size-2 rounded-full bg-[#d8dee8]"}
              aria-label={`${index + 1}번 기능 슬라이드로 이동`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollToSlide(activeIndex + 1)}
          disabled={!canGoNext}
          className="inline-flex size-9 items-center justify-center rounded-full border border-[#e7ecf3] bg-white text-[#050505] shadow-sm transition hover:border-[#005bff] hover:text-[#005bff] disabled:cursor-default disabled:text-[#c8d0dc] disabled:hover:border-[#e7ecf3]"
          aria-label="다음 기능 슬라이드로 이동"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function FeatureSlide({
  id,
  eyebrow,
  title,
  description,
  visual,
  index,
  total,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  visual: ReactNode
  index: number
  total: number
}) {
  return (
    <article
      id={id}
      className="grid w-full min-w-full shrink-0 snap-start gap-6 rounded-lg border border-[#e7ecf3] bg-white p-8 text-left shadow-[0_18px_17px_rgba(15,24,42,0.10)] lg:grid-cols-[1fr_260px]"
    >
      <div>
        <div className="flex items-center gap-3 text-[#273142]">
          <Sparkles className="size-7 text-[#006bff]" aria-hidden="true" />
          <span className="text-[13px] font-bold">{eyebrow}</span>
          <span className="ml-auto text-xs font-bold text-[#9ca3af]">
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-8 text-[30px] font-black leading-tight text-[#111827] sm:text-[34px]">{title}</h3>
        <p className="mt-5 max-w-[414px] text-[17px] leading-7 text-[#4b5563]">{description}</p>
        <div className="mt-8 hidden h-2 w-[92px] rounded-full bg-[#005bff] sm:block" />
      </div>
      {visual}
    </article>
  )
}

function AiChatVisual() {
  return (
    <div className="grid content-start gap-3">
      <div className="rounded-lg border border-[#cfe0ff] bg-[#f8fbff] p-4">
        <p className="text-sm font-bold text-[#111827]">질문</p>
        <p className="mt-2 text-sm leading-6 text-[#4b5563]">이 화면에서 CTA가 약해 보이는 이유를 알려줘.</p>
      </div>
      {aiActions.map((action) => (
        <ActionButton key={action.title} action={action} />
      ))}
    </div>
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
              <Check className="size-3.5" aria-hidden="true" />
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
        <ArrowRight className="size-6 text-[#006bff]" aria-hidden="true" />
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
            <LayoutGrid className="size-4 text-[#006bff]" aria-hidden="true" />
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
        <ArrowRight className="size-6 text-[#111]" aria-hidden="true" />
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
        <ArrowRight className="size-6 text-[#006bff]" aria-hidden="true" />
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
        <ArrowRight className="size-6 text-[#006bff]" aria-hidden="true" />
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
          <RefreshCw className="size-6 text-[#0a0a0a]" aria-hidden="true" />
          <strong className="text-lg">자동 변환</strong>
        </div>
        <AnimatedConversionProgressValue progress={conversionProgress} className="text-3xl" />
      </div>
      <AnimatedConversionProgressBar progress={conversionProgress} className="mt-5" />
      <div className="mt-5 grid gap-2 text-xs text-[#657082]">
        {["source.psd 분석", "텍스트 추출", "효과 분리"].map((item) => (
          <div key={item} className="flex items-center gap-2 rounded bg-white px-3 py-2">
            <Check className="size-3.5 text-[#005bff]" aria-hidden="true" />
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
        const Icon = point.icon

        return (
          <div key={point.label} className="flex items-center gap-3 rounded-lg bg-[#f7f9fc] p-4 ring-1 ring-[#e7ecf3]">
            <Icon className="size-5 shrink-0 text-[#0a0a0a]" aria-hidden="true" />
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
          <ImageIcon className="size-4 text-[#9ca3af]" aria-hidden="true" />
        </div>
        <div className="mt-5 h-20 rounded bg-[#e5e7eb]" />
      </div>
      <div className="rounded-lg border border-[#dbe7ff] bg-[#f8fbff] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#005bff]">AFTER</span>
          <Maximize2 className="size-4 text-[#005bff]" aria-hidden="true" />
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
        <SlidersHorizontal className="size-5 text-[#005bff]" aria-hidden="true" />
        <strong className="text-lg">저장된 기준</strong>
      </div>
      {["레이어 이름 정리", "이미지 누락 검사", "텍스트 추출", "효과 분리"].map((item) => (
        <div key={item} className="flex h-[34px] items-center justify-between text-sm text-[#5f6368]">
          <span>{item}</span>
          <span className="inline-flex h-[22px] w-[54px] items-center rounded-full bg-[#111] px-1 text-[7px] font-bold text-white">
            ON
            <span className="ml-auto size-4 rounded-full bg-white" />
          </span>
        </div>
      ))}
    </div>
  )
}

function ActionButton({ action }: { action: ActionItem }) {
  const Icon = action.icon

  return (
    <div
      className={
        action.primary
          ? "rounded-lg bg-[#006bff] p-4 text-white"
          : "rounded-lg border border-[#e3e9f1] bg-[#f3f6fa] p-4 text-[#111827]"
      }
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-sm">{action.title}</strong>
            {action.badge ? (
              <span className="rounded-full border border-[#d5e6ff] bg-white px-1.5 py-0.5 text-[7px] font-bold text-[#006bff]">
                {action.badge}
              </span>
            ) : null}
          </div>
          <p className={action.primary ? "mt-1 text-[10.5px] text-[#eaf3ff]" : "mt-1 text-[10.5px] text-[#657082]"}>
            {action.description}
          </p>
        </div>
      </div>
    </div>
  )
}

function WorkflowSection() {
  return (
    <section className="bg-[#f6f7f9] px-6 py-24 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-[1120px] items-center gap-14 lg:grid-cols-[440px_1fr]">
        <div>
          <p className="text-[13px] font-black text-[#60656b]">WORKFLOW</p>
          <h2 className="mt-7 text-[34px] font-black leading-[1.22] sm:text-[40px]">
            PSD가 수정 가능한
            <br />
            화면이 되는 4단계
          </h2>
          <p className="mt-5 text-[17px] leading-7 text-[#60656b]">
            가져오기, 분석, 보정, 전달까지 작업 흐름이 한 화면에서 끝납니다.
          </p>
          <div className="mt-10 grid gap-3">
            {workflowSteps.map((step) => (
              <div key={step.number} className="grid grid-cols-[44px_1fr] gap-4 rounded-lg bg-white p-4 shadow-sm">
                <span className="flex size-9 items-center justify-center rounded bg-[#050505] text-xs font-black text-white">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-black">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#60656b]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-[0_18px_40px_rgba(15,24,42,0.08)]">
          <div className="flex items-center justify-between border-b border-[#e7ecf3] pb-5">
            <div>
              <p className="text-xs font-bold text-[#60656b]">source.psd</p>
              <h3 className="mt-1 text-xl font-black">Editable Figma</h3>
            </div>
            <MousePointerClick className="size-7 text-[#005bff]" aria-hidden="true" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[#f3f6fa] p-4">
              <p className="text-sm font-black">소스 레이어</p>
              {["hero title", "button group", "image mask", "shadow effect"].map((item) => (
                <div key={item} className="mt-3 flex items-center gap-2 text-xs text-[#657082]">
                  <span className="size-2 rounded-full bg-[#c8d0dc]" />
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-[#dbe7ff] bg-[#f8fbff] p-4">
              <p className="text-sm font-black">변환 결과</p>
              {["오토레이아웃", "텍스트 편집", "이미지 교체", "효과 분리"].map((item) => (
                <div key={item} className="mt-3 flex items-center gap-2 text-xs text-[#273142]">
                  <Check className="size-3.5 text-[#005bff]" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {qualityPoints.map((point) => {
              const Icon = point.icon

              return (
                <div key={point.label} className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                  <Icon className="size-5 shrink-0 text-[#0a0a0a]" aria-hidden="true" />
                  <strong className="text-sm">{point.label}</strong>
                  <span className="text-xs text-[#5f6368]">{point.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function FileImportSection() {
  return (
    <section className="px-6 py-24 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-[1120px] text-center">
        <p className="text-[13px] font-black text-[#60656b]">IMPORT FLOW</p>
        <h2 className="mt-7 text-[34px] font-black leading-[1.22] sm:text-[40px]">
          PSD뿐만 아니라
          <br />
          다양한 파일을 가져옵니다
        </h2>
        <p className="mx-auto mt-5 max-w-[700px] text-[17px] leading-7 text-[#60656b]">
          PSD, AI, PDF, PPTX처럼 흩어진 원본을 Figma-ready 구조로 정리합니다.
        </p>
        <div className="mt-12 overflow-hidden rounded-lg bg-white shadow-[0_18px_40px_rgba(15,24,42,0.08)] ring-1 ring-[#e7ecf3]">
          <div className="flex h-11 items-center bg-[#050505] px-5 text-sm text-white">
            <UploadCloud className="mr-3 size-5" aria-hidden="true" />
            import queue
            <span className="ml-auto text-xs text-white/70">drag files here</span>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
            <div className="grid gap-3 sm:grid-cols-3">
              {fileTypes.map((type) => (
                <div key={type} className="rounded-lg border border-[#e7ecf3] bg-[#fafafa] p-5 text-left">
                  <span className="text-xs font-black text-[#60656b]">{type}</span>
                  <p className="mt-8 h-2 rounded-full bg-[#d9dde1]" />
                  <p className="mt-3 h-2 w-2/3 rounded-full bg-[#edf0f4]" />
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-[#f3f6fa] p-5 text-left">
              <div className="flex items-center justify-between">
                <strong className="text-sm">변환 기준</strong>
                <span className="rounded-full bg-[#005bff] px-2 py-1 text-[10px] font-bold text-white">SAVED</span>
              </div>
              {["레이어 이름 정리", "이미지 누락 검사", "텍스트 추출", "효과 분리"].map((item) => (
                <div key={item} className="mt-4 flex items-center gap-2 text-sm text-[#4b5563]">
                  <CheckCircle2 className="size-4 text-[#005bff]" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  return (
    <section className="bg-[#050505] px-6 py-24 text-white sm:px-10 lg:px-12">
      <div className="mx-auto max-w-[1216px]">
        <p className="text-[15px] font-bold text-[#9a9a9a]">USE CASES</p>
        <h2 className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[32px] font-black leading-[1.25] sm:text-[36px]">
          <span>이럴 때</span>
          <PigmaLogo className="h-[28px] w-auto brightness-0 invert sm:h-[31px]" />
          <span>가 빠릅니다</span>
        </h2>
        <p className="mt-4 text-[17px] leading-7 text-[#b8b8b8]">
          기능 설명보다 실제 작업 상황에 바로 꽂히는 15가지입니다.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {useCases.map((item) => {
            const Icon = item.icon

            return (
              <article key={item.title} className="rounded-2xl bg-[#171717] p-5">
                <div className="flex size-[34px] items-center justify-center rounded-[10px] bg-white text-[#050505]">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-[12.5px] leading-[18px] text-[#bdbdbd]">{item.description}</p>
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
          귀여운 가격
          <br />
          그렇지 못한 실력
        </h2>
        <div className="mt-12 grid gap-5 text-left md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.featured
                  ? "rounded-lg bg-[#050505] p-6 text-white shadow-[0_18px_40px_rgba(15,24,42,0.16)]"
                  : "rounded-lg bg-white p-6 text-[#050505] shadow-[0_18px_40px_rgba(15,24,42,0.08)] ring-1 ring-[#e7ecf3]"
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black">{plan.name}</h3>
                <ArrowRight className="size-4" aria-hidden="true" />
              </div>
              <p className="mt-6 text-4xl font-black">{plan.price}</p>
              <p className={plan.featured ? "mt-3 text-sm text-white/70" : "mt-3 text-sm text-[#60656b]"}>
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className={plan.featured ? "size-4 text-white" : "size-4 text-[#005bff]"} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#top"
                className={
                  plan.featured
                    ? "mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg bg-white text-sm font-bold text-[#050505] transition hover:bg-[#f2f2f2]"
                    : "mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#050505] text-sm font-bold text-white transition hover:bg-[#222]"
                }
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 rounded-lg bg-[#fafafa] px-5 py-3 text-xs text-[#60656b] ring-1 ring-[#e7ecf3]">
          초기 가격은 Figma 플러그인 MVP 기준이며 출시 전 변경될 수 있습니다.
        </p>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="bg-[#050505] px-6 py-20 text-white sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold text-[#9a9a9a]">READY</p>
          <h2 className="mt-4 text-[32px] font-black leading-[1.2] sm:text-[40px]">
            바로 PSD를 끌고
            <br />
            빠르게 수정하세요.
          </h2>
        </div>
        <a
          href="#pricing"
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-6 text-[15px] font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0]"
        >
          무료 시작
          <ArrowRight className="size-4" aria-hidden="true" />
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
          <PigmaLogo className="h-[18px] w-[100px] brightness-0 invert" />
          <span>PSD를 Figma-ready 구조로 바꾸는 플러그인</span>
        </div>
        <div className="flex gap-6">
          <a href="#product" className="transition hover:text-white">
            제품
          </a>
          <a href="#features" className="transition hover:text-white">
            기능
          </a>
          <a href="#pricing" className="transition hover:text-white">
            가격
          </a>
        </div>
      </div>
    </footer>
  )
}
