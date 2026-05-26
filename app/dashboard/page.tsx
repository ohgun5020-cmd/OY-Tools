import { redirect } from "next/navigation"

import { logoutAction } from "../auth/actions"
import { getCurrentUser, getUserStats } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const stats = getUserStats(user.id)
  const joinedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(user.createdAt))

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-6 py-8 text-[#050505] sm:px-10">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_14px_40px_rgba(15,24,42,0.05)] ring-1 ring-[#e7ecf3]">
          <a href="/" aria-label="PIGMA 홈으로 이동">
            <PigmaLogo className="h-[18px] w-auto" />
          </a>
          <form action={logoutAction}>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#050505] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1c1c1c]">
              로그아웃
              <MaterialIcon name="logout" className="text-[17px]" />
            </button>
          </form>
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
              회원가입과 로그인 세션이 실제 DB에 저장됩니다. 다음 단계에서는 이 공간에 변환 기록, 팀 리뷰 링크,
              결제 플랜 상태를 차례로 연결하면 됩니다.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["현재 플랜", user.plan.toUpperCase(), "workspace_premium"],
                ["결제 상태", user.planStatus.toUpperCase(), "receipt_long"],
                ["로그인 방식", user.provider.toUpperCase(), "verified_user"],
                ["활성 세션", `${stats.activeSessions}개`, "key"],
              ].map(([label, value, icon]) => (
                <div key={label} className="rounded-xl bg-[#f7f9fc] p-5 ring-1 ring-[#e7ecf3]">
                  <MaterialIcon name={icon} className="text-[22px] text-[#005bff]" />
                  <p className="mt-4 text-xs font-black text-[#7a828b]">{label}</p>
                  <p className="mt-1 text-[22px] font-black text-[#050505]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-[#050505] p-7 text-white shadow-[0_18px_40px_rgba(15,24,42,0.12)]">
            <div className="inline-flex size-11 items-center justify-center rounded-xl bg-white text-[#005bff]">
              <MaterialIcon name="person" className="text-[24px]" />
            </div>
            <h2 className="mt-6 text-[26px] font-black">계정 정보</h2>
            <dl className="mt-6 grid gap-4 text-sm">
              <div className="rounded-xl bg-white/[0.07] p-4">
                <dt className="font-black text-white/45">이메일</dt>
                <dd className="mt-1 font-bold">{user.email}</dd>
              </div>
              <div className="rounded-xl bg-white/[0.07] p-4">
                <dt className="font-black text-white/45">가입일</dt>
                <dd className="mt-1 font-bold">{joinedAt}</dd>
              </div>
            </dl>
            <form action="/api/billing/portal" method="post" className="mt-5">
              <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#050505] transition hover:-translate-y-0.5 hover:bg-[#eef5ff]">
                결제 관리
                <MaterialIcon name="open_in_new" className="text-[17px]" />
              </button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  )
}
