import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AvatarSprite } from "@/components/avatar-sprite";
import { signOut } from "@/features/auth/actions";
import { getPlayerAccount, requireCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

type CityLocationPageProps = {
  params: Promise<{
    locationId: string;
  }>;
};

export default async function CityLocationPage({
  params,
}: CityLocationPageProps) {
  const { locationId } = await params;

  if (locationId !== "town-square") {
    notFound();
  }

  await requireCurrentUser("/city/town-square");
  const account = await getPlayerAccount();

  if (!account?.avatar) {
    redirect("/create-avatar");
  }

  return (
    <main className="min-h-dvh bg-[#8bd2f4] px-4 py-8 text-[#2c1b12]">
      <section className="mx-auto max-w-4xl rounded-md bg-[#fff2b7] p-6 pixel-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-black uppercase text-[#1368ae]"
            >
              Opening screen
            </Link>
            <h1 className="mt-6 text-4xl font-black uppercase tracking-wide">
              Town Square
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#553019]">
              This is the first protected city stub. Persistent locations,
              presence, jobs, shops, and chat come in later slices.
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="pixel-button rounded-md bg-[#2f95df] px-5 py-3 font-black uppercase text-white"
            >
              Sign Out
            </button>
          </form>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border-4 border-[#5b351d] bg-[#fff9d8] p-4">
            <h2 className="font-black uppercase text-[#553019]">Player</h2>
            <p className="mt-2 text-2xl font-black">
              {account.profile?.display_name ?? account.user.email}
            </p>
          </div>
          <div className="rounded-md border-4 border-[#5b351d] bg-[#fff9d8] p-4">
            <h2 className="font-black uppercase text-[#553019]">Avatar</h2>
            <AvatarSprite
              avatarId={account.avatar.base_type}
              className="mt-3 h-28 w-36"
              label="Selected avatar"
            />
          </div>
          <div className="rounded-md border-4 border-[#5b351d] bg-[#fff9d8] p-4">
            <h2 className="font-black uppercase text-[#553019]">Coins</h2>
            <p className="mt-2 text-2xl font-black">
              {account.wallet?.balance ?? 0}
            </p>
          </div>
          <div className="rounded-md border-4 border-[#5b351d] bg-[#fff9d8] p-4">
            <h2 className="font-black uppercase text-[#553019]">Shop</h2>
            <Link
              href="/marketplace"
              className="mt-3 inline-block font-black uppercase text-[#1368ae]"
            >
              Buy Rooms
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
