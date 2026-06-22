import { NextResponse, type NextRequest } from "next/server"

type LocaleCode = "ko" | "en" | "ja" | "es" | "pt-br"

const LOCALE_COOKIE = "pigma-locale"
const LEGACY_HOSTS = new Set(["oy-tools-production.up.railway.app"])
const CANONICAL_HOST = "pigerplugin.com"
const LOCALE_PATHS: Record<LocaleCode, string> = {
  ko: "/",
  en: "/en",
  ja: "/ja",
  es: "/es",
  "pt-br": "/pt-br",
}
const SUPPORTED_LOCALES = Object.keys(LOCALE_PATHS) as LocaleCode[]
const FIXED_LOCALE_PATHS: Record<string, LocaleCode> = {
  "/psd-export": "en",
  "/psd-converter": "ko",
}

export function middleware(request: NextRequest) {
  const canonicalRedirect = redirectLegacyHost(request)
  if (canonicalRedirect) {
    return canonicalRedirect
  }

  const selectedLocale = normalizeLocale(request.nextUrl.searchParams.get("lang"))
  if (selectedLocale) {
    const pathname = shouldUseLocaleHomePath(request.nextUrl.pathname)
      ? LOCALE_PATHS[selectedLocale]
      : request.nextUrl.pathname
    return redirectWithLocale(request, selectedLocale, pathname, true)
  }

  const pathLocale = request.nextUrl.pathname === "/" ? null : getLocaleFromPath(request.nextUrl.pathname)
  if (pathLocale) {
    return nextWithLocale(request, pathLocale)
  }

  const fixedLocale = FIXED_LOCALE_PATHS[request.nextUrl.pathname]
  if (fixedLocale) {
    return nextWithLocale(request, fixedLocale)
  }

  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value)
  const browserLocale = cookieLocale || pickLocaleFromAcceptLanguage(request.headers.get("accept-language"))
  if (request.nextUrl.pathname !== "/") {
    return nextWithLocale(request, browserLocale)
  }

  return redirectWithLocale(request, browserLocale, LOCALE_PATHS[browserLocale], false)
}

function redirectLegacyHost(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase()
  if (!host || !LEGACY_HOSTS.has(host)) {
    return null
  }

  const url = request.nextUrl.clone()
  url.protocol = "https:"
  url.hostname = CANONICAL_HOST
  url.port = ""
  return NextResponse.redirect(url, 301)
}

function redirectWithLocale(request: NextRequest, locale: LocaleCode, pathname: string, cleanLangParam: boolean) {
  const url = request.nextUrl.clone()
  url.pathname = pathname

  if (cleanLangParam) {
    url.searchParams.delete("lang")
  }

  if (url.pathname === request.nextUrl.pathname && url.search === request.nextUrl.search) {
    return nextWithLocale(request, locale)
  }

  const response = NextResponse.redirect(url, 307)
  setLocaleCookie(response, locale)
  return response
}

function nextWithLocale(request: NextRequest, locale: LocaleCode) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pigma-locale", locale)
  requestHeaders.set("x-pigma-route-path", request.nextUrl.pathname)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  setLocaleCookie(response, locale)
  return response
}

function setLocaleCookie(response: NextResponse, locale: LocaleCode) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  })
}

function getLocaleFromPath(pathname: string): LocaleCode | null {
  return SUPPORTED_LOCALES.find((locale) => LOCALE_PATHS[locale] === pathname) || null
}

function shouldUseLocaleHomePath(pathname: string) {
  return pathname === "/" || getLocaleFromPath(pathname) !== null
}

function pickLocaleFromAcceptLanguage(header: string | null): LocaleCode {
  if (!header) {
    return "en"
  }

  const preferredLanguages = header
    .split(",")
    .map((part) => {
      const [tag = "", qValue = "q=1"] = part.trim().split(";")
      const quality = Number.parseFloat(qValue.replace("q=", ""))
      return { tag: tag.toLowerCase(), quality: Number.isFinite(quality) ? quality : 1 }
    })
    .filter(({ tag }) => tag.length > 0)
    .sort((a, b) => b.quality - a.quality)

  for (const { tag } of preferredLanguages) {
    const locale = normalizeLocale(tag)
    if (locale) {
      return locale
    }
  }

  return "en"
}

function normalizeLocale(value: string | undefined | null): LocaleCode | null {
  const locale = value?.toLowerCase().replace("_", "-")
  if (!locale) {
    return null
  }

  if (locale === "ko" || locale.startsWith("ko-")) {
    return "ko"
  }

  if (locale === "ja" || locale.startsWith("ja-")) {
    return "ja"
  }

  if (locale === "es" || locale.startsWith("es-")) {
    return "es"
  }

  if (locale === "pt" || locale.startsWith("pt-")) {
    return "pt-br"
  }

  if (locale === "en" || locale.startsWith("en-")) {
    return "en"
  }

  return null
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|fonts|favicon.ico|icon.png|icon.svg|apple-icon.png|opengraph-image|manifest.webmanifest|robots.txt|sitemap.xml|google.*\\.html).*)",
  ],
}
