import Link from "next/link";
import { CreateAvatarForm } from "@/features/account/create-avatar-form";
import { getPlayerAccount, requireCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function CreateAvatarPage() {
  await requireCurrentUser("/create-avatar");
  const account = await getPlayerAccount();

  return (
    <main className="min-h-dvh bg-[#8bd2f4] px-4 py-8 text-[#2c1b12]">
      <section className="mx-auto max-w-3xl rounded-md bg-[#fff2b7] p-6 pixel-card">
        <Link href="/" className="text-sm font-black uppercase text-[#1368ae]">
          Back to opening screen
        </Link>
        <div className="mt-6 space-y-3">
          <h1 className="text-4xl font-black uppercase tracking-wide">
            Create Avatar
          </h1>
          <p className="text-base font-semibold leading-7 text-[#553019]">
            Choose your public player name and starter sprite for the city.
          </p>
        </div>
        {account?.avatar ? (
          <div className="mt-7 flex flex-wrap items-center gap-4 rounded-md bg-[#e0f8d3] px-4 py-3 font-semibold text-[#245c20]">
            <p className="flex-1">
              Your avatar is ready. You can choose a different sprite below.
            </p>
            <Link
              href="/city/town-square"
              className="pixel-button inline-block rounded-md bg-[#f2b42d] px-5 py-3 font-black uppercase text-white"
            >
              Play
            </Link>
          </div>
        ) : null}
        <div className="mt-7">
          <CreateAvatarForm
            initialUsername={account?.profile?.username}
            initialDisplayName={account?.profile?.display_name}
            initialAvatarBaseType={account?.avatar?.base_type}
            usernameLocked={Boolean(account?.profile)}
            submitLabel={account?.avatar ? "Update Avatar" : "Create Avatar"}
          />
        </div>
      </section>
    </main>
  );
}
