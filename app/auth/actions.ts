"use server"

import { redirect } from "next/navigation"

import {
  authenticateEmailUser,
  createEmailUser,
  createSessionCookie,
  deleteCurrentSession,
  isAuthInputError,
} from "@/lib/auth"

export type AuthFormState = {
  message: string
  fieldErrors?: Record<string, string>
}

function safeNextPath(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value.trim() : ""
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\") || next.includes("://")) {
    return "/"
  }

  return next
}

export async function signupAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  let userId: string

  try {
    userId = createEmailUser({
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      plan: "free",
    })
    await createSessionCookie(userId, true)
  } catch (error) {
    if (isAuthInputError(error)) {
      return {
        message: error.message,
        fieldErrors: error.fieldErrors,
      }
    }

    throw error
  }

  redirect(safeNextPath(formData.get("next")))
}

export async function loginAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  let userId: string

  try {
    userId = authenticateEmailUser({
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    })
    await createSessionCookie(userId, formData.get("remember") === "yes")
  } catch (error) {
    if (isAuthInputError(error)) {
      return {
        message: error.message,
        fieldErrors: error.fieldErrors,
      }
    }

    throw error
  }

  redirect(safeNextPath(formData.get("next")))
}

export async function logoutAction() {
  await deleteCurrentSession()
  redirect("/")
}
