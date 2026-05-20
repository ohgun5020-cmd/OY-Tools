import { AlertTriangle, CheckCircle2, KeyRound, LockKeyhole, Server } from "lucide-react"

import { SettingsForm } from "@/features/panel/settings-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getAdminRuntimeConfig } from "@/lib/auth/session"
import { getSmmConnectionState } from "@/lib/smm/client"
import { getPanelSettings } from "@/lib/storage/panel-store"
import { isSupabaseConfigured } from "@/lib/storage/supabase"

export default async function SettingsPage() {
  const settings = await getPanelSettings()
  const connection = getSmmConnectionState()
  const admin = getAdminRuntimeConfig()
  const hasSupabase = isSupabaseConfigured()

  const checks = [
    { label: "SMM_API_URL", ok: connection.hasApiUrl },
    { label: "SMM_API_KEY", ok: connection.hasApiKey },
    { label: "SUPABASE_URL", ok: Boolean(process.env.SUPABASE_URL) },
    { label: "SUPABASE_SERVICE_ROLE_KEY", ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { label: "ADMIN_EMAIL", ok: admin.hasAdminEmail },
    { label: "ADMIN_PASSWORD", ok: admin.hasAdminPassword },
    { label: "AUTH_SECRET", ok: admin.hasAuthSecret },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-primary">Control</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">API connection, margin defaults, and deployment readiness.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <Card className="panel-card">
          <CardHeader>
            <CardTitle>Internal calculation</CardTitle>
            <CardDescription>Used for estimated order amount before execution.</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm settings={settings} />
          </CardContent>
        </Card>

        <Card className="panel-card">
          <CardHeader>
            <CardTitle>Runtime status</CardTitle>
            <CardDescription>Server-side env checks for Railway and Supabase deployment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatusTile
                icon={Server}
                label="Provider API"
                value={connection.configured ? "Live" : "Demo"}
                ok={connection.configured}
              />
              <StatusTile icon={KeyRound} label="Order store" value={hasSupabase ? "Supabase" : "Memory"} ok={hasSupabase} />
              <StatusTile icon={LockKeyhole} label="Admin auth" value={admin.hasAdminPassword ? "Env" : "Local"} ok={admin.hasAdminPassword} />
            </div>

            <Separator />

            <div className="grid gap-2">
              {checks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center justify-between rounded-md border border-border/70 bg-secondary/35 px-3 py-2"
                >
                  <span className="font-mono text-xs text-muted-foreground">{check.label}</span>
                  <Badge
                    variant="outline"
                    className={
                      check.ok
                        ? "rounded-sm border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "rounded-sm border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }
                  >
                    {check.ok ? "Set" : "Missing"}
                  </Badge>
                </div>
              ))}
            </div>

            {admin.devFallbackEnabled ? (
              <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Local fallback credentials are active. Set ADMIN_PASSWORD and AUTH_SECRET before Railway deployment.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusTile({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof Server
  label: string
  value: string
  ok: boolean
}) {
  return (
    <div className="rounded-md border border-border/70 bg-secondary/35 p-3">
      <div className="flex items-center justify-between">
        <Icon className={ok ? "h-4 w-4 text-emerald-300" : "h-4 w-4 text-amber-300"} />
        {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}
