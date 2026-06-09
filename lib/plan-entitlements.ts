import type { AuthUser } from "./auth"

export const DEFAULT_BASIC_TRIAL_DAYS = 7

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

export function getBasicTrialDays() {
  const value = Number(process.env.PIGMA_BASIC_TRIAL_DAYS || DEFAULT_BASIC_TRIAL_DAYS)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_BASIC_TRIAL_DAYS
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
  const basicTrialDays = getBasicTrialDays()
  let basicTrialEndsAt: string | null = null
  let basicTrialActive = false
  let basicTrialRemainingMs = 0

  if (user && planTier === 0) {
    const createdAt = new Date(user.createdAt)
    if (!Number.isNaN(createdAt.getTime())) {
      const endsAt = new Date(createdAt.getTime() + basicTrialDays * 24 * 60 * 60 * 1000)
      basicTrialRemainingMs = Math.max(0, endsAt.getTime() - Date.now())
      basicTrialEndsAt = endsAt.toISOString()
      basicTrialActive = basicTrialRemainingMs > 0
    }
  }
  const effectiveTier = basicTrialActive && planTier === 0 ? 1 : planTier

  return {
    planTier,
    effectiveTier,
    serverAiEnabled: effectiveTier >= 2,
    serverAiRequiredTier: 2,
    basicTrialActive,
    basicTrialDays,
    basicTrialEndsAt,
    basicTrialRemainingMs,
  }
}
