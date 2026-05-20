"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    })
    router.replace("/login")
    router.refresh()
  }

  return (
    <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      로그아웃
    </Button>
  )
}
