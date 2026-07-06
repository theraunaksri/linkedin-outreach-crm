"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VIEW_COOKIE, EDIT_COOKIE, tokenFor } from "@/lib/auth";

export async function loginView(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  const viewPassword = process.env.OPIKA_VIEW_PASSWORD;

  if (!viewPassword || password !== viewPassword) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const store = await cookies();
  store.set(VIEW_COOKIE, tokenFor(viewPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next || "/");
}

export async function unlockEditing(password: string): Promise<{ ok: boolean }> {
  const editPassword = process.env.OPIKA_EDIT_PASSWORD;
  if (!editPassword || password !== editPassword) {
    return { ok: false };
  }

  const store = await cookies();
  store.set(EDIT_COOKIE, tokenFor(editPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { ok: true };
}

export async function lockEditing() {
  const store = await cookies();
  store.delete(EDIT_COOKIE);
}
