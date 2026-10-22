"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Notice, SubmitButton, inputCls } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(login, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-800">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-800">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      <Notice state={state?.error ? { error: state.error } : null} />
      <div className="[&>button]:w-full">
        <SubmitButton pending="Signing in…">Sign in</SubmitButton>
      </div>
    </form>
  );
}
