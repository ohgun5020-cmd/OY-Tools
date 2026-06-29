import type { ReactNode } from "react"

type PolicySection = {
  title: string
  children: ReactNode
}

type PolicyPageProps = {
  title: string
  description: string
  lastUpdated?: string
  sections: PolicySection[]
}

function PigmaLogo({ className = "" }: { className?: string }) {
  return <img src="/assets/piger-wordmark.svg" alt="PIGER" className={className} width={100} height={20} />
}

export function SimpleSiteHeader() {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex h-20 max-w-[1120px] items-center justify-between px-6 sm:px-10">
        <a href="/" className="inline-flex items-center" aria-label="PIGER home">
          <PigmaLogo className="h-[18px] w-auto" />
        </a>
        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm font-bold text-[#111]">
          <a href="/psd-export" className="transition hover:text-[#005bff]">
            PSD Export
          </a>
          <a href="/psd-converter" className="transition hover:text-[#005bff]">
            PSD 변환
          </a>
          <a href="/pricing" className="transition hover:text-[#005bff]">
            Pricing
          </a>
          <a href="/terms" className="transition hover:text-[#005bff]">
            Terms
          </a>
          <a href="/privacy" className="transition hover:text-[#005bff]">
            Privacy
          </a>
          <a href="/refund-policy" className="transition hover:text-[#005bff]">
            Refunds
          </a>
        </nav>
      </div>
    </header>
  )
}

export function SimpleSiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white px-6 py-10 text-sm text-[#60656b] sm:px-10">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <PigmaLogo className="h-[18px] w-auto" />
          <p>PSD to Figma-ready conversion and design workflow tools.</p>
          <p className="max-w-[520px] text-xs leading-5 text-[#8a9096]">
            PIGER is an independent product and is not affiliated with, endorsed by, or sponsored by Figma,
            Adobe, or any related companies.
          </p>
          <p className="text-xs leading-5 text-[#8a9096]">
            Support:{" "}
            <a href="mailto:min.ai.labs@gmail.com" className="font-bold text-[#60656b] transition hover:text-[#005bff]">
              min.ai.labs@gmail.com
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-bold">
          <a href="/psd-export" className="transition hover:text-[#005bff]">
            PSD Export
          </a>
          <a href="/psd-converter" className="transition hover:text-[#005bff]">
            PSD 변환
          </a>
          <a href="/pricing" className="transition hover:text-[#005bff]">
            Pricing
          </a>
          <a href="/terms" className="transition hover:text-[#005bff]">
            Terms
          </a>
          <a href="/privacy" className="transition hover:text-[#005bff]">
            Privacy
          </a>
          <a href="/refund-policy" className="transition hover:text-[#005bff]">
            Refund policy
          </a>
          <a href="mailto:min.ai.labs@gmail.com" className="transition hover:text-[#005bff]">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}

export function PolicyPage({ title, description, lastUpdated = "May 26, 2026", sections }: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      <SimpleSiteHeader />
      <section className="bg-[#f7f9fc] px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">PIGER</p>
          <h1 className="mt-4 text-[38px] font-black leading-tight text-[#050505] sm:text-[56px]">{title}</h1>
          <p className="mt-5 max-w-[720px] text-[17px] leading-8 text-[#60656b]">{description}</p>
          <p className="mt-6 text-sm font-bold text-[#60656b]">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <article className="px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto grid max-w-[900px] gap-10">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-[#e7ecf3] pb-10 last:border-b-0 last:pb-0">
              <h2 className="text-[24px] font-black leading-8 text-[#050505]">{section.title}</h2>
              <div className="mt-4 grid gap-4 text-[15px] leading-7 text-[#424850]">{section.children}</div>
            </section>
          ))}
        </div>
      </article>
      <SimpleSiteFooter />
    </main>
  )
}
