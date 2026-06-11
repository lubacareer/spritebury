"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getMarketplaceProduct,
  marketplaceProductIdSchema,
} from "@/domain/marketplace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BuyProductActionState } from "@/features/marketplace/state";

function getPurchaseErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("product_already_owned")) {
    return "You already own this room.";
  }

  if (normalized.includes("insufficient_funds")) {
    return "You do not have enough coins for this room.";
  }

  if (normalized.includes("wallet_not_found")) {
    return "Create your avatar first so Spritebury can create your wallet.";
  }

  if (normalized.includes("product_not_found")) {
    return "That room is not available anymore.";
  }

  return "Could not complete the purchase. Please try again.";
}

export async function buyMarketplaceProduct(
  _state: BuyProductActionState,
  formData: FormData,
): Promise<BuyProductActionState> {
  const parsed = marketplaceProductIdSchema.safeParse(
    formData.get("productId"),
  );

  if (!parsed.success) {
    return {
      status: "error",
      message: "That room is not available.",
    };
  }

  const product = getMarketplaceProduct(parsed.data);

  if (!product) {
    return {
      status: "error",
      message: "That room is not available.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message:
        "Supabase is not configured yet. Add the local environment variables before buying a room.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=%2Fmarketplace");
  }

  const { error } = await supabase.rpc("buy_marketplace_product", {
    p_product_id: product.id,
  });

  if (error) {
    return {
      status: "error",
      message: getPurchaseErrorMessage(error.message),
    };
  }

  revalidatePath("/marketplace");
  revalidatePath("/account");
  revalidatePath("/city/town-square");

  return {
    status: "success",
    message: `${product.name} is now in your room collection.`,
  };
}
