import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"

import { PluginConnectClient } from "./PluginConnectClient"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PluginConnectPageProps = {
  searchParams: Promise<{
    requestId?: string
    secret?: string
  }>
}

function isConnectionPart(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,160}$/.test(value)
}

export default async function PluginConnectPage({ searchParams }: PluginConnectPageProps) {
  const params = await searchParams
  const requestId = isConnectionPart(params.requestId) ? params.requestId : ""
  const secret = isConnectionPart(params.secret) ? params.secret : ""
  const next = `/plugin/connect${requestId && secret ? `?requestId=${encodeURIComponent(requestId)}&secret=${encodeURIComponent(secret)}` : ""}`
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  return <PluginConnectClient requestId={requestId} secret={secret} userEmail={user.email} userPlan={user.plan} />
}
