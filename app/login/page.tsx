import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthScreen } from "../_components/AuthScreen"
import { getCurrentUser } from "@/lib/auth"

export const metadata: Metadata = {
  title: "로그인 | PIGMA",
  description: "PIGMA 계정으로 로그인하고 변환 작업과 리뷰 링크를 이어서 관리하세요.",
}

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    signedOut?: string
  }>
}

function getNotice(params: Awaited<LoginPageProps["searchParams"]>) {
  if (params.signedOut) {
    return "로그아웃되었습니다."
  }

  if (params.error === "google-unconfigured") {
    return "Google 로그인은 OAuth 클라이언트 ID와 시크릿을 환경변수에 연결하면 바로 활성화됩니다."
  }

  if (params.error === "google-auth") {
    return "Google 인증을 완료하지 못했습니다. 다시 시도해주세요."
  }

  return undefined
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  const params = await searchParams
  return <AuthScreen mode="login" notice={getNotice(params)} />
}
