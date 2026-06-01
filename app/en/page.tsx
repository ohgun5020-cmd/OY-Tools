"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

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
    sectionTitle: ["Typos?", "Cut before launch"],
    sectionLead: "Catch typos in product pages and campaign copy, pin them with notes, and fix fast.",
    eyebrow: "DESIGNER PICK",
    icon: "check_circle",
    title: "Audit",
    description: "Spot sneaky typos before launch day. No drama.",
    actions: [
      { title: "Typo Check", description: "Find copy slips", icon: "spellcheck", badge: "AI" },
      { title: "Share Notes", description: "Point fixes out", icon: "rate_review" },
      { title: "Result Panel", description: "Review only hits", icon: "fact_check" },
    ],
    mini: "audit",
  },
  {
    id: "feature-layer-cleanup",
    sectionTitle: ["Messy files?", "Clean-fit in a click"],
    sectionLead: "Unlock layers, flatten components, and split long frames so handed-off files become edit-ready.",
    eyebrow: "DESIGNER PICK",
    icon: "layers",
    title: "Layer Cleanup",
    description: "Cut cleanup time when a freelancer file or messy PSD lands in your lap.",
    actions: [
      { title: "Unlock Layers", description: "Remove locks", icon: "lock_open" },
      { title: "Detach Components", description: "Make it editable", icon: "link_off" },
      { title: "Split Long Frames", description: "Break into chunks", icon: "splitscreen" },
    ],
    mini: "layers",
  },
  {
    id: "feature-align",
    sectionTitle: ["Half-pixels?", "Make it crisp"],
    sectionLead: "Snap pixels, button sizes, and corner radii into a cleaner fit.",
    eyebrow: "DESIGNER PICK",
    icon: "tune",
    title: "Align / Fix",
    description: "Fix half-pixels, uneven buttons, and tilted elements in one flow.",
    actions: [
      { title: "Pixel Snap", description: "Clean blurry lines", icon: "grid_4x4" },
      { title: "Button Fit", description: "Fit to label", icon: "fit_screen" },
      { title: "Radius Cleanup", description: "Batch radius fix", icon: "rounded_corner" },
    ],
    mini: "align",
  },
  {
    id: "feature-text",
    sectionTitle: ["Copy and translation", "done in-canvas"],
    sectionLead: "Translate, fix typos, highlight text, and tune line height without leaving the mockup.",
    eyebrow: "DESIGNER PICK",
    icon: "text_fields",
    title: "Text",
    description: "Edit copy, translate, highlight, and tune spacing right inside the design.",
    actions: [
      { title: "Translate Text", description: "Prep multilingual drafts", icon: "translate", badge: "AI" },
      { title: "Fix Typos Inline", description: "Apply fixes instantly", icon: "edit_note" },
      { title: "Highlight", description: "Mark key copy", icon: "border_color" },
    ],
    mini: "text",
  },
  {
    id: "feature-image-fix",
    sectionTitle: ["Image assets?", "Grab them on the fly"],
    sectionLead: "Save originals, pull palettes, and adjust crops without breaking your flow.",
    eyebrow: "DESIGNER PICK",
    icon: "image",
    title: "Image Fix",
    description: "Extract originals, check palettes, and clean crops right inside the canvas.",
    actions: [
      { title: "Save Original", description: "Pull source fast", icon: "download" },
      { title: "Extract Colors", description: "Use as palette", icon: "palette" },
      { title: "Crop Fit", description: "Clean crop + position", icon: "crop_free" },
    ],
    mini: "image",
  },
  {
    id: "feature-image-generate",
    sectionTitle: ["Missing background?", "Stretch the vibe"],
    sectionLead: "Extend images, boost resolution, and pull text so drafts look more finished.",
    eyebrow: "DESIGNER PICK",
    icon: "auto_awesome",
    title: "Image Gen / Extend",
    description: "Stretch cropped backgrounds and upgrade low-res assets for better mockups.",
    actions: [
      { title: "Extend Image", description: "Extend cropped bg", icon: "crop_free", badge: "AI" },
      { title: "Upscale Image", description: "Restore detail", icon: "high_quality", badge: "AI" },
      { title: "Extract Image Text", description: "Prep text layers", icon: "text_fields", badge: "AI" },
    ],
    mini: "generate",
  },
  {
    id: "feature-share",
    sectionTitle: ["Share links?", "Keep it clean"],
    sectionLead: "Clean up long URLs and prototype links before they hit the client chat.",
    eyebrow: "DESIGNER PICK",
    icon: "share",
    title: "Share Kit",
    description: "Turn messy Figma and prototype links into share-ready assets in seconds.",
    actions: [
      { title: "Shorten Link", description: "Make share URL", icon: "link" },
      { title: "Prototype Link", description: "Copy review link", icon: "content_copy" },
      { title: "Create QR Code", description: "Share review link", icon: "qr_code_2" },
    ],
    mini: "share",
  },
  {
    id: "feature-video",
    sectionTitle: ["Static mockups?", "Motion makes it pop"],
    sectionLead: "Make quick motion drafts with AI video, GIF, and APNG conversion.",
    eyebrow: "DESIGNER PICK",
    icon: "auto_awesome",
    title: "Motion",
    description: "Prep moving banners and short-form mockups with AI video plus GIF/APNG conversion.",
    actions: [
      { title: "AI Video Gen", description: "Make draft video", icon: "movie", badge: "AI" },
      { title: "Video to GIF", description: "Share lightweight motion", icon: "gif_box" },
      { title: "Video to APNG", description: "Transparent motion asset", icon: "animation" },
      { title: "Extract Thumbnail", description: "Save hero frame", icon: "image" },
    ],
    mini: "video",
  },
]

