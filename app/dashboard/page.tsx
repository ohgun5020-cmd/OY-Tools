import { redirect } from "next/navigation"

import { logoutAction } from "../auth/actions"
import { isAdminUser } from "@/lib/admin"
import { getCurrentUser, getUserStats } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const planLabels: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
}

const statusLabels: Record<string, string> = {
  active: "활성",
  free: "무료",
  inactive: "비활성",
  on_trial: "체험 중",
  trialing: "체험 중",
  past_due: "결제 확인 필요",
  paused: "일시 중지",
  canceled: "취소됨",
}

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-icons-round select-none ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

function PigmaLogo({ className = "" }: { className?: string }) {
  return <img src="/assets/pigma-wordmark.svg" alt="PIGMA" className={className} width={100} height={18} />
}

function getPlanLabel(plan: string) {
  return planLabels[plan] || plan.toUpperCase()
}

function getStatusLabel(status: string) {
  return statusLabels[status] || status.toUpperCase()
}

function formatDate(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

function getStatusTone(status: string) {
  if (status === "active" || status === "on_trial" || status === "trialing") {
    return "bg-[#eaf3ff] text-[#005bff] ring-[#c8ddff]"
  }

  if (status === "past_due" || status === "paused") {
    return "bg-[#fff5dd] text-[#9a5a00] ring-[#ffe0a3]"
  }

  if (status === "canceled" || status === "inactive") {
    return "bg-[#fff0f0] text-[#c22f2f] ring-[#ffd1d1]"
  }

  return "bg-[#f1f3f6] text-[#5f6670] ring-[#dde3eb]"
}

function PortalButton({
  action,
  icon,
  title,
  description,
  tone = "default",
}: {
  action: "overview" | "update-payment" | "cancel"
  icon: string
  title: string
  description: string
  tone?: "default" | "danger"
}) {
  const toneClass =
    tone === "danger"
      ? "border-[#ffd7d7] bg-[#fff7f7] text-[#c22f2f] hover:border-[#ffb8b8] hover:bg-[#fff0f0]"
      : "border-[#e3e8ef] bg-white text-[#050505] hover:border-[#c9d8ef] hover:bg-[#f7fbff]"

  return (
    <form action="/api/billing/portal" method="post">
      <input type="hidden" name="action" value={action} />
      <button
        className={`flex min-h-[92px] w-full items-start gap-4 rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${toneClass}`}
      >
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#050505] text-white">
          <MaterialIcon name={icon} className="text-[22px]" />
        </span>
        <span>
          <span className="block text-[16px] font-black">{title}</span>
          <span className="mt-1 block text-sm font-bold leading-6 text-[#6b7280]">{description}</span>
        </span>
      </button>
    </form>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const stats = getUserStats(user.id)
  const joinedAt = formatDate(user.createdAt) || "확인 중"
  const renewsAt = formatDate(user.planRenewsAt)
  const hasBillingProfile = Boolean(user.billingCustomerId || user.billingPortalUrl || process.env.PADDLE_CUSTOMER_PORTAL_URL)
  const hasPaidPlan = user.plan !== "free" || Boolean(user.billingSubscriptionId)
  const nextBillingLabel = renewsAt || (hasPaidPlan ? "Paddle에서 확인" : "무료 플랜")
  const isAdmin = isAdminUser(user)

  const summaryItems = [
    ["현재 플랜", getPlanLabel(user.plan), "workspace_premium"],
    ["결제 상태", getStatusLabel(user.planStatus), "receipt_long"],
    ["로그인 방식", user.provider.toUpperCase(), "verified_user"],
    ["활성 세션", `${stats.activeSessions}개`, "key"],
  ]

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-6 py-8 text-[#050505] sm:px-10">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_14px_40px_rgba(15,24,42,0.05)] ring-1 ring-[#e7ecf3]">
          <a href="/" aria-label="PIGMA 홈으로 이동">
            <PigmaLogo className="h-[18px] w-auto" />
          </a>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <a
                href="/admin"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#eef5ff] px-5 text-sm font-black text-[#005bff] transition hover:-translate-y-0.5 hover:bg-[#ddecff]"
              >
                관리자
                <MaterialIcon name="admin_panel_settings" className="text-[17px]" />
              </a>
            ) : null}
            <form action={logoutAction}>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050505] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1c1c1c]">
                로그아웃
                <MaterialIcon name="logout" className="text-[17px]" />
              </button>
            </form>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl bg-white p-8 shadow-[0_18px_40px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3] sm:p-10">
            <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">WORKSPACE</p>
            <h1 className="mt-5 text-[36px] font-black leading-tight sm:text-[52px]">
              {user.name}님,
              <br />
              변환 작업을 이어가세요.
            </h1>
            <p className="mt-5 max-w-[620px] text-[16px] leading-7 text-[#60656b]">
              결제 플랜, 세션, 계정 정보를 한곳에서 확인할 수 있습니다. 작업 기록과 팀 리뷰 링크도 이 공간에
              차례로 연결해갈 예정입니다.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summaryItems.map(([label, value, icon]) => (
                <div key={label} className="rounded-xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
                  <MaterialIcon name={icon} className="text-[22px] text-[#005bff]" />
                  <p className="mt-4 text-xs font-black text-[#7a828b]">{label}</p>
                  <p className="mt-1 text-[22px] font-black text-[#050505]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-[#050505] p-7 text-white shadow-[0_18px_40px_rgba(15,24,42,0.12)]">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="size-12 rounded-full bg-white object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-white text-[#005bff]">
                <MaterialIcon name="person" className="text-[24px]" />
              </div>
            )}
            <h2 className="mt-6 text-[26px] font-black">계정 정보</h2>
            <dl className="mt-6 grid gap-4 text-sm">
              <div className="rounded-xl bg-white/[0.07] p-4">
                <dt className="font-black text-white/45">이메일</dt>
                <dd className="mt-1 break-words font-bold">{user.email}</dd>
              </div>
              <div className="rounded-xl bg-white/[0.07] p-4">
                <dt className="font-black text-white/45">가입일</dt>
                <dd className="mt-1 font-bold">{joinedAt}</dd>
              </div>
            </dl>
            <a
              href="#billing"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#050505] transition hover:-translate-y-0.5 hover:bg-[#eef5ff]"
            >
              결제 관리
              <MaterialIcon name="south" className="text-[17px]" />
            </a>
          </aside>
        </section>

        <section
          id="billing"
          className="mt-6 rounded-2xl bg-white p-7 shadow-[0_18px_40px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3] sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">BILLING</p>
              <h2 className="mt-3 text-[30px] font-black sm:text-[38px]">결제와 구독 관리</h2>
              <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[#60656b]">
                카드 변경, 구독 취소, 결제 내역 확인은 Paddle 보안 포털에서 직접 처리됩니다. 고객은 별도 문의 없이
                스스로 결제 정보를 관리할 수 있습니다.
              </p>
            </div>
            <span
              className={`inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-black ring-1 ${getStatusTone(
                user.planStatus,
              )}`}
            >
              {getStatusLabel(user.planStatus)}
            </span>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">CURRENT PLAN</p>
              <p className="mt-3 text-[30px] font-black">{getPlanLabel(user.plan)}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">현재 적용된 요금제입니다.</p>
            </div>
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">NEXT BILLING</p>
              <p className="mt-3 text-[24px] font-black">{nextBillingLabel}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">다음 결제일 또는 갱신 상태입니다.</p>
            </div>
            <div className="rounded-2xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
              <p className="text-xs font-black tracking-[0.14em] text-[#7a828b]">CUSTOMER PORTAL</p>
              <p className="mt-3 text-[24px] font-black">{hasBillingProfile ? "연결됨" : "대기 중"}</p>
              <p className="mt-1 text-sm font-bold text-[#60656b]">
                {hasBillingProfile ? "Paddle 포털로 바로 이동합니다." : "유료 결제 후 자동으로 연결됩니다."}
              </p>
            </div>
          </div>

          {hasBillingProfile ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <PortalButton action="overview" icon="receipt_long" title="결제 내역 보기" description="영수증과 결제 기록을 확인합니다." />
              <PortalButton action="update-payment" icon="credit_card" title="카드 변경" description="저장된 결제 수단을 수정합니다." />
              <PortalButton action="cancel" icon="block" title="구독 취소" description="Paddle 취소 플로우로 이동합니다." tone="danger" />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-[#dbe6f5] bg-[#f7fbff] p-5">
              <p className="text-[18px] font-black">아직 관리할 구독이 없습니다.</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#60656b]">
                Basic 또는 Pro를 선택하면 결제 완료 후 이 영역에서 카드 변경과 구독 취소를 직접 처리할 수 있습니다.
              </p>
              <a
                href="/#pricing"
                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#005bff] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#004de0]"
              >
                요금제 보기
                <MaterialIcon name="arrow_forward" className="text-[17px]" />
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
