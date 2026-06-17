import type { Metadata } from "next"
import type React from "react"

import { buildPigmaMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPigmaMetadata("pt-br")

export default function PortugueseBrazilLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
