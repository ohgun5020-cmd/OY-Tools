"use client"

import { useMemo, useState } from "react"

import type { NoticeItem, NoticePayload, NoticeSeverity, NoticeType } from "@/lib/notices"

type NoticeAdminClientProps = {
  initialPayload: NoticePayload
  noticePublicUrl: string
}

const noticeTypes: NoticeType[] = ["release", "update", "notice", "maintenance"]
const noticeSeverities: NoticeSeverity[] = ["info", "success", "warning", "critical"]

function createNoticeDraft(): NoticeItem {
  const timestamp = new Date().toISOString()
  const compactTimestamp = timestamp.replace(/\D/g, "").slice(0, 17)
  return {
    id: `notice-${compactTimestamp}`,
    type: "release",
    severity: "success",
    title: "Pigma update",
    body: "A short release note for Pigma users.",
    bullets: ["Write one clear change per line.", "Keep notices short and friendly."],
    publishedAt: timestamp,
    visible: true,
  }
}

function normalizePayload(payload: NoticePayload): NoticePayload {
  return {
    schemaVersion: 1,
    updatedAt: payload.updatedAt || new Date().toISOString(),
    defaultLocale: payload.defaultLocale || "en",
    items: Array.isArray(payload.items) ? payload.items : [],
  }
}

function toLocalDateTime(value: string) {
  const date = new Date(value || "")
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 16)
  }
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16)
}

function fromLocalDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function hasVisibleNoticeContent(payload: NoticePayload) {
  return payload.items.some(
    (item) =>
      item.visible !== false &&
      (item.title.trim() || item.body.trim() || item.bullets.some((bullet) => bullet.trim())),
  )
}

