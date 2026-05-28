import type { Metadata } from "next"

import { AuthScreen } from "../_components/AuthScreen"

export const metadata: Metadata = {
  title: "회원가입 | PIGMA",
  description: "PIGMA 계정을 만들고 PSD 변환 작업을 바로 시작하세요.",
}

type SignupPageProps = {
  searchParams: Promise<{
    error?: string
    next?: string
  }>
}

function getNotice(params: Awaited<SignupPageProps["searchParams"]>) {
  if (params.error === "google-unconfigured") {
    return "Google 회원가입은 OAuth 클라이언트 ID와 시크릿을 환경변수에 연결하면 바로 활성화됩니다."
  }

  if (params.error === "google-auth") {
    return "Google 인증을 완료하지 못했습니다. 다시 시도해주세요."
  }

  if (params.error === "google-account-conflict") {
    return "이 Google 계정은 이미 다른 PIGMA 계정과 연결되어 있습니다. 기존 계정으로 로그인해 확인해주세요."
  }

  return undefined
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  return <AuthScreen mode="signup" notice={getNotice(params)} nextPath={params.next} />
}
