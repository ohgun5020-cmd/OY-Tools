import type { ReactNode } from "react"

import { FIGMA_PLUGIN_URL } from "@/lib/links"
import { stringifyJsonLd } from "@/lib/seo"

import { SimpleSiteFooter, SimpleSiteHeader } from "./PolicyPage"

type Cta = {
  label: string
  href: string
  external?: boolean
}

type FeatureBlock = {
  title: string
  body: string
}

type StepBlock = {
  title: string
  body: string
}

type FaqItem = {
  question: string
  answer: string
}

type SeoLandingPageProps = {
  eyebrow: string
  title: ReactNode
  description: string
  primaryCta?: Cta
  secondaryCta?: Cta
  proofPoints: string[]
  featureTitle: string
  features: FeatureBlock[]
  stepsTitle: string
  steps: StepBlock[]
  comparisonTitle: string
  comparisonIntro: string
  comparisonItems: string[]
  faq: FaqItem[]
  jsonLd: unknown
}

const defaultPrimaryCta: Cta = {
  label: "Open PIGER on Figma",
  href: FIGMA_PLUGIN_URL,
  external: true,
}

const defaultSecondaryCta: Cta = {
  label: "See pricing",
  href: "/pricing",
}

export function SeoLandingPage({
  eyebrow,
  title,
  description,
  primaryCta = defaultPrimaryCta,
  secondaryCta = defaultSecondaryCta,
  proofPoints,
  featureTitle,
  features,
  stepsTitle,
  steps,
  comparisonTitle,
  comparisonIntro,
  comparisonItems,
  faq,
  jsonLd,
}: SeoLandingPageProps) {
  return (
    <main className="min-h-screen bg-white text-[#050505]">
      <script
        id="seo-landing-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
      <SimpleSiteHeader />

      <section className="bg-[#f7f9fc] px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#005bff]">{eyebrow}</p>
            <h1 className="mt-4 max-w-[760px] text-[40px] font-black leading-[1.08] sm:text-[58px]">{title}</h1>
            <p className="mt-6 max-w-[760px] text-[17px] leading-8 text-[#424850] sm:text-[19px]">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LandingButton cta={primaryCta} primary />
              <LandingButton cta={secondaryCta} />
            </div>
          </div>

          <aside className="rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,24,42,0.08)] ring-1 ring-[#e7ecf3]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#60656b]">Search intent fit</p>
            <div className="mt-5 grid gap-3">
              {proofPoints.map((point) => (
                <div key={point} className="flex gap-3 rounded-lg bg-[#f7f9fc] p-3 text-sm font-bold leading-6 text-[#303844]">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-[#005bff]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-10 sm:py-18">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-[30px] font-black leading-tight sm:text-[42px]">{featureTitle}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-lg bg-white p-6 shadow-[0_14px_36px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3]">
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#424850]">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-6 py-14 text-white sm:px-10 sm:py-18">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-[30px] font-black leading-tight sm:text-[42px]">{stepsTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
                <p className="text-sm font-black text-[#8bb7ff]">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-white/72">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-10 sm:py-18">
        <div className="mx-auto grid max-w-[1120px] gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#005bff]">Why this matters</p>
            <h2 className="mt-4 text-[30px] font-black leading-tight sm:text-[40px]">{comparisonTitle}</h2>
            <p className="mt-4 text-[16px] leading-8 text-[#424850]">{comparisonIntro}</p>
          </div>
          <div className="grid gap-3">
            {comparisonItems.map((item) => (
              <div key={item} className="rounded-lg bg-[#f7f9fc] px-5 py-4 text-[15px] font-bold leading-7 text-[#303844] ring-1 ring-[#e7ecf3]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f9fc] px-6 py-14 sm:px-10 sm:py-18">
        <div className="mx-auto max-w-[900px]">
          <h2 className="text-[30px] font-black leading-tight sm:text-[40px]">FAQ</h2>
          <div className="mt-7 grid gap-4">
            {faq.map((item) => (
              <article key={item.question} className="rounded-lg bg-white p-6 ring-1 ring-[#e7ecf3]">
                <h3 className="text-lg font-black">{item.question}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#424850]">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-10">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-5 rounded-lg bg-[#005bff] p-6 text-white sm:p-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-white/70">PIGER</p>
            <h2 className="mt-2 text-[26px] font-black leading-tight sm:text-[34px]">Start with one PSD workflow and measure the result.</h2>
          </div>
          <LandingButton cta={primaryCta} inverted />
        </div>
      </section>

      <SimpleSiteFooter />
    </main>
  )
}

function LandingButton({ cta, primary = false, inverted = false }: { cta: Cta; primary?: boolean; inverted?: boolean }) {
  const className = inverted
    ? "inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-[#005bff] transition hover:-translate-y-0.5"
    : primary
      ? "inline-flex h-12 items-center justify-center rounded-lg bg-[#005bff] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#004de0]"
      : "inline-flex h-12 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-[#111] ring-1 ring-[#dce3ee] transition hover:-translate-y-0.5 hover:text-[#005bff]"

  return (
    <a href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noreferrer" : undefined} className={className}>
      {cta.label}
    </a>
  )
}
