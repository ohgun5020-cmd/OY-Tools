import type { Metadata } from "next"

import { SeoLandingPage } from "@/app/_components/SeoLandingPage"
import { FIGMA_PLUGIN_URL } from "@/lib/links"
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo"

const path = "/psd-export"
const pageUrl = absoluteUrl(path)
const title = "PSD Export for Figma | PIGMA"
const description =
  "Export Figma work into PSD-ready files with PIGMA. Clean layers, editable text, images, and effects before sending design work into a Photoshop workflow."

const faq = [
  {
    question: "Can I export Figma designs to PSD with PIGMA?",
    answer:
      "PIGMA focuses on preparing Figma work for PSD-ready export by organizing layers, text, images, and effects so the handoff is easier to edit in a Photoshop workflow.",
  },
  {
    question: "What should I check before a PSD export?",
    answer:
      "Check layer names, locked layers, rasterized text, image crops, hidden layers, and effects. These are the details that often make PSD handoff slow or hard to edit.",
  },
  {
    question: "Is this only for PSD files?",
    answer:
      "No. PIGMA also supports workflows around AI, EPS, PDF, PPT, and SVG imports, then helps turn the result into editable Figma structure before export or review.",
  },
]

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  keywords: [
    "psd export",
    "PSD export",
    "Figma PSD export",
    "Figma to PSD",
    "export Figma to PSD",
    "PSD-ready export",
    "Photoshop export from Figma",
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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PIGMA PSD export workflow for Figma",
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
          name: "PSD Export",
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
      inLanguage: "en",
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
        "Figma to PSD-ready export workflow",
        "PSD layer cleanup",
        "Editable text preparation",
        "Image and effect handoff checks",
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

export default function PsdExportPage() {
  return (
    <SeoLandingPage
      eyebrow="PSD export"
      title={
        <>
          PSD export for Figma teams that still need Photoshop handoff
        </>
      }
      description={description}
      proofPoints={[
        "Targets the exact search intent behind 'psd export' and 'Figma to PSD'.",
        "Explains the real workflow: layer cleanup, editable text, image checks, and export handoff.",
        "Links directly to the PIGMA Figma plugin so visitors can try the workflow.",
      ]}
      featureTitle="What PIGMA prepares before PSD export"
      features={[
        {
          title: "Layer structure",
          body: "Clean groups, unlock stuck layers, and make the file easier to inspect before it leaves Figma.",
        },
        {
          title: "Editable text",
          body: "Find text that may be rasterized or hard to reuse, then prepare it for a cleaner PSD-ready handoff.",
        },
        {
          title: "Images and effects",
          body: "Check image crops, extracted assets, shadows, and effects so the PSD export does not become a flat mystery file.",
        },
      ]}
      stepsTitle="A cleaner Figma to PSD workflow"
      steps={[
        {
          title: "Open the design in Figma",
          body: "Start from the file your team already uses, whether it began as Figma work or an imported PSD/PDF asset.",
        },
        {
          title: "Run cleanup checks",
          body: "Use PIGMA to prepare layers, text, images, and common handoff details before export.",
        },
        {
          title: "Send a PSD-ready file",
          body: "Move the work into a Photoshop-friendly workflow with less manual repair after export.",
        },
      ]}
      comparisonTitle="PSD export is not just a file button"
      comparisonIntro="Most failed PSD handoffs are caused by messy structure, not the extension itself. A useful export page should explain how those details are handled."
      comparisonItems={[
        "Searchers for 'psd export' usually need a practical path from Figma work to Photoshop editing.",
        "A page that explains the workflow can rank better than a page that only repeats keywords.",
        "Internal links, sitemap inclusion, and structured data help Google understand this page as a focused export workflow.",
      ]}
      faq={faq}
      jsonLd={jsonLd}
    />
  )
}
