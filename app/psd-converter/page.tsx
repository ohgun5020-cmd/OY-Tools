import type { Metadata } from "next"

import { SeoLandingPage } from "@/app/_components/SeoLandingPage"
import { FIGMA_PLUGIN_URL } from "@/lib/links"
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo"

const path = "/psd-converter"
const pageUrl = absoluteUrl(path)
const title = "PSD Converter for Figma | PSD 변환·Figma PSD Export | PIGER"
const description =
  "PIGER는 PSD to Figma 변환과 Figma to PSD export 흐름을 돕는 Figma 플러그인입니다. PSD, AI, EPS, PDF, PPT, SVG 파일을 레이어, 텍스트, 이미지, 효과까지 다시 편집하기 쉬운 구조로 정리합니다."

const keywords = [
  "PSD Converter Figma",
  "PSD converter",
  "PSD 변환",
  "psd 변환",
  "PSD to Figma",
  "PSD 피그마 변환",
  "Photoshop to Figma",
  "Figma PSD export",
  "Figma to PSD",
  "피그마 PSD",
  "Figma plugin PSD",
  "PSD import Figma",
  "PSD export plugin",
]

const faq = [
  {
    question: "PSD를 Figma로 변환하면 레이어와 텍스트를 다시 편집할 수 있나요?",
    answer:
      "PIGER는 PSD를 Figma에서 다시 다루기 쉬운 구조로 정리하는 데 집중합니다. 원본 PSD 상태에 따라 결과는 달라질 수 있지만, 레이어 구조, 텍스트, 이미지, 효과를 확인해 편집 가능한 작업 흐름을 만드는 것이 목표입니다.",
  },
  {
    question: "Figma 디자인을 PSD로 export하는 용도로도 쓸 수 있나요?",
    answer:
      "네. Figma에서 정리한 작업물을 Photoshop 쪽으로 넘기기 전에 레이어, 텍스트, 이미지, 효과를 점검하고 PSD-ready 형태로 준비하는 흐름에 사용할 수 있습니다.",
  },
  {
    question: "Photopea 같은 웹 변환기와 무엇이 다른가요?",
    answer:
      "웹 변환기는 파일을 빠르게 열어보는 데 유용하지만, PIGER는 Figma 안에서 바로 레이어 정리, 텍스트 확인, 이미지 보정, 검수 작업까지 이어가는 플러그인형 워크플로우에 초점을 둡니다.",
  },
  {
    question: "PSD 말고 다른 디자인 파일도 가져올 수 있나요?",
    answer:
      "PIGER는 PSD뿐 아니라 AI, EPS, PDF, PPT, SVG 파일을 Figma에서 다시 만지기 쉬운 구조로 가져오고 정리하는 워크플로우를 제공합니다.",
  },
  {
    question: "PSD import와 PSD export 중 어느 쪽 검색어에 맞는 페이지인가요?",
    answer:
      "이 페이지는 PSD to Figma, Photoshop to Figma, Figma to PSD, Figma PSD export처럼 양방향 변환을 찾는 사용자를 위해 구성했습니다. 핵심은 파일 확장자 변환보다 변환 후 편집 가능한 구조를 만드는 것입니다.",
  },
  {
    question: "변환 전에 어떤 점을 확인하면 좋나요?",
    answer:
      "잠긴 레이어, 병합된 텍스트, 누락된 폰트, 너무 큰 이미지, 숨김 레이어, 그림자와 블러 효과를 먼저 확인하면 변환 후 수정 시간이 줄어듭니다.",
  },
]

