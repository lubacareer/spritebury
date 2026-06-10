"use client";

import { useActionState } from "react";
import { requestEmailOtp } from "@/features/auth/actions";
import { initialLoginActionState } from "@/features/auth/state";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, action, pending] = useActionState(
    requestEmailOtp,
    initialLoginActionState,
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-bold uppercase tracking-wide text-[#553019]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border-4 border-[#5b351d] bg-[#fff9d8] px-4 py-3 text-lg font-semibold text-[#2c1b12] outline-none focus:border-[#1368ae] focus:ring-4 focus:ring-[#80c7ff]"
          placeholder="player@example.com"
        />
        {state.errors?.email ? (
          <p className="text-sm font-semibold text-[#9d1d1d]">
            {state.errors.email[0]}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="pixel-button w-full rounded-md bg-[#2f95df] px-5 py-3 text-lg font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send Magic Link"}
      </button>
      {state.message ? (
        <p
          className={`rounded-md px-4 py-3 text-sm font-semibold ${
            state.status === "success"
              ? "bg-[#e0f8d3] text-[#245c20]"
              : "bg-[#ffe1d8] text-[#8a2416]"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
