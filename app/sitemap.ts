import type { MetadataRoute } from "next"

import { ABSOLUTE_LANGUAGE_ALTERNATES, SITE_URL, absoluteUrl } from "@/lib/seo"

const lastModified = new Date("2026-06-17T00:00:00.000Z")

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: ABSOLUTE_LANGUAGE_ALTERNATES,
      },
    },
    {
      url: absoluteUrl("/en"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: ABSOLUTE_LANGUAGE_ALTERNATES,
      },
    },
    {
      url: absoluteUrl("/ja"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: ABSOLUTE_LANGUAGE_ALTERNATES,
      },
    },
    {
      url: absoluteUrl("/es"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: ABSOLUTE_LANGUAGE_ALTERNATES,
      },
    },
    {
      url: absoluteUrl("/pt-br"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: ABSOLUTE_LANGUAGE_ALTERNATES,
      },
    },
    {
      url: absoluteUrl("/pricing"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/refund-policy"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
