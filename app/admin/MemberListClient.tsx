"use client"

import { useMemo, useState } from "react"

import type { AdminUserListItem } from "@/lib/auth"

type MemberSortKey = "plan" | "planStatus" | "psdUsage" | "createdAt"
type SortDirection = "asc" | "desc"

type MemberListClientProps = {
  members: AdminUserListItem[]
}

const planLabels: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  basic_yearly: "Basic Annual",
  pro: "Pro",
  pro_yearly: "Pro Annual",
  admin: "Admin",
}

const sortableColumns: Array<{ key: MemberSortKey; label: string }> = [
  { key: "plan", label: "플랜" },
  { key: "planStatus", label: "결제 상태" },
  { key: "psdUsage", label: "PSD 사용량" },
  { key: "createdAt", label: "가입일" },
]

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-icons-round select-none ${className}`} aria-hidden="true">
      {name}
    </span>
  )
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

function getPlanSortRank(plan: string) {
  const value = String(plan || "free").toLowerCase()
  if (value === "admin") {
    return 50
  }
  if (value === "pro_yearly") {
    return 41
  }
  if (value === "pro") {
    return 40
  }
  if (value === "basic_yearly") {
    return 31
  }
  if (value === "basic") {
    return 30
  }
  if (value === "free") {
    return 10
  }
  return 0
}

function getPaymentStatusSortRank(status: string) {
  const value = String(status || "").toLowerCase()
  if (/active|trial/.test(value)) {
    return 50
  }
  if (/past_due|payment_failed/.test(value)) {
    return 30
  }
  if (/paused/.test(value)) {
    return 20
  }
  if (/cancel|refund|chargeback/.test(value)) {
    return 10
  }
  if (value === "free") {
    return 0
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

function formatUsage(usage: AdminUserListItem["psdUsage"]) {
  if (usage.unlimited) {
    return `PSD ${usage.used}회 사용 · 무제한`
  }
  return `PSD ${usage.used}/${usage.limit ?? 0} 사용 · ${usage.remaining ?? 0} 남음`
}

function getCreatedAtTime(value: string | null | undefined) {
  const time = Date.parse(value || "")
  return Number.isNaN(time) ? 0 : time
}

function getSortValue(member: AdminUserListItem, key: MemberSortKey) {
  if (key === "plan") {
    return getPlanSortRank(member.plan)
  }
  if (key === "planStatus") {
    return getPaymentStatusSortRank(member.planStatus)
  }
  if (key === "psdUsage") {
    return Number(member.psdUsage.used || 0)
  }
  return getCreatedAtTime(member.createdAt)
}

function getDirectionLabel(key: MemberSortKey, direction: SortDirection) {
  if (key === "createdAt") {
    return direction === "desc" ? "최신순" : "오래된순"
  }
  return direction === "desc" ? "높은순" : "낮은순"
}

function getNextDirection(currentKey: MemberSortKey, nextKey: MemberSortKey, currentDirection: SortDirection) {
  if (currentKey !== nextKey) {
    return "desc"
  }
  return currentDirection === "desc" ? "asc" : "desc"
}

export default function MemberListClient({ members }: MemberListClientProps) {
  const [sort, setSort] = useState<{ key: MemberSortKey; direction: SortDirection }>({
    key: "createdAt",
    direction: "desc",
  })

  const sortedMembers = useMemo(() => {
    return [...members].sort((firstMember, secondMember) => {
      const firstValue = getSortValue(firstMember, sort.key)
      const secondValue = getSortValue(secondMember, sort.key)
      const valueComparison = firstValue - secondValue

      if (valueComparison !== 0) {
        return sort.direction === "asc" ? valueComparison : -valueComparison
      }

      return firstMember.email.localeCompare(secondMember.email)
    })
  }, [members, sort])

  function updateSort(key: MemberSortKey) {
    setSort((current) => ({
      key,
      direction: getNextDirection(current.key, key, current.direction),
    }))
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-[#e7ecf3]">
      <div className="min-w-[840px]">
        <div className="grid grid-cols-[minmax(220px,1.4fr)_120px_130px_160px_120px_90px] gap-0 bg-[#f6f8fb] px-4 py-3 text-[11px] font-black text-[#7a828b]">
          <div className="flex h-8 items-center tracking-[0.12em]">계정</div>
          {sortableColumns.map((column) => {
            const isActive = sort.key === column.key
            const nextDirection = getNextDirection(sort.key, column.key, sort.direction)
            const directionLabel = getDirectionLabel(column.key, sort.direction)

            return (
              <div key={column.key} className="flex h-8 items-center">
                <button
                  type="button"
                  onClick={() => updateSort(column.key)}
                  aria-label={`${column.label} ${getDirectionLabel(column.key, nextDirection)} 정렬`}
                  className={`inline-flex max-w-full items-center gap-1 rounded-lg px-2 py-1 text-left font-black transition ${
                    isActive
                      ? "bg-white text-[#005bff] shadow-sm ring-1 ring-[#cfe0ff]"
                      : "text-[#7a828b] hover:bg-white hover:text-[#152033]"
                  }`}
                >
                  <span className="truncate tracking-[0.12em]">{column.label}</span>
                  <MaterialIcon
                    name={isActive ? (sort.direction === "desc" ? "keyboard_arrow_down" : "keyboard_arrow_up") : "swap_vert"}
                    className="shrink-0 text-[16px]"
                  />
                  {isActive ? (
                    <span className="shrink-0 text-[10px] font-black tracking-normal text-[#005bff]">{directionLabel}</span>
                  ) : null}
                </button>
              </div>
            )
          })}
          <div className="flex h-8 items-center justify-end tracking-[0.12em]">관리</div>
        </div>
        <div className="max-h-[520px] overflow-auto bg-white">
          {sortedMembers.length ? (
            sortedMembers.map((member) => (
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
  )
}
