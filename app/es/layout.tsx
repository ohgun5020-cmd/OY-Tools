import type { Metadata } from "next"
import type React from "react"

import { buildPigmaMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPigmaMetadata("es")

export default function SpanishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
