"use client"

import { useState } from "react"

type ConnectResponse = {
  ok?: boolean
  error?: string
}

type PluginConnectClientProps = {
  requestId?: string
  secret?: string
  userEmail: string
  userPlan: string
}

export function PluginConnectClient({ requestId, secret, userEmail, userPlan }: PluginConnectClientProps) {
  const canConnect = Boolean(requestId && secret)
  const [pending, setPending] = useState(false)
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState(
    canConnect
      ? "Approve this browser to connect your web plan to the Pigma plugin."
      : "Open this page from the Pigma plugin to connect automatically.",
  )

  async function connectPlugin() {
    if (!requestId || !secret) {
      return
    }

    setPending(true)
    setMessage("Connecting the plugin.")

    try {
      const response = await fetch("/api/plugin/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          secret,
        }),
      })
      const data = (await response.json().catch(() => null)) as ConnectResponse | null
      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.error || "Could not connect the plugin.")
      }

      setConnected(true)
      setMessage("Connected. Return to the Pigma plugin.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not connect the plugin.")
    } finally {
      setPending(false)
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
          Account and billing stay on the web. The plugin only receives a limited connection for reading your current plan.
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
            onClick={connectPlugin}
            disabled={!canConnect || pending || connected}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#005bff] px-5 text-sm font-black text-white transition hover:bg-[#004de0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connected ? "Connected" : pending ? "Connecting" : "Connect plugin"}
          </button>
          <a
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#f1f3f6] px-5 text-sm font-black text-[#050505] transition hover:bg-[#e7ecf3]"
          >
            Dashboard
          </a>
        </div>

        <p className="mt-4 text-sm font-bold text-[#60656b]">{message}</p>
      </div>
    </section>
  )
}
