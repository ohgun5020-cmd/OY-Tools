import type { AuthUser } from "./auth"

export const DEFAULT_BASIC_TRIAL_DAYS = 7

export type PlanEntitlement = {
  planTier: 0 | 1 | 2
  effectiveTier: 0 | 1 | 2
  basicTrialActive: boolean
  basicTrialDays: number
  basicTrialEndsAt: string | null
}

export function getBasicTrialDays() {
  const value = Number(process.env.PIGMA_BASIC_TRIAL_DAYS || DEFAULT_BASIC_TRIAL_DAYS)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_BASIC_TRIAL_DAYS
}

export function getPlanTier(plan: string | null | undefined): 0 | 1 | 2 {
  const value = String(plan || "free").toLowerCase()
  if (value === "pro") {
    return 2
  }
  if (value === "basic") {
    return 1
  }
  return 0
}

export function getPlanEntitlement(user: Pick<AuthUser, "plan" | "createdAt"> | null | undefined): PlanEntitlement {
  const planTier = getPlanTier(user?.plan)
  const basicTrialDays = getBasicTrialDays()
  let basicTrialEndsAt: string | null = null
  let basicTrialActive = false

  if (user && planTier === 0) {
    const createdAt = new Date(user.createdAt)
    if (!Number.isNaN(createdAt.getTime())) {
      const endsAt = new Date(createdAt.getTime() + basicTrialDays * 24 * 60 * 60 * 1000)
      basicTrialEndsAt = endsAt.toISOString()
      basicTrialActive = endsAt.getTime() > Date.now()
    }
  }

  return {
    planTier,
    effectiveTier: basicTrialActive && planTier === 0 ? 1 : planTier,
    basicTrialActive,
    basicTrialDays,
    basicTrialEndsAt,
  }
}
