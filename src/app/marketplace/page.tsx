import Image from "next/image";
import Link from "next/link";
import { BuyProductForm } from "@/features/marketplace/buy-product-form";
import { requireCurrentUser } from "@/lib/auth/dal";
import { getPlayerMarketplace } from "@/lib/marketplace/dal";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const user = await requireCurrentUser("/marketplace");
  const marketplace = await getPlayerMarketplace(user.id);

  return (
    <main className="min-h-dvh bg-[#8bd2f4] px-4 py-8 text-[#2c1b12]">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap gap-4 text-sm font-black uppercase text-[#1368ae]">
          <Link href="/city/town-square">Town Square</Link>
          <Link href="/account">Account</Link>
          <Link href="/">Opening Screen</Link>
        </nav>

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#553019]">
              Spritebury Shop
            </p>
            <h1 className="text-4xl font-black uppercase tracking-wide">
              Marketplace
            </h1>
          </div>
          <div className="pixel-card rounded-md bg-[#fff9d8] px-5 py-3">
            <p className="text-sm font-black uppercase text-[#553019]">Coins</p>
            <p className="text-3xl font-black">
              {marketplace.status === "ready" ? marketplace.walletBalance : 0}
            </p>
          </div>
        </header>

        {marketplace.status === "error" ? (
          <section className="pixel-card mt-7 rounded-md bg-[#fff2b7] p-6">
            <h2 className="text-2xl font-black uppercase">Shop Unavailable</h2>
            <p className="mt-3 font-semibold leading-7 text-[#553019]">
              {marketplace.message}
            </p>
          </section>
        ) : (
          <section
            className="mt-7 grid gap-5 md:grid-cols-3"
            aria-label="Room products"
          >
            {marketplace.products.map((product) => (
              <article
                key={product.id}
                className="pixel-card flex min-h-full flex-col overflow-hidden rounded-md bg-[#fff2b7]"
              >
                <Image
                  src={product.assetPath}
                  alt={`${product.name} room preview`}
                  width={724}
                  height={543}
                  priority={product.id === "room_livingroom"}
                  unoptimized
                  className="pixel-art aspect-[4/3] w-full border-b-4 border-[#4d2f1b] bg-[#fff9d8] object-cover"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#1368ae]">
                        Room
                      </p>
                      <h2 className="mt-1 text-2xl font-black uppercase">
                        {product.name}
                      </h2>
                    </div>
                    {product.isOwned ? (
                      <span className="rounded-md border-2 border-[#245c20] bg-[#e0f8d3] px-2 py-1 text-xs font-black uppercase text-[#245c20]">
                        Owned
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 flex-1 font-semibold leading-7 text-[#553019]">
                    {product.description}
                  </p>
                  <p className="mt-5 text-2xl font-black">
                    {product.price} coins
                  </p>
                  <div className="mt-4">
                    <BuyProductForm
                      productId={product.id}
                      isOwned={product.isOwned}
                    />
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
