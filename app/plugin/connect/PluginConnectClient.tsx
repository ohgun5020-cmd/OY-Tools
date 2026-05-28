"use client"

import { useState } from "react"

type TokenResponse = {
  token?: string
  expiresAt?: string
  error?: string
}

type PluginConnectClientProps = {
  userEmail: string
  userPlan: string
}

function formatDate(value: string | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function PluginConnectClient({ userEmail, userPlan }: PluginConnectClientProps) {
  const [token, setToken] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState("Create a connection token for the Pigma plugin.")

  async function createToken() {
    setPending(true)
    setMessage("Creating a plugin token.")

    try {
      const response = await fetch("/api/plugin/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = (await response.json().catch(() => null)) as TokenResponse | null
      if (!response.ok || !data?.token) {
        throw new Error(data?.error || "Could not create a plugin token.")
      }

      setToken(data.token)
      setExpiresAt(data.expiresAt || "")
      setMessage("Copy this token into the Pigma plugin plan connection field.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create a plugin token.")
    } finally {
      setPending(false)
    }
  }

  async function copyToken() {
    if (!token) {
      return
    }

    try {
      await navigator.clipboard.writeText(token)
      setMessage("Token copied to the clipboard.")
    } catch {
      setMessage("Clipboard copy was blocked. Select and copy the token manually.")
    }
  }

  return (
    <section className="mx-auto grid min-h-screen max-w-[920px] content-center gap-6 px-6 py-10 text-[#050505]">
      <a href="/" className="text-sm font-black text-[#005bff]">
        PIGMA
      </a>
      <div className="rounded-2xl bg-white p-7 shadow-[0_18px_50px_rgba(15,24,42,0.08)] ring-1 ring-[#e7ecf3] sm:p-9">
        <p className="text-sm font-black tracking-[0.18em] text-[#005bff]">PLUGIN CONNECT</p>
        <h1 className="mt-4 text-[34px] font-black leading-tight sm:text-[48px]">Connect Pigma plugin</h1>
        <p className="mt-4 max-w-[680px] text-[15px] font-bold leading-7 text-[#60656b]">
          Account and billing stay on the web. The plugin only uses this token to read your current plan.
        </p>

        <dl className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[#f7f9fc] p-4 ring-1 ring-[#e7ecf3]">
            <dt className="text-xs font-black text-[#7a828b]">ACCOUNT</dt>
            <dd className="mt-1 break-words text-sm font-black">{userEmail}</dd>
          </div>
          <div className="rounded-xl bg-[#f7f9fc] p-4 ring-1 ring-[#e7ecf3]">
            <dt className="text-xs font-black text-[#7a828b]">CURRENT PLAN</dt>
            <dd className="mt-1 text-sm font-black uppercase">{userPlan}</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={createToken}
            disabled={pending}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#005bff] px-5 text-sm font-black text-white transition hover:bg-[#004de0] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Creating" : "Create connection token"}
          </button>
          <button
            type="button"
            onClick={copyToken}
            disabled={!token}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#050505] px-5 text-sm font-black text-white transition hover:bg-[#1c1c1c] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Copy token
          </button>
          <a
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#f1f3f6] px-5 text-sm font-black text-[#050505] transition hover:bg-[#e7ecf3]"
          >
            Dashboard
          </a>
        </div>

        <p className="mt-4 text-sm font-bold text-[#60656b]">{message}</p>

        {token ? (
          <div className="mt-5 rounded-xl border border-[#dbe6f5] bg-[#f7fbff] p-4">
            <p className="text-xs font-black tracking-[0.12em] text-[#005bff]">PLUGIN TOKEN</p>
            <code className="mt-3 block overflow-x-auto rounded-lg bg-white p-3 text-xs font-bold text-[#050505] ring-1 ring-[#dbe6f5]">
              {token}
            </code>
            <p className="mt-3 text-xs font-bold text-[#60656b]">Expires: {formatDate(expiresAt) || "Checking"}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
