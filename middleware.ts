import { NextResponse, type NextRequest } from "next/server"

type LocaleCode = "ko" | "en" | "ja" | "es" | "pt-br"

const LOCALE_COOKIE = "pigma-locale"
const LOCALE_PATHS: Record<LocaleCode, string> = {
  ko: "/",
  en: "/en",
  ja: "/ja",
  es: "/es",
  "pt-br": "/pt-br",
}
const SUPPORTED_LOCALES = Object.keys(LOCALE_PATHS) as LocaleCode[]

export function middleware(request: NextRequest) {
  const selectedLocale = normalizeLocale(request.nextUrl.searchParams.get("lang"))
  if (selectedLocale) {
    return redirectWithLocale(request, selectedLocale, LOCALE_PATHS[selectedLocale], true)
  }

  const pathLocale = request.nextUrl.pathname === "/" ? null : getLocaleFromPath(request.nextUrl.pathname)
  if (pathLocale) {
    const response = NextResponse.next()
    response.cookies.set(LOCALE_COOKIE, pathLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    })
    return response
  }

  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value)
  const browserLocale = cookieLocale || pickLocaleFromAcceptLanguage(request.headers.get("accept-language"))
  return redirectWithLocale(request, browserLocale, LOCALE_PATHS[browserLocale], false)
}

function redirectWithLocale(request: NextRequest, locale: LocaleCode, pathname: string, cleanLangParam: boolean) {
  const url = request.nextUrl.clone()
  url.pathname = pathname

  if (cleanLangParam) {
    url.searchParams.delete("lang")
  }

  if (url.pathname === request.nextUrl.pathname && url.search === request.nextUrl.search) {
    const response = NextResponse.next()
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    })
    return response
  }

  const response = NextResponse.redirect(url, 307)
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  })
  return response
}

function getLocaleFromPath(pathname: string): LocaleCode | null {
  return SUPPORTED_LOCALES.find((locale) => LOCALE_PATHS[locale] === pathname) || null
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
  matcher: ["/", "/en", "/ja", "/es", "/pt-br"],
}
