import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";
import { getPlayerAccount } from "@/lib/auth/dal";
import { sanitizeRedirectPath } from "@/domain/validation";
import { signOut } from "@/features/auth/actions";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = sanitizeRedirectPath(params.redirect ?? null);
  const account = await getPlayerAccount();

  return (
    <main className="min-h-dvh bg-[#8bd2f4] px-4 py-8 text-[#2c1b12]">
      <section className="mx-auto max-w-xl rounded-md bg-[#fff2b7] p-6 pixel-card">
        <Link href="/" className="text-sm font-black uppercase text-[#1368ae]">
          Back to opening screen
        </Link>
        <div className="mt-6 space-y-3">
          <h1 className="text-4xl font-black uppercase tracking-wide">
            Login
          </h1>
          <p className="text-base font-semibold leading-7 text-[#553019]">
            Enter your email and Spritebury will send a one-time magic link.
          </p>
        </div>
        <div className="mt-7">
          {account?.user ? (
            <div className="space-y-5">
              <p className="rounded-md bg-[#e0f8d3] px-4 py-3 font-semibold text-[#245c20]">
                You are signed in as {account.user.email ?? "a Spritebury player"}.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href={account.avatar ? "/city/town-square" : "/create-avatar"}
                  className="pixel-button rounded-md bg-[#f2b42d] px-5 py-3 text-center font-black uppercase text-white"
                >
                  Continue
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="pixel-button w-full rounded-md bg-[#2f95df] px-5 py-3 font-black uppercase text-white"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <LoginForm redirectTo={redirectTo} />
          )}
        </div>
      </section>
    </main>
  );
}
