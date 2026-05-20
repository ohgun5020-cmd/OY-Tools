import type React from "react"

import { Header } from "@/components/app/header"
import { Sidebar } from "@/components/app/sidebar"
import { SidebarProvider } from "@/components/app/sidebar-provider"
import { requireSession } from "@/lib/auth/session"
import { getSmmConnectionState } from "@/lib/smm/client"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  const connection = getSmmConnectionState()

  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="lg:pl-72">
          <Header adminEmail={session.email} mode={connection.mode} />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
