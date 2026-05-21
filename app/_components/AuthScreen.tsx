type AuthScreenProps = {
  mode: "login" | "signup"
}

const benefits = [
  "PSD 변환 기록 저장",
  "팀 리뷰 링크 관리",
  "AI 수정 제안 이어서 보기",
]

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-icons-round select-none ${className}`} aria-hidden="true">
      {name}
    </span>
  )
}

function PigmaLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/assets/pigma-wordmark.svg"
      alt="PIGMA"
      className={className}
      width={100}
      height={18}
    />
  )
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const isSignup = mode === "signup"
  const title = isSignup ? "PIGMA 시작하기" : "PIGMA 로그인"
  const description = isSignup
    ? "작업 파일을 연결하고 AI 변환 흐름을 바로 저장하세요."
    : "저장된 변환 작업과 팀 리뷰 링크로 돌아갑니다."

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
              파일 변환 흐름을
              <br />
              이어서 관리하세요.
            </h1>
            <p className="mt-6 text-[15px] leading-7 text-white/64 sm:text-[16px]">
              PIGMA 계정으로 변환 상태, 옵션, 리뷰 링크를 한 곳에 모아둘 수 있습니다.
            </p>
          </div>

          <div className="grid w-full max-w-[320px] gap-3 sm:max-w-none">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex min-w-0 items-center gap-3 rounded-lg bg-white/[0.07] px-4 py-3 text-sm font-bold text-white/82">
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

            <form className="mt-9 grid gap-4">
              {isSignup ? (
                <label className="grid gap-2 text-sm font-bold text-[#14171a]">
                  이름
                  <input
                    type="text"
                    name="name"
                    placeholder="홍길동"
                    className="h-[52px] rounded-xl border border-[#dfe5ee] bg-white px-4 text-[15px] font-medium outline-none transition placeholder:text-[#a2aab5] focus:border-[#005bff] focus:ring-4 focus:ring-[#005bff]/10"
                  />
                </label>
              ) : null}

              <label className="grid gap-2 text-sm font-bold text-[#14171a]">
                이메일
                <input
                  type="email"
                  name="email"
                  placeholder="hello@pigma.app"
                  className="h-[52px] rounded-xl border border-[#dfe5ee] bg-white px-4 text-[15px] font-medium outline-none transition placeholder:text-[#a2aab5] focus:border-[#005bff] focus:ring-4 focus:ring-[#005bff]/10"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#14171a]">
                비밀번호
                <input
                  type="password"
                  name="password"
                  placeholder={isSignup ? "8자 이상 입력" : "비밀번호 입력"}
                  className="h-[52px] rounded-xl border border-[#dfe5ee] bg-white px-4 text-[15px] font-medium outline-none transition placeholder:text-[#a2aab5] focus:border-[#005bff] focus:ring-4 focus:ring-[#005bff]/10"
                />
              </label>

              {isSignup ? (
                <label className="grid gap-2 text-sm font-bold text-[#14171a]">
                  플랜
                  <select
                    name="plan"
                    defaultValue="free"
                    className="h-[52px] rounded-xl border border-[#dfe5ee] bg-white px-4 text-[15px] font-bold outline-none transition focus:border-[#005bff] focus:ring-4 focus:ring-[#005bff]/10"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                  </select>
                </label>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 font-bold text-[#60656b]">
                    <input type="checkbox" className="size-4 rounded border-[#cbd3dd] accent-[#005bff]" />
                    로그인 유지
                  </label>
                  <a href="/signup" className="font-bold text-[#005bff]">
                    계정 만들기
                  </a>
                </div>
              )}

              <button
                type="button"
                className="mt-3 inline-flex h-[54px] items-center justify-center gap-2 rounded-xl bg-[#005bff] px-6 text-[15px] font-black text-white shadow-[0_12px_18px_rgba(0,91,255,0.18)] transition hover:-translate-y-0.5 hover:bg-[#004de0]"
              >
                {isSignup ? "회원가입" : "로그인"}
                <MaterialIcon name="arrow_forward" className="text-[18px]" />
              </button>
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
