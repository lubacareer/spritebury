"use client";

import { useActionState } from "react";
import type { MarketplaceProductId } from "@/domain/marketplace";
import { buyMarketplaceProduct } from "@/features/marketplace/actions";
import { initialBuyProductActionState } from "@/features/marketplace/state";

type BuyProductFormProps = {
  productId: MarketplaceProductId;
  isOwned: boolean;
};

export function BuyProductForm({ productId, isOwned }: BuyProductFormProps) {
  const [state, action, pending] = useActionState(
    buyMarketplaceProduct,
    initialBuyProductActionState,
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={isOwned || pending}
        className="pixel-button w-full rounded-md bg-[#73bd36] px-4 py-3 font-black uppercase text-white disabled:cursor-not-allowed disabled:bg-[#8b7e67] disabled:opacity-70"
      >
        {isOwned ? "Owned" : pending ? "Buying..." : "Buy Room"}
      </button>
      {state.message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm font-semibold ${
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
