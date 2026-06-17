import { notFound, redirect } from "next/navigation"

import { updateManualPlanAction } from "./actions"
import NoticeAdminClient from "./NoticeAdminClient"
import { isAdminUser } from "@/lib/admin"
import { getCurrentUser, getUserByEmail, listUsersForAdmin } from "@/lib/auth"
import { getNoticePublicUrl, readNoticePayload } from "@/lib/notices"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const planLabels: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  basic_yearly: "Basic Annual",
  pro: "Pro",
  pro_yearly: "Pro Annual",
  admin: "Admin",
}

const errorMessages: Record<string, string> = {
  email: "이메일을 입력해 주세요.",
  plan: "적용할 요금제를 다시 선택해 주세요.",
  "not-found": "해당 이메일로 가입된 계정을 찾지 못했습니다. 먼저 웹에서 로그인 또는 가입을 완료해야 합니다.",
}

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-icons-round select-none ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getPlanTier(plan: string) {
  const value = String(plan || "free").toLowerCase()
  if (value === "admin") {
    return 3
  }
  if (value.startsWith("pro")) {
    return 2
  }
  if (value.startsWith("basic")) {
    return 1
  }
  return 0
}

function getPlanBadgeClass(plan: string) {
  const tier = getPlanTier(plan)
  if (tier >= 3) {
    return "bg-[#ebe9ff] text-[#5143c7] ring-[#cfc8ff]"
  }
  if (tier >= 2) {
    return "bg-[#e8f8f0] text-[#14733b] ring-[#bfe8d1]"
  }
  if (tier >= 1) {
    return "bg-[#eef4ff] text-[#005bff] ring-[#cfe0ff]"
  }
  return "bg-[#f3f5f7] text-[#60656b] ring-[#dfe6ef]"
}

function getStatusBadgeClass(status: string) {
  const value = String(status || "").toLowerCase()
  if (/past_due|failed|chargeback|refund|cancel|paused/.test(value)) {
    return "bg-[#fff4e5] text-[#a15c00] ring-[#ffd89d]"
  }
  if (/active|trial/.test(value)) {
    return "bg-[#e8f8f0] text-[#14733b] ring-[#bfe8d1]"
  }
  return "bg-[#f3f5f7] text-[#60656b] ring-[#dfe6ef]"
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
}

