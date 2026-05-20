import type { Metadata } from "next"
import type React from "react"
import { Inter } from "next/font/google"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "OY Tools | OY Panel",
  description: "OY Tools 개인용 SMM 주문 운영 대시보드.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
