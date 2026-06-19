import type { Metadata } from "next"

export type LocaleCode = "ko" | "en" | "ja" | "es" | "pt-br"

export const SITE_URL = "https://oy-tools-production.up.railway.app"
export const SITE_NAME = "PIGMA"

export const LOCALE_PATHS: Record<LocaleCode, string> = {
  ko: "/",
  en: "/en",
  ja: "/ja",
  es: "/es",
  "pt-br": "/pt-br",
}

export const HTML_LANG: Record<LocaleCode, string> = {
  ko: "ko",
  en: "en",
  ja: "ja",
  es: "es",
  "pt-br": "pt-BR",
}

const OPEN_GRAPH_LOCALES: Record<LocaleCode, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  es: "es_ES",
  "pt-br": "pt_BR",
}

export const LANGUAGE_ALTERNATES = {
  "ko-KR": "/",
  en: "/en",
  "ja-JP": "/ja",
  es: "/es",
  "pt-BR": "/pt-br",
  "x-default": "/en",
} as const

export const ABSOLUTE_LANGUAGE_ALTERNATES = {
  "ko-KR": absoluteUrl("/"),
  en: absoluteUrl("/en"),
  "ja-JP": absoluteUrl("/ja"),
  es: absoluteUrl("/es"),
  "pt-BR": absoluteUrl("/pt-br"),
  "x-default": absoluteUrl("/en"),
} as const

export const SEO_KEYWORDS = [
  "PIGMA",
  "PSD to Figma",
  "Figma to PSD",
  "PSD converter",
  "Figma plugin",
  "Figma PSD export",
  "PSD import",
  "AI design review",
  "AI typo check",
  "design cleanup",
  "editable Figma layers",
  "PSD 변환",
  "Figma 플러그인",
  "피그마 PSD",
  "PSD 피그마 변환",
  "오타 검수 AI",
  "디자인 자동화",
]

export const LOCALE_SEO: Record<
  LocaleCode,
  {
    title: string
    description: string
    path: string
  }
> = {
  ko: {
    title: "PIGMA | PSD·AI·PDF를 Figma 편집 파일로, Figma를 PSD로",
    description:
      "PIGMA는 PSD, AI, EPS, PDF, PPT, SVG를 Figma에서 편집 가능한 레이어로 정리하고 Figma 작업을 PSD-ready 출력으로 변환하는 플러그인입니다.",
    path: "/",
  },
  en: {
    title: "PIGMA | PSD to Figma and Figma to PSD plugin",
    description:
      "Convert PSD, AI, EPS, PDF, PPT, and SVG into editable Figma layers, export Figma work to PSD-ready files, and clean designs with AI checks.",
    path: "/en",
  },
  ja: {
    title: "PIGMA | PSDをFigma編集データへ、FigmaをPSDへ",
    description:
      "PSD、AI、EPS、PDF、PPT、SVGをFigmaで編集しやすいレイヤーに整理し、Figma作業をPSD-readyに書き出すデザインワークフロープラグインです。",
    path: "/ja",
  },
  es: {
    title: "PIGMA | PSD a Figma y Figma a PSD",
    description:
      "Convierte PSD, AI, EPS, PDF, PPT y SVG en capas editables de Figma, exporta trabajo de Figma a PSD y limpia diseños con checks IA.",
    path: "/es",
  },
  "pt-br": {
    title: "PIGMA | PSD para Figma e Figma para PSD",
    description:
      "Converta PSD, AI, EPS, PDF, PPT e SVG em camadas editáveis no Figma, exporte Figma para PSD e limpe designs com checks de IA.",
    path: "/pt-br",
  },
}

const FEATURE_LIST = [
  "PSD, AI, EPS, PDF, PPT, and SVG import",
  "Editable Figma layer cleanup",
  "Figma to PSD-ready export workflow",
  "AI typo check and inline copy fixes",
  "Design consistency review",
  "Image text extraction",
  "Image upscale and extension",
  "Layer unlock, detach, split, and pixel cleanup tools",
  "Prototype links, short links, and QR sharing tools",
]

type MetadataOptions = {
  includeAlternates?: boolean
}

export function buildPigmaMetadata(locale: LocaleCode, options: MetadataOptions = {}): Metadata {
  const { includeAlternates = true } = options
  const seo = LOCALE_SEO[locale]
  const image = "/opengraph-image"
  const alternateLocale = Object.entries(OPEN_GRAPH_LOCALES)
    .filter(([key]) => key !== locale)
    .map(([, value]) => value)

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: seo.title,
    description: seo.description,
    keywords: SEO_KEYWORDS,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Design tools",
    classification: "Figma plugin, PSD conversion, AI design workflow",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    ...(includeAlternates
      ? {
          alternates: {
            canonical: seo.path,
            languages: LANGUAGE_ALTERNATES,
          },
        }
      : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      url: seo.path,
      locale: OPEN_GRAPH_LOCALES[locale],
      alternateLocale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "PIGMA PSD to Figma and Figma to PSD plugin",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
    icons: {
      icon: [{ url: "/icon.png", type: "image/png", sizes: "128x128" }],
      apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "128x128" }],
    },
    other: {
      "product:category": "Figma plugin",
      "product:keywords": SEO_KEYWORDS.join(", "),
      "ai:summary":
        "PIGMA is a Figma plugin and web workflow for PSD to Figma conversion, Figma to PSD export, editable layer cleanup, AI typo checks, and design automation.",
      "ai:features": FEATURE_LIST.join("; "),
    },
  }
}

export function buildPigmaStructuredData(locale: LocaleCode) {
  const seo = LOCALE_SEO[locale]
  const pageUrl = absoluteUrl(seo.path)
  const pricingUrl = absoluteUrl("/pricing")

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/assets/piger-wordmark.svg"),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: Object.values(HTML_LANG),
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: seo.title,
        description: seo.description,
        inLanguage: HTML_LANG[locale],
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#software`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
        },
      },
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        url: SITE_URL,
        image: absoluteUrl("/opengraph-image"),
        description: seo.description,
        applicationCategory: "DesignApplication",
        applicationSubCategory: "Figma plugin for PSD conversion and AI design cleanup",
        operatingSystem: "Web, Figma",
        softwareRequirements: "Figma",
        inLanguage: Object.values(HTML_LANG),
        keywords: SEO_KEYWORDS.join(", "),
        featureList: FEATURE_LIST,
        offers: {
          "@type": "AggregateOffer",
          url: pricingUrl,
          priceCurrency: "USD",
          lowPrice: "0",
          highPrice: "5",
          offerCount: "3",
          offers: [
            {
              "@type": "Offer",
              name: "Free",
              price: "0",
              priceCurrency: "USD",
              url: pricingUrl,
            },
            {
              "@type": "Offer",
              name: "Basic",
              price: "2",
              priceCurrency: "USD",
              url: pricingUrl,
            },
            {
              "@type": "Offer",
              name: "Pro",
              price: "5",
              priceCurrency: "USD",
              url: pricingUrl,
            },
          ],
        },
      },
    ],
  }
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function isLocaleCode(value: string | null | undefined): value is LocaleCode {
  return value === "ko" || value === "en" || value === "ja" || value === "es" || value === "pt-br"
}

export function stringifyJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}
