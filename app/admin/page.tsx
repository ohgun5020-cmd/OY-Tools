import { notFound, redirect } from "next/navigation"

import { updateManualPlanAction } from "./actions"
import NoticeAdminClient from "./NoticeAdminClient"
import { isAdminUser } from "@/lib/admin"
import { getCurrentUser, getUserByEmail } from "@/lib/auth"
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

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-6 py-8 text-[#050505] sm:px-10">
      <div className="mx-auto max-w-[920px]">
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
