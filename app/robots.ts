import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/en",
          "/ja",
          "/es",
          "/pt-br",
          "/pricing",
          "/psd-export",
          "/psd-converter",
          "/terms",
          "/privacy",
          "/refund-policy",
        ],
        disallow: ["/admin", "/api", "/dashboard", "/login", "/signup"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
