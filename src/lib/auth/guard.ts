import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySignedSessionValue } from "@/lib/auth/session";

export async function requireInviteSession() {
  const cookieStore = await cookies();
  const session = await verifySignedSessionValue(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/login");
  }

  return session;
}
