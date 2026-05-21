import type { Metadata } from "next"

import { AuthScreen } from "../_components/AuthScreen"

export const metadata: Metadata = {
  title: "로그인 | PIGMA",
  description: "PIGMA 계정으로 로그인하고 변환 작업과 리뷰 링크를 이어서 관리하세요.",
}

export default function LoginPage() {
  return <AuthScreen mode="login" />
}
