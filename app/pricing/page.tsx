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
    description: "일단 가볍게 찍먹. 작은 파일로 변환 흐름부터 확인해요.",
    features: [
      { label: "무료 PSD 5회", badge: "HOT" },
      { label: "계정당 총 5회 PSD 변환" },
      { label: "파일 구조 확인" },
      { label: "작은 파일 테스트" },
      { label: "무료 계정 저장" },
    ],
    cta: "무료 시작",
    href: "/signup",
  },
  {
    name: "Basic",
    price: "$2",
    period: "per month",
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
    href: "/signup",
  },
  {
    name: "Pro",
    price: "$5",
    period: "per month",
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
          <h1 className="mt-4 text-[42px] font-black leading-tight sm:text-[60px]">가격은 가볍게, 기능은 야무지게</h1>
          <p className="mx-auto mt-5 max-w-[720px] text-[17px] leading-8 text-[#60656b]">
            Free는 가볍게 찍먹, Basic은 실무 정리, Pro는 AI 검수와 이미지 작업까지 챙기는 플랜입니다.
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
              {plan.includedPrefix ? (
                <p className="mt-5 text-[11px] font-black leading-4 text-[#005bff]">
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
                    className="inline-flex min-h-[26px] items-center gap-1 rounded-full bg-[#f5f7fb] px-2.5 text-[10.5px] font-black leading-3 text-[#303844] ring-1 ring-[#e4eaf3]"
                  >
                    {feature.badge ? (
                      <em className={feature.badge === "HOT" ? "not-italic text-[8px] font-black leading-none text-[#005bff]" : "not-italic text-[8px] font-black leading-none text-[#27b36a]"}>
                        {feature.badge}
                      </em>
                    ) : null}
                    {feature.label}
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
