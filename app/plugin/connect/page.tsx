import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"

import { PluginConnectClient } from "./PluginConnectClient"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function PluginConnectPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return <PluginConnectClient userEmail={user.email} userPlan={user.plan} />
}
