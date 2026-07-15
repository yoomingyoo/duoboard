const SESSION_COOKIE = "duoboard-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function getSessionSecret() {
  return process.env.SESSION_SECRET || "dev-session-secret-change-me";
}

async function importSessionKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function encodeBase64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

async function signPayload(payload: string) {
  const key = await importSessionKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Buffer.from(sig).toString("base64url");
}

export type InviteSession = {
  issuedAt: number;
  invite: "ok";
};

export async function createSignedSessionValue() {
  const payload = encodeBase64Url(
    JSON.stringify({ invite: "ok", issuedAt: Math.floor(Date.now() / 1000) } satisfies InviteSession),
  );
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export async function verifySignedSessionValue(value?: string | null) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = await signPayload(payload);
  if (signature !== expected) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as InviteSession;
    const now = Math.floor(Date.now() / 1000);
    if (parsed.invite !== "ok" || now - parsed.issuedAt > SESSION_TTL_SECONDS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const inviteSessionCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
