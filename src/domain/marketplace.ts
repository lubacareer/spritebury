import { z } from "zod";

export const marketplaceProductIds = [
  "room_livingroom",
  "room_bedroom",
  "room_bathroom",
] as const;

export type MarketplaceProductId = (typeof marketplaceProductIds)[number];

export type MarketplaceProductType = "room";

export type MarketplaceProductDefinition = {
  id: MarketplaceProductId;
  productType: MarketplaceProductType;
  name: string;
  description: string;
  price: number;
  assetPath: string;
};

export type MarketplaceProductCardState = MarketplaceProductDefinition & {
  isOwned: boolean;
};

export type PublicOwnedProduct = {
  id: string;
  productType: string;
  name: string;
  description: string;
  assetPath: string;
  acquiredAt: string | null;
};

export type PublicOwnedProductCategory = {
  productType: string;
  label: string;
  items: PublicOwnedProduct[];
};

export const marketplaceProductIdSchema = z.enum(marketplaceProductIds);

export const marketplaceProducts: MarketplaceProductDefinition[] = [
  {
    id: "room_livingroom",
    productType: "room",
    name: "Living Room",
    description: "A cozy starter room with a couch, plants, and shelves.",
    price: 80,
    assetPath: "/assets/livingroom.png",
  },
  {
    id: "room_bedroom",
    productType: "room",
    name: "Bedroom",
    description: "A calm bedroom with a soft bed, dresser, and mirror.",
    price: 90,
    assetPath: "/assets/bedroom.png",
  },
  {
    id: "room_bathroom",
    productType: "room",
    name: "Bathroom",
    description: "A bright tiled bathroom with a tub, sink, and cabinet.",
    price: 70,
    assetPath: "/assets/bathroom.png",
  },
];

export function getMarketplaceProduct(productId: string | null | undefined) {
  return (
    marketplaceProducts.find((product) => product.id === productId) ?? null
  );
}

export function getMarketplaceProductCardStates(
  ownedProductIds: Iterable<string>,
): MarketplaceProductCardState[] {
  const ownedSet = new Set(ownedProductIds);

  return marketplaceProducts.map((product) => ({
    ...product,
    isOwned: ownedSet.has(product.id),
  }));
}

export function getMarketplaceStarterRoomTotal() {
  return marketplaceProducts.reduce((total, product) => total + product.price, 0);
}

export function getMarketplaceCategoryLabel(productType: string) {
  if (productType === "room") {
    return "Rooms";
  }

  const title = productType
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return title ? `${title}s` : "Items";
}

export function groupPublicOwnedProductsByCategory(
  products: PublicOwnedProduct[],
): PublicOwnedProductCategory[] {
  const grouped = new Map<string, PublicOwnedProduct[]>();

  for (const product of products) {
    const items = grouped.get(product.productType) ?? [];
    items.push(product);
    grouped.set(product.productType, items);
  }

  return Array.from(grouped.entries()).map(([productType, items]) => ({
    productType,
    label: getMarketplaceCategoryLabel(productType),
    items,
  }));
}
