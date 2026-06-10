import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { OpeningRouteState } from "@/domain/opening-routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlayerAccount = {
  user: User;
  profile: {
    id: string;
    username: string;
    display_name: string;
  } | null;
  avatar: {
    id: string;
    base_type: string;
  } | null;
  wallet: {
    balance: number;
  } | null;
};

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
});

export async function requireCurrentUser(redirectTo = "/") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return user;
}

export const getPlayerAccount = cache(async (): Promise<PlayerAccount | null> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [profileResult, avatarResult, walletResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("avatars")
      .select("id, base_type")
      .eq("player_id", user.id)
      .maybeSingle(),
    supabase
      .from("wallets")
      .select("balance")
      .eq("player_id", user.id)
      .maybeSingle(),
  ]);

  return {
    user,
    profile: profileResult.data ?? null,
    avatar: avatarResult.data ?? null,
    wallet: walletResult.data ?? null,
  };
});

export async function getOpeningRouteState(): Promise<OpeningRouteState> {
  const account = await getPlayerAccount();

  return {
    isSignedIn: Boolean(account?.user),
    hasAvatar: Boolean(account?.avatar),
  };
}