const featureActionDetails: Record<string, string> = {
  "Typo Check": "Scan titles, buttons, and detail copy to call out sneaky typos and awkward lines first.",
  "Share Notes": "Leave fix notes exactly where designers or clients need to look.",
  "Result Panel": "Collect findings in one panel so you fix the real hits without hunting through the whole canvas.",
  "Unlock Layers": "Unlock layers that block edits and turn them into workable objects.",
  "Detach Components": "Detach component-heavy structures so text and images can be edited separately.",
  "Split Long Frames": "Split long pages into workable sections so the file is easier to manage.",
  "Pixel Snap": "Snap blurry lines and boxes from half-pixels onto clean integer coordinates.",
  "Button Fit": "Tune padding and size to the label so buttons stop looking off.",
  "Radius Cleanup": "Normalize uneven corner values so the screen feels consistent.",
  "Translate Text": "Drop multilingual copy into the original layout and make a review-ready draft fast.",
  "Fix Typos Inline": "Apply typo and copy fixes directly to text layers to cut revision loops.",
  "Highlight": "Highlight important copy or check areas so reviewers see the right points first.",
  "Save Original": "Pull embedded images out of PSDs or docs so they can be reused.",
  "Extract Colors": "Extract key colors from the mockup and line them up with brand color rules.",
  "Crop Fit": "Clean crop position and visible area so image framing lands right.",
  "Extend Image": "Extend missing backgrounds or cropped images to fit banners and long pages.",
  "Upscale Image": "Sharpen small or blurry images so they work better in drafts and shares.",
  "Extract Image Text": "Pull text out of images and prep it for editable text layers.",
  "Shorten Link": "Shorten long Figma or review URLs so they look clean in chat and email.",
  "Prototype Link": "Copy prototype links fast so clickable flows are ready to share.",
  "Create QR Code": "Turn review links into QR codes so they open fast on mobile.",
  "AI Video Gen": "Turn static drafts into quick motion examples or video mockups.",
  "Video to GIF": "Convert heavy video into GIFs that are easier to drop into chat or docs.",
  "Video to APNG": "Prepare APNG motion assets with transparency for design use.",
  "Extract Thumbnail": "Pick a key frame from motion work and save it as a thumbnail.",
}

