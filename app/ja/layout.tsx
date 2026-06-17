import type { Metadata } from "next"
import type React from "react"

import { buildPigmaMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPigmaMetadata("ja")

export default function JapaneseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
