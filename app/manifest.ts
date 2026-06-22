import type { MetadataRoute } from "next"

import { SITE_NAME, SITE_URL } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: SITE_URL,
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "PIGER is a Figma plugin and web workflow for PSD to Figma conversion, Figma to PSD export, editable layer cleanup, and AI design checks.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#005bff",
    categories: ["design", "productivity", "utilities"],
    icons: [
      {
        src: "/icon.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
