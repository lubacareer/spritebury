import Link from "next/link";
import { AvatarSprite } from "@/components/avatar-sprite";
import { signOut } from "@/features/auth/actions";
import { getPlayerAccount, requireCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await requireCurrentUser("/account");
  const account = await getPlayerAccount();

  return (
    <main className="min-h-dvh bg-[#8bd2f4] px-4 py-8 text-[#2c1b12]">
      <section className="mx-auto max-w-2xl rounded-md bg-[#fff2b7] p-6 pixel-card">
        <Link href="/" className="text-sm font-black uppercase text-[#1368ae]">
          Opening screen
        </Link>
        <h1 className="mt-6 text-4xl font-black uppercase tracking-wide">
          Account
        </h1>
        <div className="mt-7 grid gap-5 rounded-md border-4 border-[#5b351d] bg-[#fff9d8] p-4 sm:grid-cols-[12rem_1fr]">
          <AvatarSprite
            avatarId={account?.avatar?.base_type}
            className="h-36 w-48"
            label="Selected avatar"
          />
          <dl className="space-y-4 font-semibold">
            <div>
              <dt className="text-sm uppercase text-[#553019]">Email</dt>
              <dd>{account?.user.email ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-sm uppercase text-[#553019]">Username</dt>
              <dd>{account?.profile?.username ?? "Not created yet"}</dd>
            </div>
            <div>
              <dt className="text-sm uppercase text-[#553019]">Avatar</dt>
              <dd>{account?.avatar?.base_type ?? "Not created yet"}</dd>
            </div>
            <div>
              <dt className="text-sm uppercase text-[#553019]">Coins</dt>
              <dd>{account?.wallet?.balance ?? 0}</dd>
            </div>
            {account?.profile?.username ? (
              <div>
                <dt className="text-sm uppercase text-[#553019]">
                  Public Profile
                </dt>
                <dd>
                  <Link
                    href={`/profile/${account.profile.username}`}
                    className="font-black text-[#1368ae]"
                  >
                    View profile
                  </Link>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="pixel-button rounded-md bg-[#73bd36] px-5 py-3 font-black uppercase text-white"
          >
            Marketplace
          </Link>
          <Link
            href="/city/town-square"
            className="pixel-button rounded-md bg-[#f2b42d] px-5 py-3 font-black uppercase text-white"
          >
            Town Square
          </Link>
        </div>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="pixel-button rounded-md bg-[#2f95df] px-5 py-3 font-black uppercase text-white"
          >
            Sign Out
          </button>
        </form>
      </section>
    </main>
  );
}
