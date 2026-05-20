import { redirect } from "next/navigation"

import { LoginForm } from "@/components/auth/login-form"
import { getAdminRuntimeConfig, getSession } from "@/lib/auth/session"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  const config = getAdminRuntimeConfig()

  return <LoginForm defaultEmail={config.email} devFallbackEnabled={config.devFallbackEnabled} />
}
