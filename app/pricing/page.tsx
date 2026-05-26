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
    description: "For trying the core workflow and checking file structure.",
    features: ["3 conversions per month", "Basic layer cleanup", "Small file tests"],
    cta: "Start free",
    href: "/signup",
  },
  {
    name: "Basic",
    price: "$2",
    period: "per month",
    description: "For individual designers who need recurring file conversion support.",
    features: ["30 conversions per month", "Text extraction", "AI design questions"],
    cta: "Choose Basic",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "$5",
    period: "per month",
    description: "For heavier design workflows, outsourced files, and repeated cleanup work.",
    features: ["Unlimited queue", "Effect separation", "Team handoff reports"],
    cta: "Choose Pro",
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
            Convert and prepare PSD, AI, EPS, PDF, PPT, and SVG files for editable Figma workflows. Prices are in USD
            and billed monthly unless stated otherwise.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto grid max-w-[1020px] gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="flex min-h-[410px] flex-col rounded-lg bg-white p-6 shadow-[0_18px_40px_rgba(15,24,42,0.08)] ring-1 ring-[#e7ecf3]"
            >
              <h2 className="text-xl font-black">{plan.name}</h2>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black">{plan.price}</span>
                <span className="pb-1 text-sm font-bold text-[#60656b]">{plan.period}</span>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#60656b]">{plan.description}</p>
              <ul className="mt-6 grid gap-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1 size-2 rounded-full bg-[#005bff]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
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
