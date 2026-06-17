import type { AuthUser } from "./auth"

export type PlanEntitlement = {
  planTier: 0 | 1 | 2 | 3
  effectiveTier: 0 | 1 | 2 | 3
  serverAiEnabled: boolean
  serverAiRequiredTier: 2
  basicTrialActive: boolean
  basicTrialDays: number
  basicTrialEndsAt: string | null
  basicTrialRemainingMs: number
}

export function getPlanTier(plan: string | null | undefined): 0 | 1 | 2 | 3 {
  const value = String(plan || "free").toLowerCase().replace(/[-\s]+/g, "_")
  if (value === "admin") {
    return 3
  }
  if (value === "pro" || value === "pro_yearly" || value === "pro_annual" || value === "pro_year") {
    return 2
  }
  if (value === "basic" || value === "basic_yearly" || value === "basic_annual" || value === "basic_year") {
    return 1
  }
  return 0
}

export function getPlanEntitlement(user: Pick<AuthUser, "plan" | "createdAt"> | null | undefined): PlanEntitlement {
  const planTier = getPlanTier(user?.plan)

  return {
    planTier,
    effectiveTier: planTier,
    serverAiEnabled: planTier >= 2,
    serverAiRequiredTier: 2,
    basicTrialActive: false,
    basicTrialDays: 0,
    basicTrialEndsAt: null,
    basicTrialRemainingMs: 0,
  }
}
