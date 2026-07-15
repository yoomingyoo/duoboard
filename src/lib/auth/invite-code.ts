export function getInviteCode() {
  return process.env.INVITE_CODE || "DUOBOARD-2026";
}

export function isInviteCodeValid(value: string) {
  return value.trim() === getInviteCode().trim();
}
