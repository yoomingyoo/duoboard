"use client";

import { useActionState } from "react";
import { loginWithInviteCode, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

export function InviteCodeForm() {
  const [state, formAction, pending] = useActionState(loginWithInviteCode, initialState);

  return (
    <form className="login-form" action={formAction}>
      <label>
        <span>초대코드</span>
        <input className="input" name="inviteCode" placeholder="예: DUOBOARD-2026" />
      </label>
      {state.error ? <p className="error-text">{state.error}</p> : null}
      <button className="primary-button" disabled={pending} type="submit">
        {pending ? "확인 중..." : "입장하기"}
      </button>
    </form>
  );
}
