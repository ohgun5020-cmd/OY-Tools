"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { loginAction, signupAction, type AuthFormState } from "../auth/actions"

type AuthScreenProps = {
  mode: "login" | "signup"
  notice?: string
  nextPath?: string
}

const initialState: AuthFormState = {
  message: "",
}

const benefits = ["변환 기록 저장", "팀 리뷰 링크 관리", "AI 수정 제안 이어서 보기"]

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-icons-round select-none ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function PigmaLogo({ className = "" }: { className?: string }) {
  return <img src="/assets/piger-wordmark.svg" alt="PIGER" className={className} width={100} height={20} />
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 inline-flex h-[54px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-6 text-[15px] font-black text-white shadow-[0_12px_18px_rgba(0,91,255,0.18)] transition hover:-translate-y-0.5 hover:bg-[#004de0] disabled:cursor-default disabled:bg-[#8fb9ff] disabled:shadow-none disabled:hover:translate-y-0"
    >
      {pending ? "처리 중" : label}
      <MaterialIcon name={pending ? "progress_activity" : "arrow_forward"} className="text-[18px]" />
    </button>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <span className="text-xs font-bold text-[#ff4d55]">{message}</span>
}

function safeNextPath(value: string | undefined) {
  const next = typeof value === "string" ? value.trim() : ""
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\") || next.includes("://")) {
    return ""
  }

  return next
}

export function AuthScreen({ mode, notice, nextPath }: AuthScreenProps) {
  const isSignup = mode === "signup"
  const next = safeNextPath(nextPath)
  const [state, formAction] = useActionState(isSignup ? signupAction : loginAction, initialState)
  const title = isSignup ? "PIGMA 시작하기" : "PIGMA 로그인"
  const description = isSignup
    ? "작업 파일을 연결하고 AI 변환 설정을 바로 저장하세요."
    : "저장된 변환 작업과 팀 리뷰 링크를 이어서 관리하세요."

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f7f9] py-6 text-[#050505] sm:py-8 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-[calc(100vw-40px)] max-w-[1180px] min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,24,42,0.08)] ring-1 ring-[#e4e9f1] sm:w-[calc(100vw-64px)] lg:grid lg:w-[calc(100vw-80px)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="flex min-h-[360px] min-w-0 flex-col justify-between bg-[#050505] p-8 text-white sm:p-10 lg:p-12">
          <a href="/" className="inline-flex w-fit items-center" aria-label="PIGMA 홈으로 이동">
            <PigmaLogo className="h-[20px] w-auto brightness-0 invert" />
          </a>

          <div className="w-full max-w-[320px] py-14 sm:max-w-[420px] lg:py-0">
            <p className="text-sm font-black tracking-[0.18em] text-white/45">ACCOUNT</p>
            <h1 className="mt-5 text-[32px] font-black leading-[1.08] sm:text-[52px]">
              파일 변환 작업을
              <br />
              이어서 관리하세요.
            </h1>
            <p className="mt-6 text-[15px] leading-7 text-white/60 sm:text-[16px]">
              PIGMA 계정으로 변환 상태, 옵션, 리뷰 링크를 한 곳에 모아둘 수 있습니다.
            </p>
          </div>

          <div className="grid w-full max-w-[320px] gap-3 sm:max-w-none">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex min-w-0 items-center gap-3 rounded-lg bg-white/[0.07] px-4 py-3 text-sm font-bold text-white/80"
              >
                <MaterialIcon name="check_circle" className="text-[18px] text-[#0b74ff]" />
                {benefit}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-w-0 items-center justify-start px-6 py-12 sm:justify-center sm:px-10 lg:px-16">
          <div className="w-full min-w-0 max-w-[320px] sm:max-w-[430px]">
            <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#60656b] transition hover:text-[#005bff]">
              <MaterialIcon name="chevron_left" className="text-[18px]" />
              메인으로
            </a>

            <div>
              <p className="text-sm font-black text-[#005bff]">{isSignup ? "SIGN UP" : "LOGIN"}</p>
              <h2 className="mt-3 text-[34px] font-black leading-tight">{title}</h2>
              <p className="mt-3 text-[15px] leading-6 text-[#60656b]">{description}</p>
            </div>

            <div className="mt-8 grid gap-5">
              <a
                href={`/auth/google?mode=${mode}${next ? `&next=${encodeURIComponent(next)}` : ""}`}
                className="group inline-flex h-[54px] w-full items-center justify-between rounded-xl border border-[#dfe5ee] bg-white px-4 text-[15px] font-black text-[#14171a] shadow-[0_10px_24px_rgba(15,24,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#c8d1df] hover:bg-[#fbfcff] hover:shadow-[0_16px_30px_rgba(15,24,42,0.10)]"
                aria-label={isSignup ? "Google 계정으로 회원가입" : "Google 계정으로 로그인"}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-white ring-1 ring-[#e7ecf3]">
                    <GoogleIcon className="size-[18px]" />
                  </span>
                  {isSignup ? "Google로 시작하기" : "Google로 로그인"}
                </span>
                <MaterialIcon name="arrow_forward" className="text-[18px] text-[#9aa3af] transition group-hover:text-[#005bff]" />
              </a>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[#e7ecf3]" />
                <span className="text-xs font-black text-[#a2aab5]">{isSignup ? "이메일로 가입" : "이메일로 로그인"}</span>
                <span className="h-px flex-1 bg-[#e7ecf3]" />
              </div>
            </div>

            {notice ? (
              <p className="mt-5 rounded-xl bg-[#eef5ff] px-4 py-3 text-sm font-bold leading-5 text-[#005bff] ring-1 ring-[#dbe7ff]">
                {notice}
              </p>
            ) : null}

            {state.message ? (
              <p aria-live="polite" className="mt-5 rounded-xl bg-[#fff1f2] px-4 py-3 text-sm font-bold leading-5 text-[#ff4d55] ring-1 ring-[#ffd6db]">
                {state.message}
              </p>
            ) : null}

            <form action={formAction} className="mt-5 grid gap-4" noValidate>
              {next ? <input type="hidden" name="next" value={next} /> : null}
              {isSignup ? (
                <label className="grid gap-2 text-sm font-bold text-[#14171a]">
                  이름
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="홍길동"
                    required
                    className="h-[52px] rounded-xl border border-[#dfe5ee] bg-white px-4 text-[15px] font-medium outline-none transition placeholder:text-[#a2aab5] focus:border-[#005bff] focus:ring-4 focus:ring-[#005bff]/10"
                  />
                  <FieldError message={state.fieldErrors?.name} />
                </label>
              ) : null}

              <label className="grid gap-2 text-sm font-bold text-[#14171a]">
                이메일
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="hello@pigma.app"
                  required
                  className="h-[52px] rounded-xl border border-[#dfe5ee] bg-white px-4 text-[15px] font-medium outline-none transition placeholder:text-[#a2aab5] focus:border-[#005bff] focus:ring-4 focus:ring-[#005bff]/10"
                />
                <FieldError message={state.fieldErrors?.email} />
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#14171a]">
                비밀번호
                <input
                  type="password"
                  name="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder={isSignup ? "8자 이상 입력" : "비밀번호 입력"}
                  minLength={8}
                  required
                  className="h-[52px] rounded-xl border border-[#dfe5ee] bg-white px-4 text-[15px] font-medium outline-none transition placeholder:text-[#a2aab5] focus:border-[#005bff] focus:ring-4 focus:ring-[#005bff]/10"
                />
                <FieldError message={state.fieldErrors?.password} />
              </label>

              {isSignup ? (
                <p className="rounded-xl bg-[#f7f9fc] px-4 py-3 text-sm font-bold leading-5 text-[#60656b] ring-1 ring-[#e7ecf3]">
                  회원가입하면 Free로 시작하고, Basic/Pro는 결제 완료 후 자동 적용됩니다.
                </p>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 font-bold text-[#60656b]">
                    <input name="remember" value="yes" type="checkbox" className="size-4 rounded border-[#cbd3dd] accent-[#005bff]" />
                    로그인 유지
                  </label>
                  <a href="/signup" className="font-bold text-[#005bff]">
                    계정 만들기
                  </a>
                </div>
              )}

              <SubmitButton label={isSignup ? "회원가입" : "로그인"} />
            </form>

            <div className="mt-7 rounded-xl bg-[#f7f9fc] px-5 py-4 text-center text-sm text-[#60656b] ring-1 ring-[#e7ecf3]">
              {isSignup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"}{" "}
              <a href={isSignup ? "/login" : "/signup"} className="font-black text-[#005bff]">
                {isSignup ? "로그인" : "회원가입"}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
