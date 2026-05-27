function normalizeAppUrl(value: string) {
  const url = value.trim().replace(/\/+$/, "")
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `https://${url}`
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
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL)
  }

  if (process.env.APP_URL) {
    return normalizeAppUrl(process.env.APP_URL)
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
