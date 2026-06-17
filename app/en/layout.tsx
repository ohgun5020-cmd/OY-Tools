import type { Metadata } from "next"
import type React from "react"

import { buildPigmaMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPigmaMetadata("en")

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
