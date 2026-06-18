import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import type React from "react"

import {
  ABSOLUTE_LANGUAGE_ALTERNATES,
  HTML_LANG,
  absoluteUrl,
  buildPigmaMetadata,
  buildPigmaStructuredData,
  isLocaleCode,
  stringifyJsonLd,
  type LocaleCode,
} from "@/lib/seo"

import "./globals.css"

export const metadata: Metadata = buildPigmaMetadata("ko", { includeAlternates: false })

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers()
  const locale = getLayoutLocale(requestHeaders.get("x-pigma-locale"))
  const isKoreanHome = locale === "ko" && requestHeaders.get("x-pigma-route-path") === "/"

  return (
    <html lang={HTML_LANG[locale]}>
      <head>
        <link rel="preload" href="/fonts/MonaSansExpanded.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" />
        {isKoreanHome ? (
          <>
            <link rel="canonical" href={absoluteUrl("/")} />
            {Object.entries(ABSOLUTE_LANGUAGE_ALTERNATES).map(([hrefLang, href]) => (
              <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
            ))}
          </>
        ) : null}
        <script
          id="pigma-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: stringifyJsonLd(buildPigmaStructuredData(locale)) }}
        />
      </head>
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18249310477" strategy="afterInteractive" />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18249310477');
          `}
        </Script>
        {children}
      </body>
    </html>
  )
}

function getLayoutLocale(value: string | null): LocaleCode {
  return isLocaleCode(value) ? value : "ko"
}
