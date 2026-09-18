"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_SESSION_COOKIE_NAME, DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionCookieValue, isValidToken } from "../../lib/ui-auth/session.js"

export type LoginResult = {
    success: boolean
    error?: string
}

export async function login(formData: FormData): Promise<LoginResult> {
    const token = formData.get("token")

    if (typeof token !== "string" || token === "") {
        return { success: false, error: "Token é obrigatório" }
    }

    if (!isValidToken(token)) {
        return { success: false, error: "Token inválido" }
    }

    const sessionValue = createAdminSessionCookieValue()
    const cookieStore = await cookies()

    cookieStore.set(ADMIN_SESSION_COOKIE_NAME, sessionValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS,
    })

    redirect("/admin")
}

export async function logout(): Promise<void> {
    const cookieStore = await cookies()

    cookieStore.set(ADMIN_SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    })

    redirect("/login")
}
