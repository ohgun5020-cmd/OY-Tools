import type { Metadata } from "next"

import { AuthScreen } from "../_components/AuthScreen"

export const metadata: Metadata = {
  title: "회원가입 | PIGMA",
  description: "PIGMA 계정을 만들고 PSD 변환 작업을 바로 시작하세요.",
}

export default function SignupPage() {
  return <AuthScreen mode="signup" />
}
