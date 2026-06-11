import "server-only";

import { cache } from "react";
import type {
  MarketplaceProductId,
  MarketplaceProductType,
} from "@/domain/marketplace";
import { marketplaceProductIdSchema } from "@/domain/marketplace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PlayerMarketplaceProduct = {
  id: MarketplaceProductId;
  productType: MarketplaceProductType;
  name: string;
  description: string;
  price: number;
  assetPath: string;
  isOwned: boolean;
  acquiredAt: string | null;
};

export type PlayerMarketplace =
  | {
      status: "ready";
      walletBalance: number;
      products: PlayerMarketplaceProduct[];
    }
  | {
      status: "error";
      message: string;
    };

type MarketplaceProductRow = {
  id: string;
  product_type: string;
  name: string;
  description: string;
  price: number;
  asset_path: string;
};

type PlayerProductRow = {
  product_id: string;
  acquired_at: string;
};

export const getPlayerMarketplace = cache(
  async (playerId: string): Promise<PlayerMarketplace> => {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return {
        status: "error",
        message:
          "Supabase is not configured yet. Add the local environment variables before opening the marketplace.",
      };
    }

    const [productsResult, ownedResult, walletResult] = await Promise.all([
      supabase
        .from("marketplace_products")
        .select("id, product_type, name, description, price, asset_path")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("player_products")
        .select("product_id, acquired_at")
        .eq("player_id", playerId),
      supabase
        .from("wallets")
        .select("balance")
        .eq("player_id", playerId)
        .maybeSingle(),
    ]);

    if (productsResult.error || ownedResult.error || walletResult.error) {
      return {
        status: "error",
        message:
          "Could not load the marketplace. Apply the marketplace database migration and refresh.",
      };
    }

    const ownedById = new Map(
      ((ownedResult.data ?? []) as PlayerProductRow[]).map((row) => [
        row.product_id,
        row.acquired_at,
      ]),
    );

    const products = ((productsResult.data ?? []) as MarketplaceProductRow[])
      .map((row) => {
        const productIdResult = marketplaceProductIdSchema.safeParse(row.id);

        if (!productIdResult.success || row.product_type !== "room") {
          return null;
        }

        return {
          id: productIdResult.data,
          productType: "room" as const,
          name: row.name,
          description: row.description,
          price: row.price,
          assetPath: row.asset_path,
          isOwned: ownedById.has(row.id),
          acquiredAt: ownedById.get(row.id) ?? null,
        };
      })
      .filter((product): product is PlayerMarketplaceProduct => Boolean(product));

    return {
      status: "ready",
      walletBalance: walletResult.data?.balance ?? 0,
      products,
    };
  },
);
