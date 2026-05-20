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
      setError(payload?.error || "Login failed.")
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
          <p className="text-xs text-muted-foreground">Private operations console</p>
        </div>
      </div>

      <Card className="panel-card">
        <CardHeader>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/60">
            <LockKeyhole className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-2xl">OY Panel</CardTitle>
          <CardDescription>Single-admin access for SMM orders and service control.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Admin email</Label>
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
              <Label htmlFor="password">Password</Label>
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
                <AlertDescription>Local fallback password is oy-admin. Set env vars before deployment.</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Checking..." : "Enter console"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