export default function NoticeAdminClient({ initialPayload, noticePublicUrl }: NoticeAdminClientProps) {
  const [payload, setPayload] = useState<NoticePayload>(() => normalizePayload(initialPayload))
  const [selectedId, setSelectedId] = useState(() => initialPayload.items[0]?.id || "")
  const [status, setStatus] = useState("Notices are ready to edit.")
  const [isSaving, setIsSaving] = useState(false)

  const selectedItem = useMemo(
    () => payload.items.find((item) => item.id === selectedId) || payload.items[0] || null,
    [payload.items, selectedId],
  )

  function updateItem(id: string, next: Partial<NoticeItem>) {
    setPayload((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...next } : item)),
    }))
  }

  function addNotice() {
    const draft = createNoticeDraft()
    setPayload((current) => ({ ...current, items: [draft, ...current.items] }))
    setSelectedId(draft.id)
    setStatus("New notice draft added.")
  }

  function deleteNotice(id: string) {
    const nextItems = payload.items.filter((item) => item.id !== id)
    setPayload((current) => {
      return { ...current, items: current.items.filter((item) => item.id !== id) }
    })
    setSelectedId(nextItems[0]?.id || "")
    setStatus("Notice removed locally. Press Save to publish.")
  }

  function saveNotices() {
    if (!hasVisibleNoticeContent(payload) && !window.confirm("Publish with no visible notices? This will hide the notice list in the plugin.")) {
      setStatus("Empty publish cancelled.")
      return
    }
    setIsSaving(true)
    setStatus("Publishing notices to R2...")
    void (async () => {
      try {
        const response = await fetch("/api/admin/notices", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = (await response.json().catch(() => null)) as { payload?: NoticePayload; error?: string } | null
        if (!response.ok || !data?.payload) {
          throw new Error(data?.error || `Notice publish failed with ${response.status}.`)
        }
        setPayload(normalizePayload(data.payload))
        setSelectedId(data.payload.items[0]?.id || "")
        setStatus("Published. Plugin users will see it after refresh or cache expiry.")
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Notice publish failed.")
      } finally {
        setIsSaving(false)
      }
    })()
  }

  return (
    <section className="mt-6 rounded-3xl bg-white p-7 shadow-[0_18px_44px_rgba(15,24,42,0.06)] ring-1 ring-[#e7ecf3]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-[#005bff]">NOTICE CENTER</p>
          <h2 className="mt-2 text-[28px] font-black leading-tight">Release notes</h2>
          <p className="mt-2 max-w-[620px] text-sm font-bold leading-6 text-[#60656b]">
            Same JSON format for the website, plugin admin panel, and Codex uploads. Keep the default copy in English,
            then add locale variants when needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addNotice}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d9e3f0] bg-white px-4 text-sm font-black text-[#152033] transition hover:-translate-y-0.5"
          >
            Add notice
          </button>
          <button
            type="button"
            onClick={saveNotices}
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#005bff] px-4 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save to R2"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#e1e9f4] bg-[#f8fbff] p-4 text-xs font-bold leading-5 text-[#5e6a78]">
        Public JSON:{" "}
        <a className="text-[#005bff] underline-offset-4 hover:underline" href={noticePublicUrl} target="_blank" rel="noreferrer">
          {noticePublicUrl}
        </a>
        <br />
        Status: {status}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="grid content-start gap-2">
          {payload.items.length ? (
            payload.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedItem?.id === item.id
                    ? "border-[#005bff] bg-[#f0f6ff]"
                    : "border-[#e3ebf5] bg-white hover:border-[#b8c8dc]"
                }`}
              >
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7d8aa0]">{item.type}</span>
                <strong className="mt-1 block truncate text-sm font-black text-[#111827]">{item.title || "Untitled notice"}</strong>
                <span className="mt-1 block text-xs font-bold text-[#7d8aa0]">{item.visible ? "Visible" : "Hidden"}</span>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#c8d5e6] p-4 text-sm font-bold text-[#758396]">
              No notices yet.
            </div>
          )}
        </aside>

        {selectedItem ? (
          <div className="grid gap-4 rounded-3xl border border-[#e3ebf5] bg-[#fbfdff] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-black tracking-[0.12em] text-[#7a828b]">
                ID
                <input
                  value={selectedItem.id}
                  onChange={(event) => {
                    const nextId = event.target.value
                    const previousId = selectedItem.id
                    updateItem(previousId, { id: nextId })
                    setSelectedId(nextId)
                  }}
                  className="h-11 rounded-xl border border-[#dfe6ef] bg-white px-3 text-sm font-bold normal-case text-[#111827] outline-none focus:border-[#005bff]"
                />
              </label>
              <label className="grid gap-2 text-xs font-black tracking-[0.12em] text-[#7a828b]">
                Published
                <input
                  type="datetime-local"
                  value={toLocalDateTime(selectedItem.publishedAt)}
                  onChange={(event) => updateItem(selectedItem.id, { publishedAt: fromLocalDateTime(event.target.value) })}
                  className="h-11 rounded-xl border border-[#dfe6ef] bg-white px-3 text-sm font-bold normal-case text-[#111827] outline-none focus:border-[#005bff]"
                />
              </label>
              <label className="grid gap-2 text-xs font-black tracking-[0.12em] text-[#7a828b]">
                Type
                <select
                  value={selectedItem.type}
                  onChange={(event) => updateItem(selectedItem.id, { type: event.target.value as NoticeType })}
                  className="h-11 rounded-xl border border-[#dfe6ef] bg-white px-3 text-sm font-black normal-case text-[#111827] outline-none focus:border-[#005bff]"
                >
                  {noticeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-xs font-black tracking-[0.12em] text-[#7a828b]">
                Severity
                <select
                  value={selectedItem.severity}
                  onChange={(event) => updateItem(selectedItem.id, { severity: event.target.value as NoticeSeverity })}
                  className="h-11 rounded-xl border border-[#dfe6ef] bg-white px-3 text-sm font-black normal-case text-[#111827] outline-none focus:border-[#005bff]"
                >
                  {noticeSeverities.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-xs font-black tracking-[0.12em] text-[#7a828b]">
              Title
              <input
                value={selectedItem.title}
                onChange={(event) => updateItem(selectedItem.id, { title: event.target.value })}
                className="h-11 rounded-xl border border-[#dfe6ef] bg-white px-3 text-sm font-bold normal-case text-[#111827] outline-none focus:border-[#005bff]"
              />
            </label>

            <label className="grid gap-2 text-xs font-black tracking-[0.12em] text-[#7a828b]">
              Body
              <textarea
                value={selectedItem.body}
                onChange={(event) => updateItem(selectedItem.id, { body: event.target.value })}
                rows={3}
                className="rounded-xl border border-[#dfe6ef] bg-white px-3 py-3 text-sm font-bold leading-6 normal-case text-[#111827] outline-none focus:border-[#005bff]"
              />
            </label>

            <label className="grid gap-2 text-xs font-black tracking-[0.12em] text-[#7a828b]">
              Bullets, one per line
              <textarea
                value={selectedItem.bullets.join("\n")}
                onChange={(event) => updateItem(selectedItem.id, { bullets: event.target.value.split(/\r?\n/).filter(Boolean) })}
                rows={4}
                className="rounded-xl border border-[#dfe6ef] bg-white px-3 py-3 text-sm font-bold leading-6 normal-case text-[#111827] outline-none focus:border-[#005bff]"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-black text-[#152033]">
                <input
                  type="checkbox"
                  checked={selectedItem.visible}
                  onChange={(event) => updateItem(selectedItem.id, { visible: event.target.checked })}
                  className="size-4"
                />
                Visible in plugin
              </label>
              <button
                type="button"
                onClick={() => deleteNotice(selectedItem.id)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#ffd2d2] bg-[#fff7f7] px-4 text-sm font-black text-[#c22f2f]"
              >
                Delete notice
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#c8d5e6] bg-[#fbfdff] p-6 text-sm font-bold text-[#758396]">
            Add a notice to start editing.
          </div>
        )}
      </div>
    </section>
  )
}
