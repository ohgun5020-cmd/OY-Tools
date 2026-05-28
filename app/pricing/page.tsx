import type { Metadata } from "next"

import { SimpleSiteFooter, SimpleSiteHeader } from "../_components/PolicyPage"

export const metadata: Metadata = {
  title: "Pricing | PIGMA",
  description: "PIGMA pricing for PSD to Figma-ready conversion and design workflow tools.",
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "가입 후 Basic을 먼저 맛보고, 작은 파일로 흐름을 확인합니다.",
    features: ["월 3회 변환", "Basic 7일 체험", "기본 파일 구조 확인", "작은 파일 테스트"],
    cta: "무료 시작",
    href: "/signup",
  },
  {
    name: "Basic",
    price: "$2",
    period: "per month",
    description: "개인 작업자가 자주 쓰는 정리 버튼을 담았습니다.",
    features: [
      "월 30회 변환",
      "잠긴 레이어 해제",
      "컴포넌트 해제",
      "긴 프레임 나누기",
      "정수 픽셀 교정",
      "텍스트/행간 정리",
      "기본 이미지 보정",
      "GIF/APNG 변환",
    ],
    cta: "Basic 선택",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "$5",
    period: "per month",
    description: "Basic에 AI 검수와 고급 이미지 작업을 더합니다.",
    features: ["Basic 전체 포함", "디자인 읽기/검수", "디자인 일관성 검사", "이미지 확장", "이미지 업스케일", "고급 자동화 준비"],
    cta: "Pro 선택",
    href: "/signup",
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-[#050505]">
      <SimpleSiteHeader />
      <section className="bg-[#f7f9fc] px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1020px] text-center">
          <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">PIGMA PRICING</p>
          <h1 className="mt-4 text-[42px] font-black leading-tight sm:text-[60px]">Simple plans for design cleanup</h1>
          <p className="mx-auto mt-5 max-w-[720px] text-[17px] leading-8 text-[#60656b]">
            Free는 맛보기와 Basic 체험, Basic은 실무 정리 버튼, Pro는 고급 AI 검수와 이미지 작업을 위한 플랜입니다.
            Prices are in USD and billed monthly unless stated otherwise.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-[1020px] gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="flex min-h-[430px] flex-col rounded-lg bg-white p-6 shadow-[0_18px_40px_rgba(15,24,42,0.08)] ring-1 ring-[#e7ecf3]"
            >
              <h2 className="text-xl font-black">{plan.name}</h2>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black">{plan.price}</span>
                <span className="pb-1 text-sm font-bold text-[#60656b]">{plan.period}</span>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#60656b]">{plan.description}</p>
              <div className="mb-7 mt-6 flex min-h-[116px] flex-wrap content-start gap-2" aria-label={`${plan.name} included features`}>
                {plan.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex min-h-8 items-center rounded-full bg-[#f5f7fb] px-3 text-[12px] font-bold leading-4 text-[#303844] ring-1 ring-[#e4eaf3]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <a
                href={plan.href}
                className="mt-auto inline-flex h-11 items-center justify-center rounded-lg bg-[#050505] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#005bff]"
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[820px] rounded-lg bg-[#f7f9fc] px-5 py-4 text-center text-sm leading-6 text-[#60656b] ring-1 ring-[#e7ecf3]">
          Paid subscriptions renew automatically until canceled. See our{" "}
          <a href="/terms" className="font-black text-[#005bff]">
            Terms of Service
          </a>
          ,{" "}
          <a href="/privacy" className="font-black text-[#005bff]">
            Privacy Policy
          </a>
          , and{" "}
          <a href="/refund-policy" className="font-black text-[#005bff]">
            Refund Policy
          </a>
          .
        </div>
      </section>
      <SimpleSiteFooter />
    </main>
  )
}