function formatUsage(usage: ReturnType<typeof listUsersForAdmin>[number]["psdUsage"]) {
  if (usage.unlimited) {
    return "PSD 무제한"
  }
  return `PSD ${usage.used}/${usage.limit ?? 0} 사용 · ${usage.remaining ?? 0} 남음`
}

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/login")
  }

  if (!isAdminUser(currentUser)) {
    notFound()
  }

  const params = searchParams ? await searchParams : {}
  const targetEmail = firstParam(params.email) || "ohgun5020@gmail.com"
  const selectedPlan = firstParam(params.plan) || "pro"
  const ok = firstParam(params.ok)
  const error = firstParam(params.error)
  const targetUser = targetEmail ? getUserByEmail(targetEmail) : null
  const noticePayload = await readNoticePayload()
  const members = listUsersForAdmin()
  const paidMemberCount = members.filter((member) => getPlanTier(member.plan) >= 1).length
  const proMemberCount = members.filter((member) => getPlanTier(member.plan) >= 2 && member.plan !== "admin").length
  const adminMemberCount = members.filter((member) => getPlanTier(member.plan) >= 3).length

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-6 py-8 text-[#050505] sm:px-10">
      <div className="mx-auto max-w-[1180px]">
        <header className="flex flex-col gap-5 rounded-3xl bg-white p-7 shadow-[0_18px_44px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">ADMIN</p>
            <h1 className="mt-3 text-[34px] font-black leading-tight sm:text-[46px]">요금제 수동 적용</h1>
            <p className="mt-3 max-w-[620px] text-[15px] font-bold leading-7 text-[#60656b]">
              이메일이 같은 Google 로그인 계정에도 같은 사용자로 플랜을 적용합니다.
            </p>
          </div>
          <a
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050505] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1c1c1c]"
          >
            대시보드
            <MaterialIcon name="arrow_forward" className="text-[17px]" />
          </a>
        </header>

        {ok ? (
          <div className="mt-6 rounded-2xl border border-[#bfe8d1] bg-[#f0fff6] p-5 text-sm font-black text-[#14733b]">
            {targetEmail} 계정을 {planLabels[selectedPlan] || selectedPlan.toUpperCase()} 플랜으로 변경했습니다.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-[#ffd7d7] bg-[#fff7f7] p-5 text-sm font-black text-[#c22f2f]">
            {errorMessages[error] || "요청을 처리하지 못했습니다."}
          </div>
        ) : null}

        <NoticeAdminClient initialPayload={noticePayload} noticePublicUrl={getNoticePublicUrl()} />

        <section className="mt-6 rounded-3xl bg-white p-7 shadow-[0_18px_44px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-[#005bff]">MEMBERS</p>
              <h2 className="mt-2 text-[28px] font-black leading-tight">회원 전체 리스트</h2>
              <p className="mt-2 max-w-[640px] text-sm font-bold leading-6 text-[#60656b]">
                가입된 계정, 현재 플랜, 결제 상태, PSD 사용량, 활성 세션을 한 번에 확인합니다.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ["전체", members.length],
                ["유료", paidMemberCount],
                ["Pro", proMemberCount],
                ["Admin", adminMemberCount],
              ].map(([label, value]) => (
                <div key={label} className="min-w-[72px] rounded-2xl bg-[#f6f8fb] px-3 py-3 ring-1 ring-[#e7ecf3]">
                  <p className="text-[10px] font-black tracking-[0.12em] text-[#7a828b]">{label}</p>
                  <p className="mt-1 text-xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-[#e7ecf3]">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[minmax(220px,1.4fr)_120px_130px_160px_120px_90px] gap-0 bg-[#f6f8fb] px-4 py-3 text-[11px] font-black tracking-[0.12em] text-[#7a828b]">
                <div>계정</div>
                <div>플랜</div>
                <div>결제 상태</div>
                <div>PSD 사용량</div>
                <div>가입일</div>
                <div className="text-right">관리</div>
              </div>
              <div className="max-h-[520px] overflow-auto bg-white">
                {members.length ? (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-[minmax(220px,1.4fr)_120px_130px_160px_120px_90px] items-center gap-0 border-t border-[#eef2f6] px-4 py-4 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-black">{member.email}</p>
                        <p className="mt-1 truncate text-xs font-bold text-[#7a828b]">
                          {member.name} · {member.provider}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-[#9aa3ad]">
                          세션 {member.activeSessions} · 플러그인 토큰 {member.activePluginTokens}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-black ring-1 ${getPlanBadgeClass(
                            member.plan,
                          )}`}
                        >
                          {planLabels[member.plan] || member.plan}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-black ring-1 ${getStatusBadgeClass(
                            member.planStatus,
                          )}`}
                        >
                          {member.planStatus}
                        </span>
                      </div>
                      <div className="text-xs font-bold leading-5 text-[#60656b]">{formatUsage(member.psdUsage)}</div>
                      <div className="text-xs font-bold text-[#60656b]">{formatDate(member.createdAt)}</div>
                      <div className="text-right">
                        <a
                          href={`/admin?email=${encodeURIComponent(member.email)}&plan=${encodeURIComponent(member.plan)}`}
                          className="inline-flex h-9 items-center justify-center rounded-xl bg-[#050505] px-3 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1c1c1c]"
                        >
                          선택
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border-t border-[#eef2f6] px-4 py-8 text-center text-sm font-bold text-[#60656b]">
                    아직 가입된 회원이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <form
            action={updateManualPlanAction}
            className="rounded-3xl bg-white p-7 shadow-[0_18px_44px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3]"
          >
            <label className="block">
              <span className="text-xs font-black tracking-[0.14em] text-[#7a828b]">USER EMAIL</span>
              <input
                name="email"
                type="email"
                required
                defaultValue={targetEmail}
                className="mt-3 h-14 w-full rounded-2xl border border-[#dfe6ef] bg-[#f8fafc] px-4 text-[16px] font-bold outline-none transition focus:border-[#005bff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
                placeholder="user@example.com"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-xs font-black tracking-[0.14em] text-[#7a828b]">PLAN</span>
              <select
                name="plan"
                defaultValue={selectedPlan}
                className="mt-3 h-14 w-full rounded-2xl border border-[#dfe6ef] bg-[#f8fafc] px-4 text-[16px] font-black outline-none transition focus:border-[#005bff] focus:bg-white focus:ring-4 focus:ring-[#005bff]/10"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="basic_yearly">Basic Annual</option>
                <option value="pro">Pro</option>
                <option value="pro_yearly">Pro Annual</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#005bff] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#004de0]">
              플랜 적용
              <MaterialIcon name="workspace_premium" className="text-[18px]" />
            </button>
          </form>

          <aside className="rounded-3xl bg-[#050505] p-6 text-white shadow-[0_18px_44px_rgba(15,24,42,0.12)]">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white text-[#005bff]">
              <MaterialIcon name="admin_panel_settings" className="text-[25px]" />
            </div>
            <h2 className="mt-5 text-[23px] font-black">현재 상태</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="rounded-2xl bg-white/[0.08] p-4">
                <dt className="font-black text-white/45">관리자</dt>
                <dd className="mt-1 break-words font-bold">{currentUser.email}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-4">
                <dt className="font-black text-white/45">대상 계정</dt>
                <dd className="mt-1 break-words font-bold">{targetUser ? targetUser.email : "아직 미확인"}</dd>
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-4">
                <dt className="font-black text-white/45">현재 플랜</dt>
                <dd className="mt-1 font-bold">{targetUser ? planLabels[targetUser.plan] || targetUser.plan : "-"}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  )
}
