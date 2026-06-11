import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  groupPublicOwnedProductsByCategory,
  type PublicOwnedProduct,
  type PublicOwnedProductCategory,
} from "@/domain/marketplace";
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

export type PublicPlayerProfile = {
  profile: {
    id: string;
    username: string;
    display_name: string;
    bio: string | null;
  };
  avatar: {
    id: string;
    base_type: string;
  } | null;
  ownedItemCategories: PublicOwnedProductCategory[];
};

type PlayerProductRow = {
  product_id: string;
  acquired_at: string;
};

type MarketplaceProductRow = {
  id: string;
  product_type: string;
  name: string;
  description: string;
  asset_path: string;
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

export async function getPublicProfileByUsername(
  username: string,
): Promise<PublicPlayerProfile | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const normalizedUsername = username.trim().toLowerCase();

  const profileResult = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    return null;
  }

  const avatarResult = await supabase
    .from("avatars")
    .select("id, base_type")
    .eq("player_id", profileResult.data.id)
    .maybeSingle();

  const ownedProductsResult = await supabase
    .from("player_products")
    .select("product_id, acquired_at")
    .eq("player_id", profileResult.data.id);

  let ownedItemCategories: PublicOwnedProductCategory[] = [];

  if (!ownedProductsResult.error && ownedProductsResult.data?.length) {
    const ownedRows = ownedProductsResult.data as PlayerProductRow[];
    const acquiredByProductId = new Map(
      ownedRows.map((row) => [row.product_id, row.acquired_at]),
    );
    const productIds = Array.from(acquiredByProductId.keys());

    const productsResult = await supabase
      .from("marketplace_products")
      .select("id, product_type, name, description, asset_path")
      .eq("is_active", true)
      .in("id", productIds);

    if (!productsResult.error && productsResult.data?.length) {
      const ownedProducts = (productsResult.data as MarketplaceProductRow[])
        .map(
          (product): PublicOwnedProduct => ({
            id: product.id,
            productType: product.product_type,
            name: product.name,
            description: product.description,
            assetPath: product.asset_path,
            acquiredAt: acquiredByProductId.get(product.id) ?? null,
          }),
        )
        .toSorted((a, b) => {
          const categoryComparison = a.productType.localeCompare(b.productType);

          if (categoryComparison !== 0) {
            return categoryComparison;
          }

          return a.name.localeCompare(b.name);
        });

      ownedItemCategories = groupPublicOwnedProductsByCategory(ownedProducts);
    }
  }

  return {
    profile: profileResult.data,
    avatar: avatarResult.data ?? null,
    ownedItemCategories,
  };
}
