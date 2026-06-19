import type { Metadata } from "next"

import { AuthScreen } from "../_components/AuthScreen"

export const metadata: Metadata = {
  title: "로그인 | PIGER",
  description: "PIGER 계정으로 로그인하고 변환 작업과 리뷰 링크를 이어서 관리하세요.",
}

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    signedOut?: string
    next?: string
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
    return "Google 인증을 완료하지 못했습니다. 다시 시도해 주세요."
  }

  if (params.error === "google-account-conflict") {
    return "이 Google 계정은 이미 다른 PIGER 계정과 연결되어 있습니다. 기존 계정으로 로그인해 확인해 주세요."
  }

  return undefined
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  return <AuthScreen mode="login" notice={getNotice(params)} nextPath={params.next} />
}
