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
            Choose your public player name and a starter look for the city.
          </p>
        </div>
        {account?.avatar ? (
          <div className="mt-7 space-y-5">
            <p className="rounded-md bg-[#e0f8d3] px-4 py-3 font-semibold text-[#245c20]">
              Your avatar is ready.
            </p>
            <Link
              href="/city/town-square"
              className="pixel-button inline-block rounded-md bg-[#f2b42d] px-5 py-3 font-black uppercase text-white"
            >
              Play
            </Link>
          </div>
        ) : (
          <div className="mt-7">
            <CreateAvatarForm />
          </div>
        )}
      </section>
    </main>
  );
}
