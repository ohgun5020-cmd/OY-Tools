import type { Metadata } from "next"

import { SeoLandingPage } from "@/app/_components/SeoLandingPage"
import { FIGMA_PLUGIN_URL } from "@/lib/links"
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo"

const path = "/psd-converter"
const pageUrl = absoluteUrl(path)
const title = "PSD 변환 | PSD를 Figma 편집 레이어로 바꾸는 PIGMA"
const description =
  "PIGMA는 PSD 변환, PSD 피그마 변환, Figma PSD export 작업을 위해 레이어, 텍스트, 이미지, 효과를 편집하기 쉬운 구조로 정리하는 Figma 플러그인입니다."

const faq = [
  {
    question: "PSD 변환을 하면 텍스트와 레이어를 다시 편집할 수 있나요?",
    answer:
      "PIGMA는 PSD를 Figma에서 다루기 쉬운 구조로 정리하는 데 집중합니다. 파일 상태에 따라 결과는 달라질 수 있지만, 레이어 정리, 텍스트 확인, 이미지와 효과 점검을 통해 편집 가능한 흐름을 만드는 것이 목표입니다.",
  },
  {
    question: "PSD를 Figma로 변환한 뒤 다시 PSD export도 가능한가요?",
    answer:
      "Figma에서 정리한 작업물을 PSD-ready 형태로 넘길 수 있도록 레이어, 텍스트, 이미지, 효과를 점검하는 흐름을 제공합니다. Photoshop 전달 전 수작업 정리를 줄이는 데 유용합니다.",
  },
  {
    question: "PSD 말고 다른 파일도 변환할 수 있나요?",
    answer:
      "PIGMA는 PSD뿐 아니라 AI, EPS, PDF, PPT, SVG 파일을 Figma에서 다시 만지기 쉬운 구조로 가져오고 정리하는 워크플로우를 제공합니다.",
  },
]

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  keywords: [
    "PSD 변환",
    "psd 변환",
    "PSD 피그마 변환",
    "피그마 PSD",
    "Figma PSD export",
    "PSD export",
    "PSD to Figma",
    "Figma to PSD",
  ],
  alternates: {
    canonical: path,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title,
    description,
    url: path,
    locale: "ko_KR",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PIGMA PSD 변환과 Figma PSD export",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "PIGMA",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "PSD 변환",
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: "ko-KR",
      about: {
        "@id": `${SITE_URL}/#software`,
      },
    },
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web, Figma",
      description,
      featureList: [
        "PSD 변환",
        "PSD 피그마 변환",
        "Figma PSD export 준비",
        "레이어와 텍스트 정리",
        "이미지와 효과 점검",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        url: FIGMA_PLUGIN_URL,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
}

export default function PsdConverterPage() {
  return (
    <SeoLandingPage
      eyebrow="PSD 변환"
      title={
        <>
          PSD 변환을 Figma 편집 흐름까지 깔끔하게
        </>
      }
      description={description}
      primaryCta={{
        label: "Figma에서 PIGMA 열기",
        href: FIGMA_PLUGIN_URL,
        external: true,
      }}
      secondaryCta={{
        label: "가격 보기",
        href: "/pricing",
      }}
      proofPoints={[
        "구글 검색어 'PSD 변환', 'PSD 피그마 변환', 'psd export' 의도에 맞춘 전용 페이지입니다.",
        "단순 파일 변환이 아니라 레이어, 텍스트, 이미지, 효과 정리까지 설명합니다.",
        "sitemap과 내부 링크에 포함되어 Google이 중요한 페이지로 발견하기 쉬워집니다.",
      ]}
      featureTitle="PSD 변환에서 중요한 것"
      features={[
        {
          title: "레이어 정리",
          body: "복잡한 PSD를 Figma에서 다시 만질 수 있도록 그룹, 잠금, 숨김 레이어, 이름 구조를 정리합니다.",
        },
        {
          title: "텍스트 확인",
          body: "이미지처럼 굳어진 텍스트나 수정하기 어려운 문구를 확인해 편집 가능한 흐름으로 준비합니다.",
        },
        {
          title: "PSD export 준비",
          body: "Figma 작업물을 Photoshop 쪽으로 넘기기 전에 이미지, 효과, 레이어 구조를 점검합니다.",
        },
      ]}
      stepsTitle="PSD를 다시 쓰기 좋은 파일로 만드는 흐름"
      steps={[
        {
          title: "PSD 또는 디자인 파일 가져오기",
          body: "PSD, AI, EPS, PDF, PPT, SVG 같은 파일을 Figma 작업 흐름으로 가져옵니다.",
        },
        {
          title: "PIGMA로 구조 정리",
          body: "레이어, 텍스트, 이미지, 효과를 확인하고 불필요한 정리 시간을 줄입니다.",
        },
        {
          title: "수정 또는 PSD export",
          body: "Figma에서 수정하거나, PSD-ready 상태로 넘길 수 있게 파일을 준비합니다.",
        },
      ]}
      comparisonTitle="상위 노출은 키워드 반복보다 검색 의도"
      comparisonIntro="Google은 사용자가 찾는 문제를 실제로 해결하는 페이지를 이해하려고 합니다. 그래서 이 페이지는 'PSD 변환'이라는 단어만 반복하지 않고, 변환 후 사용자가 무엇을 할 수 있는지까지 설명합니다."
      comparisonItems={[
        "PSD 변환 검색자는 보통 파일을 열고, 수정하고, 다시 전달하는 방법을 찾습니다.",
        "PIGMA의 장점은 변환 후 레이어와 텍스트를 작업 가능한 구조로 정리하는 데 있습니다.",
        "홈페이지보다 전용 URL이 있으면 제목, 설명, 본문, FAQ를 한 검색 의도에 집중시킬 수 있습니다.",
      ]}
      faq={faq}
      jsonLd={jsonLd}
    />
  )
}
