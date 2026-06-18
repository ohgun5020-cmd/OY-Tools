import type { AuthUser } from "./auth"
import { FREE_ACCOUNT_BETA_PERIOD_ACTIVE } from "./beta-flags"

export type PlanEntitlement = {
  planTier: 0 | 1 | 2 | 3
  effectiveTier: 0 | 1 | 2 | 3
  nonAiEffectiveTier: 0 | 1 | 2 | 3
  aiEffectiveTier: 0 | 1 | 2 | 3
  serverAiEnabled: boolean
  serverAiRequiredTier: 2
  nonAiBetaActive: boolean
  freeBetaActive: boolean
  nonAiBetaStartsAt: string | null
  nonAiBetaEndsAt: string | null
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
  const freeBetaActive = FREE_ACCOUNT_BETA_PERIOD_ACTIVE && planTier === 0
  const nonAiEffectiveTier = freeBetaActive ? 2 : planTier
  const aiEffectiveTier = planTier

  return {
    planTier,
    effectiveTier: nonAiEffectiveTier,
    nonAiEffectiveTier,
    aiEffectiveTier,
    serverAiEnabled: planTier >= 2,
    serverAiRequiredTier: 2,
    nonAiBetaActive: freeBetaActive,
    freeBetaActive,
    nonAiBetaStartsAt: null,
    nonAiBetaEndsAt: null,
    basicTrialActive: false,
    basicTrialDays: 0,
    basicTrialEndsAt: null,
    basicTrialRemainingMs: 0,
  }
}
