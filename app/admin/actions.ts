"use server"

import { redirect } from "next/navigation"

import { getCurrentUser, setManualUserPlanByEmail } from "@/lib/auth"
import { isAdminUser } from "@/lib/admin"

const allowedPlans = new Set(["free", "basic", "pro"])

function redirectWithState(state: Record<string, string>): never {
  const params = new URLSearchParams(state)
  redirect(`/admin?${params.toString()}`)
}

export async function updateManualPlanAction(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!isAdminUser(currentUser)) {
    redirect("/dashboard")
  }

  const email = String(formData.get("email") || "").trim().toLowerCase()
  const plan = String(formData.get("plan") || "").trim().toLowerCase()

  if (!email) {
    redirectWithState({ error: "email", email, plan })
  }

  if (!allowedPlans.has(plan)) {
    redirectWithState({ error: "plan", email, plan: "pro" })
  }

  const updatedUser = setManualUserPlanByEmail({ email, plan: plan as "free" | "basic" | "pro" })
  if (!updatedUser) {
    redirectWithState({ error: "not-found", email, plan })
  }

  redirectWithState({ ok: "updated", email: updatedUser.email, plan: updatedUser.plan })
}
