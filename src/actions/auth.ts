"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isInviteCodeValid } from "@/lib/auth/invite-code";
import {
  createSignedSessionValue,
  inviteSessionCookie,
  SESSION_COOKIE,
} from "@/lib/auth/session";

export type LoginState = {
  error?: string;
};

export async function loginWithInviteCode(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const inviteCode = String(formData.get("inviteCode") || "").trim();

  if (!inviteCode) {
    return { error: "초대코드를 입력해줘." };
  }

  if (!isInviteCodeValid(inviteCode)) {
    return { error: "초대코드가 올바르지 않아." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await createSignedSessionValue(), inviteSessionCookie);
  redirect("/board");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
