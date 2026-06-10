import Link from "next/link";
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
        <dl className="mt-7 space-y-4 rounded-md border-4 border-[#5b351d] bg-[#fff9d8] p-4 font-semibold">
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
        </dl>
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
