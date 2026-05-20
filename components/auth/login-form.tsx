"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, Sparkles } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginFormProps = {
  defaultEmail: string
  devFallbackEnabled: boolean
}

export function LoginForm({ defaultEmail, devFallbackEnabled }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      setError(payload?.error || "로그인에 실패했습니다.")
      return
    }

    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">OY Tools</p>
          <p className="text-xs text-muted-foreground">개인 운영 콘솔</p>
        </div>
      </div>

      <Card className="panel-card">
        <CardHeader>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/60">
            <LockKeyhole className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-2xl">OY Panel</CardTitle>
          <CardDescription>주문 생성, 상태 확인, 서비스 관리를 한 화면에서 처리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">관리자 이메일</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {devFallbackEnabled ? (
              <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
                <AlertDescription>로컬 기본 비밀번호는 oy-admin입니다. 배포 전에는 환경변수를 설정하세요.</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "확인 중..." : "관리자 화면 들어가기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
