import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvatarSprite } from "@/components/avatar-sprite";
import { getPublicProfileByUsername } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const publicProfile = await getPublicProfileByUsername(username);

  if (!publicProfile) {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-[#8bd2f4] px-4 py-8 text-[#2c1b12]">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-md bg-[#fff2b7] p-6 pixel-card">
          <Link
            href="/"
            className="text-sm font-black uppercase text-[#1368ae]"
          >
            Opening screen
          </Link>
          <div className="mt-7 grid gap-5 sm:grid-cols-[14rem_1fr]">
            <AvatarSprite
              avatarId={publicProfile.avatar?.base_type}
              className="h-44 w-56"
              label={`${publicProfile.profile.display_name}'s avatar`}
            />
            <div>
              <h1 className="text-4xl font-black uppercase tracking-wide">
                {publicProfile.profile.display_name}
              </h1>
              <p className="mt-2 text-lg font-black text-[#1368ae]">
                @{publicProfile.profile.username}
              </p>
              <p className="mt-5 rounded-md border-4 border-[#5b351d] bg-[#fff9d8] p-4 font-semibold leading-7 text-[#553019]">
                {publicProfile.profile.bio || "A new Spritebury resident."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="profile-items-heading">
          <h2
            id="profile-items-heading"
            className="text-3xl font-black uppercase tracking-wide"
          >
            Items
          </h2>
          {publicProfile.ownedItemCategories.length === 0 ? (
            <p className="mt-4 rounded-md border-4 border-[#5b351d] bg-[#fff9d8] p-4 font-semibold text-[#553019]">
              No items yet.
            </p>
          ) : (
            <div className="mt-5 space-y-8">
              {publicProfile.ownedItemCategories.map((category) => (
                <section
                  key={category.productType}
                  aria-labelledby={`profile-items-${category.productType}`}
                >
                  <h3
                    id={`profile-items-${category.productType}`}
                    className="text-xl font-black uppercase text-[#553019]"
                  >
                    {category.label}
                  </h3>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((item) => (
                      <article
                        key={item.id}
                        className="pixel-card overflow-hidden rounded-md bg-[#fff2b7]"
                      >
                        <Image
                          src={item.assetPath}
                          alt={`${item.name} preview`}
                          width={724}
                          height={543}
                          unoptimized
                          className="pixel-art aspect-[4/3] w-full border-b-4 border-[#4d2f1b] bg-[#fff9d8] object-cover"
                        />
                        <div className="p-4">
                          <h4 className="text-lg font-black uppercase">
                            {item.name}
                          </h4>
                          <p className="mt-2 font-semibold leading-6 text-[#553019]">
                            {item.description}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
