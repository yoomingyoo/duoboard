"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE = "duoboard-session";

export async function setInviteSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "pending", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearInviteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
