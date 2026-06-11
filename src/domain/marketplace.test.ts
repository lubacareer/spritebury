import { describe, expect, it } from "vitest";
import {
  getMarketplaceProduct,
  getMarketplaceProductCardStates,
  getMarketplaceCategoryLabel,
  getMarketplaceStarterRoomTotal,
  groupPublicOwnedProductsByCategory,
  marketplaceProductIdSchema,
  marketplaceProducts,
} from "./marketplace";

describe("marketplaceProducts", () => {
  it("defines the three starter room products", () => {
    expect(marketplaceProducts.map((product) => product.id)).toEqual([
      "room_livingroom",
      "room_bedroom",
      "room_bathroom",
    ]);
    expect(marketplaceProducts.every((product) => product.productType === "room"))
      .toBe(true);
  });

  it("keeps starter room prices within the default starter wallet", () => {
    expect(getMarketplaceStarterRoomTotal()).toBeLessThanOrEqual(250);
  });

  it("validates and looks up known product ids", () => {
    expect(marketplaceProductIdSchema.parse("room_bedroom")).toBe(
      "room_bedroom",
    );
    expect(getMarketplaceProduct("room_bedroom")?.assetPath).toBe(
      "/assets/bedroom.png",
    );
  });

  it("rejects unknown product ids", () => {
    expect(() => marketplaceProductIdSchema.parse("admin_item")).toThrow();
    expect(getMarketplaceProduct("admin_item")).toBeNull();
  });

  it("marks owned products for card rendering", () => {
    const cards = getMarketplaceProductCardStates([
      "room_livingroom",
      "room_bathroom",
    ]);

    expect(cards.map((card) => [card.id, card.isOwned])).toEqual([
      ["room_livingroom", true],
      ["room_bedroom", false],
      ["room_bathroom", true],
    ]);
  });
});

describe("public owned product grouping", () => {
  it("uses a friendly category label for rooms", () => {
    expect(getMarketplaceCategoryLabel("room")).toBe("Rooms");
  });

  it("groups owned products by category", () => {
    const categories = groupPublicOwnedProductsByCategory([
      {
        id: "room_livingroom",
        productType: "room",
        name: "Living Room",
        description: "A cozy room.",
        assetPath: "/assets/livingroom.png",
        acquiredAt: "2026-06-11T00:00:00.000Z",
      },
      {
        id: "hat_blue",
        productType: "hat",
        name: "Blue Hat",
        description: "A blue hat.",
        assetPath: "/assets/hat.png",
        acquiredAt: "2026-06-11T00:00:00.000Z",
      },
    ]);

    expect(categories).toEqual([
      {
        productType: "room",
        label: "Rooms",
        items: [
          expect.objectContaining({
            id: "room_livingroom",
          }),
        ],
      },
      {
        productType: "hat",
        label: "Hats",
        items: [
          expect.objectContaining({
            id: "hat_blue",
          }),
        ],
      },
    ]);
  });

  it("returns no categories for an empty collection", () => {
    expect(groupPublicOwnedProductsByCategory([])).toEqual([]);
  });
});
