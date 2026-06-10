"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { emailOtpSchema, sanitizeRedirectPath } from "@/domain/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LoginActionState } from "@/features/auth/state";

export async function requestEmailOtp(
  _state: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = emailOtpSchema.safeParse({
    email: formData.get("email"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    };
  }

  const redirectTo = sanitizeRedirectPath(parsed.data.redirectTo ?? null);
  const origin =
    (await headers()).get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?redirect=${encodeURIComponent(
        redirectTo,
      )}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "Could not send a login link. Please wait and try again.",
    };
  }

  return {
    status: "success",
    message: "Check your email for a Spritebury login link.",
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