const howToSteps = [
  {
    title: "Figma에서 PIGER 플러그인 열기",
    body: "Figma Community에서 PIGER를 실행하고 변환할 PSD 또는 디자인 파일을 준비합니다.",
  },
  {
    title: "PSD 또는 디자인 파일 가져오기",
    body: "PSD, AI, EPS, PDF, PPT, SVG 같은 소스 파일을 Figma 작업 흐름으로 가져옵니다.",
  },
  {
    title: "레이어와 텍스트 구조 확인",
    body: "잠긴 레이어, 병합된 텍스트, 이미지 크롭, 효과를 확인하고 수정하기 쉬운 구조로 정리합니다.",
  },
  {
    title: "Figma에서 수정하거나 PSD-ready로 전달",
    body: "Figma에서 바로 편집하거나 Photoshop 전달을 위해 PSD export 전에 구조를 점검합니다.",
  },
]

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  keywords,
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
        alt: "PIGER PSD Converter for Figma",
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
          name: "PIGER",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "PSD Converter for Figma",
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
      keywords: keywords.join(", "),
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#software`,
      },
    },
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      alternateName: ["PIGER PSD Converter", "PSD Converter for Figma"],
      url: SITE_URL,
      applicationCategory: "DesignApplication",
      applicationSubCategory: "Figma plugin for PSD import, PSD export, and design cleanup",
      operatingSystem: "Web, Figma",
      softwareRequirements: "Figma",
      description,
      featureList: [
        "PSD to Figma conversion workflow",
        "Figma to PSD export preparation",
        "Photoshop PSD layer cleanup",
        "Editable text and layer structure checks",
        "AI, EPS, PDF, PPT, and SVG import cleanup",
        "Image, effect, and handoff review tools",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        url: FIGMA_PLUGIN_URL,
      },
    },
    {
      "@type": "HowTo",
      name: "PSD를 Figma에서 편집 가능한 구조로 변환하는 방법",
      description:
        "PIGER Figma 플러그인으로 PSD 파일을 가져오고 레이어, 텍스트, 이미지, 효과를 정리하는 기본 흐름입니다.",
      totalTime: "PT5M",
      step: howToSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.body,
      })),
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
      eyebrow="PSD Converter for Figma"
      title={
        <>
          PSD 변환부터 Figma 편집,
          <br />
          PSD export 준비까지 한 흐름으로
        </>
      }
      description={description}
      primaryCta={{
        label: "Figma에서 PIGER 열기",
        href: FIGMA_PLUGIN_URL,
        external: true,
      }}
      secondaryCta={{
        label: "가격 보기",
        href: "/pricing",
      }}
      proofLabel="Workflow coverage"
      proofPoints={[
        "PSD to Figma import와 Figma to PSD export 검색 의도를 함께 다룹니다.",
        "Figma 플러그인 안에서 변환, 정리, 검수, 전달 준비를 이어갈 수 있습니다.",
        "PSD뿐 아니라 AI, EPS, PDF, PPT, SVG 파일 정리 흐름까지 연결합니다.",
      ]}
      featureTitle="상위 검색 결과가 다루는 핵심 기능을 PIGER 흐름으로 정리"
      features={[
        {
          title: "PSD to Figma",
          body: "Photoshop PSD 파일을 Figma에서 다시 열고 수정하기 쉬운 구조로 가져오는 흐름을 제공합니다.",
        },
        {
          title: "Figma to PSD",
          body: "Figma 작업물을 Photoshop 협업으로 넘기기 전에 레이어, 텍스트, 이미지, 효과를 점검합니다.",
        },
        {
          title: "레이어 구조 정리",
          body: "복잡한 그룹, 잠긴 레이어, 숨김 요소, 이름 구조를 확인해 받은 파일도 다시 손대기 좋게 만듭니다.",
        },
        {
          title: "편집 가능한 텍스트 확인",
          body: "이미지처럼 굳어진 글자, 누락된 폰트, 수정하기 어려운 문구를 찾아 편집 가능한 흐름으로 정리합니다.",
        },
        {
          title: "이미지와 효과 점검",
          body: "크롭, 원본 이미지, 그림자, 블러, 투명도 같은 요소를 확인해 납품 후 재수정 시간을 줄입니다.",
        },
        {
          title: "대체 파일까지 지원",
          body: "PSD 외에도 AI, EPS, PDF, PPT, SVG를 Figma 작업 흐름으로 가져와 정리할 수 있게 설계했습니다.",
        },
      ]}
      stepsTitle="PSD Converter를 찾는 사용자가 실제로 필요한 단계"
      steps={howToSteps}
      comparisonTitle="웹 변환기보다 중요한 건 변환 후 편집 가능성"
      comparisonIntro="검색 상위에는 단순 변환기, Figma Community 플러그인, YouTube 튜토리얼이 함께 나옵니다. PIGER 페이지는 그중 실무자가 실제로 비교하는 기준을 한 화면에서 설명하도록 보강했습니다."
      comparisonItems={[
        "빠른 미리보기만 필요하면 웹 변환기가 편할 수 있지만, Figma 안에서 계속 수정해야 한다면 플러그인 흐름이 더 자연스럽습니다.",
        "PSD import만 설명하면 부족합니다. 실무에서는 가져온 뒤 텍스트를 고치고, 이미지를 교체하고, 다시 전달하는 단계가 이어집니다.",
        "Figma to PSD export 검색자는 Photoshop 전달 품질을 걱정합니다. 그래서 export 전 레이어와 효과 점검 내용을 본문에 명확히 넣었습니다.",
        "검색 결과 제목에 English query가 많이 섞여 있어 title, keyword, 본문에 PSD Converter, PSD to Figma, Figma to PSD 표현을 함께 배치했습니다.",
      ]}
      faq={faq}
      jsonLd={jsonLd}
      finalCtaTitle="PSD 파일 하나로 변환 품질과 편집 흐름을 바로 확인하세요."
    />
  )
}
