import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySignedSessionValue } from "@/lib/auth/session";

export async function hasValidApiInviteSession() {
  const cookieStore = await cookies();
  const session = await verifySignedSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  return Boolean(session);
}
