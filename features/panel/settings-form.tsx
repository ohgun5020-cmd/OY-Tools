"use client"

import { useState } from "react"
import { Check, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PanelSettings } from "@/types/panel"

export function SettingsForm({ settings }: { settings: PanelSettings }) {
  const [marginRate, setMarginRate] = useState(String(settings.marginRate))
  const [currency, setCurrency] = useState(settings.currency)
  const [defaultPlatform, setDefaultPlatform] = useState(settings.defaultPlatform)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    setIsSaving(true)

    const response = await fetch("/api/panel/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marginRate: Number(marginRate),
        currency,
        defaultPlatform,
      }),
    })

    setIsSaving(false)
    setSaved(response.ok)
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="marginRate">Internal margin rate (%)</Label>
        <Input
          id="marginRate"
          type="number"
          min="0"
          step="0.1"
          value={marginRate}
          onChange={(event) => setMarginRate(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label>Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger>
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="KRW">KRW</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Default platform</Label>
        <Select value={defaultPlatform} onValueChange={setDefaultPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="TikTok">TikTok</SelectItem>
            <SelectItem value="YouTube">YouTube</SelectItem>
            <SelectItem value="Facebook">Facebook</SelectItem>
            <SelectItem value="X">X</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" className="gap-2" disabled={isSaving}>
          <Save className="h-4 w-4" />
          Save settings
        </Button>
        {saved ? (
          <span className="flex items-center gap-1 text-sm text-emerald-300">
            <Check className="h-4 w-4" />
            Saved
          </span>
        ) : null}
      </div>
    </form>
  )
}
