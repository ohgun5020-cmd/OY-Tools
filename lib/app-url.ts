function normalizeAppUrl(value: string) {
  const url = value.trim().replace(/\/+$/, "")
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `https://${url}`
}

function isLocalAppUrl(value: string) {
  try {
    const hostname = new URL(value).hostname
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]"
  } catch {
    return false
  }
}

function getConfiguredAppUrl(value: string | undefined) {
  if (!value) {
    return null
  }

  const appUrl = normalizeAppUrl(value)
  if (process.env.NODE_ENV === "production" && isLocalAppUrl(appUrl)) {
    return null
  }

  return appUrl
}

function getForwardedOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  if (!host) {
    return null
  }

  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https"
  return `${proto}://${host}`
}

export function getAppUrl(request?: Request) {
  const publicAppUrl = getConfiguredAppUrl(process.env.NEXT_PUBLIC_APP_URL)
  if (publicAppUrl) {
    return publicAppUrl
  }

  const appUrl = getConfiguredAppUrl(process.env.APP_URL)
  if (appUrl) {
    return appUrl
  }

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return normalizeAppUrl(process.env.RAILWAY_PUBLIC_DOMAIN)
  }

  if (request) {
    const forwardedOrigin = getForwardedOrigin(request)
    if (forwardedOrigin) {
      return normalizeAppUrl(forwardedOrigin)
    }

    return new URL(request.url).origin
  }

  return "http://localhost:3000"
}