const aiActions: ActionItem[] = [
  {
    title: "Vibe Check",
    description: "Check direction fast",
    icon: "help_outline",
    primary: true,
    badge: "AI",
  },
  {
    title: "Top 3 Fixes",
    description: "Prioritize the hits",
    icon: "playlist_add_check",
  },
  {
    title: "Tune Copy Tone",
    description: "Smooth the wording",
    icon: "chat_bubble_outline",
  },
]

const workflowSteps = [
  {
    number: "01",
    title: "Bring It In",
    description: "Import PSD, AI, EPS, PDF, PPT, and SVG files.",
    icon: "file_upload",
    active: true,
  },
  {
    number: "02",
    title: "Clean It Up",
    description: "Organize layers and text so they are easy to edit.",
    icon: "layers",
  },
  {
    number: "03",
    title: "Tune What Matters",
    description: "Apply checks, typo fixes, and image cleanup only where needed.",
    icon: "tune",
  },
  {
    number: "04",
    title: "Share It Fast",
    description: "Share by link and save repeatable cleanup rules.",
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
  { label: "Layers", value: "Group/order cleanup", icon: "layers" },
  { label: "Text", value: "Editable text", icon: "text_fields" },
  { label: "Images", value: "Fix broken images", icon: "image" },
  { label: "Effects", value: "Check effect splits", icon: "auto_fix_high" },
]

const useCases: UseCase[] = [
  {
    title: "Revive Old PSDs",
    description: "When old source files need new edits",
    icon: "history",
  },
  {
    title: "Clean Vendor Files",
    description: "When handoff files need team standards",
    icon: "folder_open",
  },
  {
    title: "Swap Rush Banners",
    description: "When only copy and images need a fast swap",
    icon: "campaign",
  },
  {
    title: "Rework Product Pages",
    description: "When PSD outputs need to be split and edited",
    icon: "storefront",
  },
  {
    title: "Fit Brand Templates",
    description: "When repeat layouts need one clear standard",
    icon: "palette",
  },
  {
    title: "Check Missing Bits",
    description: "When text or images might be broken",
    icon: "check_circle",
  },
  {
    title: "Tidy Layer Names",
    description: "When messy group names need clarity",
    icon: "edit",
  },
  {
    title: "Reuse Raster Text",
    description: "When raster text needs to become editable",
    icon: "text_fields",
  },
  {
    title: "Extend Image Backgrounds",
    description: "When background space needs a natural extension",
    icon: "open_in_full",
  },
  {
    title: "Spin Up Thumbnails",
    description: "When one layout needs multiple sizes",
    icon: "grid_view",
  },
  {
    title: "Re-edit PPT/PDF",
    description: "When document-style designs need edits",
    icon: "description",
  },
  {
    title: "Swap Campaign Assets",
    description: "When seasonal copy and images need a swap",
    icon: "shuffle",
  },
  {
    title: "Set Up Team Review",
    description: "When files need standards before sharing",
    icon: "playlist_add_check",
  },
  {
    title: "Ask AI for the Fix Angle",
    description: "When the screen needs a cleanup direction",
    icon: "auto_awesome",
  },
  {
    title: "Save Repeat Moves",
    description: "When recurring conversion rules should stick",
    icon: "tune",
  },
]

const plans: PricingPlan[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    description: "Try the flow first. Small files, low stakes, zero drama.",
    features: [
      { label: "7-day Basic trial", badge: "HOT" },
      { label: "3 PSD conversions / month" },
      { label: "Check file structure" },
      { label: "Test small files" },
      { label: "Save a free account" },
    ],
    cta: "Start free",
  },
  {
    key: "basic",
    name: "Basic",
    price: "$2/mo",
    description: "Solo cleanup staples, packed for everyday work.",
    features: [
      { label: "Unlock Layers", badge: "HOT" },
      { label: "Split Long Frames", badge: "HOT" },
      { label: "30 PSD conversions / month" },
      { label: "Detach Components" },
      { label: "Delete hidden layers" },
      { label: "Remove all guides" },
      { label: "Integer pixel fix" },
      { label: "Auto-fit buttons" },
      { label: "Clean corners" },
      { label: "Fix tilt" },
      { label: "Text Highlight" },
      { label: "Text line-height" },
      { label: "Image color extract" },
      { label: "GIF/APNG conversion" },
    ],
    cta: "Choose Basic",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$5/mo",
    description: "Basic plus AI checks and advanced image work for main-character production.",
    includedPrefix: "Basic features + AI",
    features: [
      { label: "50 PSD conversions / month", badge: "HOT" },
      { label: "Typo check / inline fix", badge: "NEW" },
      { label: "Translate Text", badge: "NEW" },
      { label: "Read / review designs" },
      { label: "Design consistency check" },
      { label: "Extract Image Text" },
      { label: "Reference image search" },
      { label: "Image prompt editing" },
      { label: "Extend Image" },
      { label: "Image upscale" },
      { label: "Object upscale" },
      { label: "Advanced automation prep" },
    ],
    cta: "Choose Pro",
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
  { title: "Keep Layer Structure", body: "Header / Hero / CTA" },
  { title: "Editable text", body: "Text stays editable" },
  { title: "Clean Images + Effects", body: "Separate cleanup points" },
  { title: "Plugin Cleanup Ready", body: "Run checks + cleanup" },
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
          aria-label="PIGMA home"
        >
          <PigmaLogo className="h-[18px] w-[88px] md:h-[19px] md:w-[100px]" />
        </a>
        <nav className="hidden items-center justify-start gap-14 pl-7 text-base font-bold text-[#0a0a0a] md:flex">
          <a href="#product" className="transition hover:text-[#005bff]">
            Product
          </a>
          <a href="#features" className="transition hover:text-[#005bff]">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-[#005bff]">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-5">
          <LanguageSwitch current="en" />
          <a href="/login" className="hidden font-bold text-[#0a0a0a] transition hover:text-[#005bff] sm:inline-flex">
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex h-12 min-w-[92px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-4 text-sm sm:min-w-[116px] sm:px-5 font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0] md:h-14 md:min-w-[132px] md:rounded-2xl md:px-7 md:text-base"
          >
            Start
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
        <a href="#top" className="flex items-center text-black" aria-label="PIGMA home">
          <PigmaLogo className="h-[18px] w-[88px] md:h-[19px] md:w-[100px]" />
        </a>

        <nav className="hidden items-center justify-start gap-14 pl-7 text-base font-bold text-[#0a0a0a] md:flex">
          <a href="#product" className="transition hover:text-[#005bff]">
            Product
          </a>
          <a href="#features" className="transition hover:text-[#005bff]">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-[#005bff]">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-5">
          <LanguageSwitch current="en" />
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
                  <span>Hi, {user.name}</span>
                </span>
              </a>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex h-12 min-w-[92px] items-center justify-center gap-2 rounded-xl bg-[#050505] px-4 text-sm sm:min-w-[116px] sm:px-5 font-bold text-white shadow-[0_10px_14px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-[#1c1c1c] md:h-14 md:min-w-[132px] md:rounded-2xl md:px-7 md:text-base"
                >
                  Log out
                  <MaterialIcon name="logout" className="text-[16px]" />
                </button>
              </form>
            </>
          ) : (
            <>
              <a href="/login" className="hidden font-bold text-[#0a0a0a] transition hover:text-[#005bff] sm:inline-flex">
                Log in
              </a>
              <a
                href="/signup"
                className="inline-flex h-12 min-w-[92px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-4 text-sm sm:min-w-[116px] sm:px-5 font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0] md:h-14 md:min-w-[132px] md:rounded-2xl md:px-7 md:text-base"
              >
                Start
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
      src="/assets/pigma-wordmark.svg"
      alt="PIGMA"
      className={className}
      width={100}
      height={18}
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
            With PIGMA
            <br />
            FIG to PSD, no drama
          </h1>
          <p className="mx-auto mt-7 max-w-[760px] text-[17px] leading-8 text-[#5f6368] sm:text-[19px]">
            Convert Figma work into PSD-ready output with the boring parts handled.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#pricing"
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#005bff] px-6 text-[15px] font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0] sm:w-[170px]"
            >
              Start free
              <MaterialIcon name="arrow_forward" className="text-[16px]" />
            </a>
            <a
              href="#pricing"
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-bold text-[#0a0a0a] shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 sm:w-[180px]"
            >
              <MaterialIcon name="attach_money" className="text-[16px]" />
              See pricing
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
              <h2 className="text-[22px] font-black leading-none">Auto Export</h2>
            </div>
            <AnimatedConversionProgressValue progress={conversionProgress} className="text-4xl" />
          </div>
          <AnimatedConversionProgressBar progress={conversionProgress} className="mt-5" />
          <p className="mt-4 text-[13px] font-medium text-[#0a0a0a]">
            Layers, text, and effects cleaned up for PSD export
          </p>
        </div>
        <div className="rounded-[14px] bg-white p-5 ring-1 ring-black/5">
          <div className="mb-4 flex items-center gap-3">
            <MaterialIcon name="ios_share" className="text-[20px]" />
            <strong className="text-lg">Export Ready</strong>
          </div>
          {["Keep layers", "Editable text", "Team-share ready"].map((item) => (
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
          PIGMA tools, ready when the vibe shifts
        </h2>
        <p className="mx-auto mt-5 max-w-[620px] text-center text-[15px] leading-7 text-white/62">
          Checks, cleanup, fixes, and sharing tools live where your workflow already is.
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
      <MiniHeading>Copy Check</MiniHeading>
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
        <strong className="absolute left-5 top-[10px] text-[11px] leading-[11px] text-[#111827]">Typo Alert</strong>
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
      <MiniHeading>Layer Cleanup</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[208px] rounded-lg bg-[#111]">
        <strong className="absolute left-5 top-[10px] text-[8px] leading-[10px] text-white">Messy File</strong>
        <span className="absolute left-[22px] top-[28px] size-2 rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[38px] top-[30px] h-1.5 w-[96px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[22px] top-[44px] size-2 rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[38px] top-[46px] h-1.5 w-[128px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[60px] top-[56px] size-2 rounded-full bg-[#006bff]" />
        <span className="absolute left-[76px] top-[58px] h-1.5 w-[104px] rounded-full bg-[#006bff]" />
        <span className="absolute right-5 top-[38px] text-[8px] text-[#c6d0da]">Locked</span>
      </div>
      <MaterialIcon name="arrow_forward" className="absolute left-[270px] top-[69px] text-[18px] text-[#006bff]" />
      <div className="absolute left-[292px] top-[51px] grid gap-2">
        <span className="flex h-[18px] w-12 items-center justify-center rounded-full bg-[#006bff] text-[8px] font-bold text-white">Unlock</span>
        <span className="flex h-[18px] w-12 items-center justify-center rounded-full bg-[#27b36a] text-[8px] font-bold text-white">Split</span>
      </div>
      <div className="absolute left-[367px] top-[43px] h-[66px] w-[201px] rounded-lg border border-[#cfe0ff] bg-white">
        <strong className="absolute left-5 top-[10px] text-[8px] leading-[10px] text-[#111827]">Clean Layers</strong>
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
      <MiniHeading>Pixel Fix</MiniHeading>
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
        <strong className="absolute left-4 top-2.5 text-[8px] leading-[10px] text-[#111827]">Auto-fit buttons</strong>
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
      <MiniHeading>Text Cleanup</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[205px] rounded-lg border border-[#d8e3ef] bg-white">
        <span className="absolute left-[18px] top-[12px] text-[7px] font-bold text-[#9ca3af]">KR</span>
        <span className="absolute left-[18px] top-[28px] h-1.5 w-[108px] rounded-full bg-[#c6d0da]" />
        <span className="absolute left-[18px] top-[43px] h-1.5 w-[132px] rounded-full bg-[#ffe2e5]" />
        <span className="absolute left-[18px] top-[55px] h-[3px] w-[132px] rounded-full bg-[#ff4d55]" />
      </div>
      <MaterialIcon name="arrow_forward" className="absolute left-[268px] top-[68px] text-[18px] text-[#111]" />
      <div className="absolute left-[291px] top-[50px] grid gap-2">
        <span className="flex h-[18px] w-[58px] items-center justify-center rounded-full bg-[#006bff] text-[8px] font-bold text-white">Translate</span>
        <span className="flex h-[18px] w-[58px] items-center justify-center rounded-full bg-[#111] text-[8px] font-bold text-white">Line height</span>
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
      <MiniHeading>Image Source</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[178px] rounded-lg border-2 border-[#006bff] bg-[#eaf3ff]">
        <div className="absolute left-[16px] top-[11px] h-6 w-[144px] rounded bg-[#d7ecff]" />
        <div className="absolute left-[16px] top-[34px] h-5 w-[144px] rounded bg-[#d7f8df]" />
        <span className="absolute left-[47px] top-[18px] h-[36px] w-[46px] rounded bg-[#1f2328]" />
        <span className="absolute right-[18px] top-[15px] size-3 rounded-full bg-[#ffd45a]" />
      </div>
      <MaterialIcon name="arrow_forward" className="absolute left-[252px] top-[68px] text-[18px] text-[#006bff]" />
      <div className="absolute left-[350px] top-[45px] h-[62px] w-[218px] rounded-lg border border-[#d8e3ef] bg-white">
        <strong className="absolute left-5 top-3 text-[8px] leading-[10px] text-[#111827]">Source + Palette</strong>
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
      <MiniHeading>AI Image Extend</MiniHeading>
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
        <strong className="absolute left-5 top-3 text-[8px] leading-[10px] text-[#111827]">Upscale / OCR</strong>
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
      <MiniHeading>Share Kit</MiniHeading>
      <div className="absolute left-[42px] top-[45px] h-[30px] w-[225px] rounded-full border border-[#d7dee8] bg-white">
        <span className="absolute left-[18px] top-[10px] text-[7px] font-bold text-[#9ca3af]">URL</span>
        <span className="absolute left-[55px] top-[13px] h-1 w-[134px] rounded-full bg-[#c6d0da]" />
      </div>
      <MaterialIcon name="arrow_forward" className="absolute left-[280px] top-[51px] text-[20px] text-[#006bff]" />
      <span className="absolute left-[340px] top-[43px] flex h-[34px] w-[156px] items-center justify-center rounded-xl bg-[#006bff] text-[11px] font-bold text-white">Short Link</span>
      <span className="absolute left-[510px] top-[47px] flex h-[26px] w-[58px] items-center justify-center rounded-full bg-[#111] text-[10px] font-bold text-white">Copy</span>
      <div className="absolute left-[86px] top-[88px] h-[15px] w-[373px] rounded-full bg-[#111]">
        <div className="h-full w-[66%] rounded-full bg-[#27b36a]" />
        <span className="absolute left-[74px] top-[3px] text-[7px] font-bold leading-[9px] text-white">Prototype review ready</span>
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
      <MiniHeading>Motion Convert</MiniHeading>
      <div className="absolute left-[42px] top-[43px] h-[66px] w-[202px] rounded-lg bg-[#111]">
        <span className="absolute left-[85px] top-[24px] flex h-5 w-7 items-center justify-center rounded bg-[#006bff] text-[10px] text-white">▶</span>
        <span className="absolute left-[126px] top-2 flex h-[18px] w-[65px] items-center justify-center rounded-full bg-[#006bff] text-[8px] font-bold text-white">AI Gen</span>
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
        <strong className="text-lg">Typo Alert</strong>
        <span className="inline-flex h-10 min-w-14 items-center justify-center rounded-full bg-[#006bff] px-5 text-lg font-black text-white">
          3
        </span>
      </div>
      <div className="mt-1 grid gap-3">
        {[
          ["Typo Check", "bg-[#ff4d55]"],
          ["Share Notes", "bg-[#c8d0dc]"],
          ["Result Panel", "bg-[#c8d0dc]"],
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
      <div className="rounded-xl bg-[#111] px-4 py-6 text-center text-sm font-bold text-white">Locked</div>
      <div className="flex items-center justify-center gap-3">
        <MaterialIcon name="arrow_forward" className="text-[24px] text-[#006bff]" />
        <div className="grid gap-2">
          <span className="rounded-full bg-[#006bff] px-7 py-2 text-center text-sm font-bold text-white">Unlock</span>
          <span className="rounded-full bg-[#27b36a] px-7 py-2 text-center text-sm font-bold text-white">Split</span>
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#e7ecf3]">
        <strong className="text-sm">Clean Layers</strong>
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
        <strong className="text-lg">Pixel Fix</strong>
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
        Auto-fit buttons
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
          <span className="rounded-full bg-[#006bff] px-6 py-2 text-sm font-bold text-white">Translate</span>
          <span className="rounded-full bg-[#111] px-6 py-2 text-sm font-bold text-white">Line height</span>
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
        <span className="rounded-full bg-[#006bff] px-5 py-2 text-sm font-bold text-white">Image Source</span>
        <MaterialIcon name="arrow_forward" className="text-[24px] text-[#006bff]" />
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#e7ecf3]">
        <div className="flex items-center justify-between">
          <strong className="text-sm">Source + Palette</strong>
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
      <strong className="text-lg">Upscale / OCR</strong>
      <div className="mt-5 grid grid-cols-[90px_1fr] gap-3">
        <span className="rounded-full bg-[#006bff] px-5 py-2 text-center text-sm font-black text-white">2x</span>
        <span className="h-3 self-center rounded-full bg-[#c8d0dc]" />
        <span className="rounded-full bg-[#111] px-5 py-2 text-center text-sm font-black text-white">TEXT</span>
        <span className="h-3 self-center rounded-full bg-[#c8d0dc]" />
      </div>
      <div className="mt-6 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-[#e7ecf3]">
        Extend cropped bg
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
        <span className="flex-1 rounded-full bg-[#006bff] px-5 py-3 text-center text-sm font-bold text-white">Short Link</span>
        <span className="rounded-full bg-[#111] px-5 py-3 text-sm font-bold text-white">Copy</span>
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
          <span className="rounded-full bg-[#006bff] px-5 py-2 text-sm font-bold">AI Gen</span>
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
          <strong className="text-lg">Auto Convert</strong>
        </div>
        <AnimatedConversionProgressValue progress={conversionProgress} className="text-3xl" />
      </div>
      <AnimatedConversionProgressBar progress={conversionProgress} className="mt-5" />
      <div className="mt-5 grid gap-2 text-xs text-[#657082]">
        {["source.psd scan", "Text extract", "Effects Split"].map((item) => (
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
        <strong className="text-lg">Saved Rules</strong>
      </div>
      {["Layer name cleanup", "Missing image scan", "Text extract", "Effects Split"].map((item) => (
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
            Turn PSD into
            <br />
            editable Figma, no stress
          </h2>
          <p className="mt-6 text-[18px] leading-8 text-[#5f6368] sm:text-[22px]">
            Import, clean up, then apply only the fixes that matter.
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
                source.psd&nbsp; -&gt;&nbsp; pigma&nbsp; -&gt;&nbsp; team-ready figma
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
    <div className="hidden h-[116px] items-center justify-center md:flex" aria-label="Converting">
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
            Ready for team share
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
          Not just PSD
          <br />
          bring the whole file squad
        </h2>
        <p className="mx-auto mt-6 max-w-[960px] text-[17px] leading-[30px] text-[#5f6368] sm:text-[20px]">
          Import PSD, AI, EPS, PDF, PPT, and SVG, then make layers and text editable again in Figma.
        </p>

        <div className="mt-[52px] overflow-hidden rounded-2xl bg-white text-left shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
          <div className="flex h-11 items-center bg-[#090909] px-[22px] text-white">
            <span className="size-2.5 rounded-full bg-[#ff6b5f]" />
            <span className="ml-2 size-2.5 rounded-full bg-[#ffca4b]" />
            <span className="ml-2 size-2.5 rounded-full bg-[#32d074]" />
            <span className="ml-8 text-[13px] leading-4">source files&nbsp; -&gt;&nbsp; pigma&nbsp; -&gt;&nbsp; editable figma</span>
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
                Still shipping updates
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
                <span className="text-[9px] font-black leading-none text-[#111]">Converting</span>
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
          <span>For these</span>
          <PigmaLogo className="h-[28px] w-auto brightness-0 invert sm:h-[31px]" />
          <span>jobs, PIGMA moves fast</span>
        </h2>
        <p className="mt-4 text-center text-[17px] leading-7 text-[#b8b8b8]">
          15 real-work moments where PIGMA saves the scroll, the stress, and the side quests.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {useCases.map((item, index) => {
            const isActive = index === activeUseCaseIndex

            return (
            <article
              key={item.title}
              onMouseEnter={() => setActiveUseCaseIndex(index)}
              className={
                isActive
                  ? "group relative min-h-[158px] -translate-y-2 overflow-hidden rounded-2xl border border-[#005bff] bg-white p-5 text-[#050505] shadow-[0_24px_70px_rgba(0,91,255,0.38)] transition duration-500"
                  : "group relative min-h-[158px] overflow-hidden rounded-2xl border border-white/5 bg-[#171717] p-5 text-white transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-[#202020]"
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
                    : "flex size-[34px] items-center justify-center rounded-[10px] bg-white text-[#050505] transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#005bff] group-hover:text-white"
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
          Tiny price
          <br />
          main-character workflow
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
          Early pricing is based on the Figma plugin MVP and may change before launch.
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
        reject(new Error("Could not load Paddle.js."))
      }
    })
    script.addEventListener("error", () => reject(new Error("Could not load Paddle.js.")))

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
      locale: "en",
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
      <a href="/dashboard" className={className}>
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
        setCheckoutError(data?.error || "Something went wrong while opening checkout.")
        setPending(false)
        return
      }

      await openPaddleCheckout(data.checkout)
      setPending(false)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Something went wrong while opening checkout.")
      setPending(false)
    }
  }

  return (
    <>
      <button type="button" onClick={startCheckout} disabled={pending} className={className}>
        {pending ? "Opening checkout" : plan.cta}
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
            PSD conversion, quick.
            <br />
            Edits stay quick.
          </h2>
        </div>
        <a
          href="#pricing"
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-6 text-[15px] font-bold text-white shadow-[0_10px_14px_rgba(0,91,255,0.16)] transition hover:-translate-y-0.5 hover:bg-[#004de0]"
        >
          Start free
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
          <PigmaLogo className="h-[18px] w-[100px] brightness-0 invert" />
          <span>A plugin that turns PSD into Figma-ready structure</span>
        </div>
        <div className="flex flex-wrap gap-6">
          <a href="#product" className="transition hover:text-white">
            Product
          </a>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>
          <a href="/login" className="transition hover:text-white">
            Log in
          </a>
          <a href="/signup" className="transition hover:text-white">
            Sign up
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
