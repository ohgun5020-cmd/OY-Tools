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

  redirect("/")
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

  redirect("/")
}

export async function logoutAction() {
  await deleteCurrentSession()
  redirect("/")
}
