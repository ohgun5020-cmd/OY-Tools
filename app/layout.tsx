import type { Metadata } from "next"
import type React from "react"

import "./globals.css"

export const metadata: Metadata = {
  title: "PIGMA | PSD to Figma-ready plugin",
  description: "PSD, PDF, PPTX 원본을 Figma에서 수정 가능한 구조로 정리하는 PIGMA 플러그인 랜딩 페이지입니다.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
