import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getAppUrl } from "@/lib/app-url"
import { createSessionCookie, upsertGoogleUser, type GoogleProfile } from "@/lib/auth"

export const runtime = "nodejs"

const stateCookie = "pigma_oauth_state"
const modeCookie = "pigma_oauth_mode"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const cookieStore = await cookies()
  const expectedState = cookieStore.get(stateCookie)?.value
  const mode = cookieStore.get(modeCookie)?.value === "signup" ? "signup" : "login"

  cookieStore.delete(stateCookie)
  cookieStore.delete(modeCookie)

  if (!code || !state || !expectedState || state !== expectedState) {
    redirect(`/${mode}?error=google-auth`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    redirect(`/${mode}?error=google-unconfigured`)
  }

  const redirectUri = `${getAppUrl(request)}/auth/google/callback`
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    redirect(`/${mode}?error=google-auth`)
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string }
  if (!tokenData.access_token) {
    redirect(`/${mode}?error=google-auth`)
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  })

  if (!profileResponse.ok) {
    redirect(`/${mode}?error=google-auth`)
  }

  const profile = (await profileResponse.json()) as GoogleProfile
  const userId = upsertGoogleUser(profile)
  await createSessionCookie(userId, true)

  redirect("/")
}
