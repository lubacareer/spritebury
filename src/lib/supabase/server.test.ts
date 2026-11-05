import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  jar: new Map<string, string>(),
  writes: [] as Array<{ name: string; value: string; options: Record<string, unknown> }>,
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [...state.jar].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string, options: Record<string, unknown>) => {
      state.writes.push({ name, value, options });
      if (options.maxAge === 0) state.jar.delete(name);
      else state.jar.set(name, value);
    },
  }),
}));

import { createSupabaseServerClient } from "./server";

const cookieName = "sb-spritebury-test-auth-token";
const user = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated", role: "authenticated", email: "player@example.test",
  app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z",
};

function session(expiresIn = 3600, refreshToken = "fixture-refresh", padding = "") {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const accessToken = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + expiresIn })}.fixture-signature`;
  return {
    access_token: accessToken, refresh_token: refreshToken,
    expires_in: expiresIn, token_type: "bearer",
    user: { ...user, user_metadata: { padding } },
  };
}

function storedSession() {
  const chunks = [...state.jar].filter(([name]) => name === cookieName || name.startsWith(`${cookieName}.`))
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }));
  const value = chunks.map(([, contents]) => contents).join("");
  return JSON.parse(Buffer.from(value.replace(/^base64-/, ""), "base64url").toString("utf8"));
}

function fetchStub(handler: (url: URL, init: RequestInit) => unknown) {
  const mock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    expect(url.origin).toBe("https://spritebury-test.supabase.co");
    return new Response(JSON.stringify(handler(url, init)), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  state.jar.clear();
  state.writes.length = 0;
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://spritebury-test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "fixture-publishable-key");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("the installed Supabase server client's cookie and PKCE contract", () => {
  it("persists the PKCE verifier, exchanges it and authenticates a later request using server getUser", async () => {
    const issued = session();
    let challenge: string | undefined;
    let verifier: string | undefined;
    fetchStub((url, init) => {
      if (url.pathname.endsWith("/otp")) {
        const body = JSON.parse(String(init.body));
        challenge = body.code_challenge;
        expect(body.code_challenge_method).toBe("s256");
        return {};
      }
      if (url.pathname.endsWith("/token")) {
        expect(url.searchParams.get("grant_type")).toBe("pkce");
        const body = JSON.parse(String(init.body));
        expect(body.auth_code).toBe("fixture-authorization-code");
        verifier = body.code_verifier;
        return issued;
      }
      expect(url.pathname).toBe("/auth/v1/user");
      expect(new Headers(init.headers).get("authorization")).toBe(`Bearer ${issued.access_token}`);
      return user;
    });
    const first = (await createSupabaseServerClient())!;
    expect((await first.auth.signInWithOtp({ email: user.email })).error).toBeNull();
    expect([...state.jar.keys()].some((name) => name.includes("code-verifier"))).toBe(true);

    const callback = (await createSupabaseServerClient())!;
    expect((await callback.auth.exchangeCodeForSession("fixture-authorization-code")).error).toBeNull();
    expect(verifier).toBeTruthy();
    const expectedChallenge = Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier!))).toString("base64url");
    expect(challenge).toBe(expectedChallenge);
    expect(storedSession().access_token).toBe(issued.access_token);
    // This callback uses the supported legacy lookup (no explicit flowId).
    // Other indexed flows are independent; only its fixed verifier is consumed.
    expect(state.jar.has(`${cookieName}-code-verifier`)).toBe(false);
    expect(state.writes.filter(({ value }) => value).every(({ options }) => options.path === "/" && options.sameSite === "lax")).toBe(true);

    const later = (await createSupabaseServerClient())!;
    expect((await later.auth.getUser()).data.user?.id).toBe(user.id);
  });

  it("refreshes expired sessions, rotates refresh tokens and removes obsolete cookie chunks", async () => {
    const expired = session(-1, "fixture-old-refresh", "x".repeat(9000));
    const refreshed = session(3600, "fixture-rotated-refresh");
    fetchStub((url, init) => {
      if (url.pathname.endsWith("/otp")) return {};
      if (url.pathname.endsWith("/token")) {
        if (url.searchParams.get("grant_type") === "pkce") return expired;
        expect(url.searchParams.get("grant_type")).toBe("refresh_token");
        expect(JSON.parse(String(init.body)).refresh_token).toBe("fixture-old-refresh");
        return refreshed;
      }
      expect(url.pathname).toBe("/auth/v1/user");
      return user;
    });
    const first = (await createSupabaseServerClient())!;
    expect((await first.auth.signInWithOtp({ email: user.email })).error).toBeNull();
    expect((await first.auth.exchangeCodeForSession("fixture-authorization-code")).error).toBeNull();
    expect([...state.jar.keys()].filter((name) => name.startsWith(`${cookieName}.`)).length).toBeGreaterThan(1);

    const later = (await createSupabaseServerClient())!;
    expect((await later.auth.getUser()).data.user?.id).toBe(user.id);
    expect(storedSession().refresh_token).toBe("fixture-rotated-refresh");
    expect([...state.jar.keys()].filter((name) => name.startsWith(`${cookieName}.`))).toEqual([]);
    expect(state.writes.some(({ name, options }) => name.startsWith(`${cookieName}.`) && options.maxAge === 0)).toBe(true);
  });

  it("does not authenticate a request when the auth server rejects its cookie token", async () => {
    const issued = session();
    fetchStub((url) => {
      if (url.pathname.endsWith("/otp")) return {};
      expect(url.pathname).toBe("/auth/v1/token");
      return issued;
    });
    const first = (await createSupabaseServerClient())!;
    expect((await first.auth.signInWithOtp({ email: user.email })).error).toBeNull();
    expect((await first.auth.exchangeCodeForSession("fixture-authorization-code")).error).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "invalid fixture token", code: "bad_jwt" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    })));
    const later = (await createSupabaseServerClient())!;
    const rejected = await later.auth.getUser();
    expect(rejected.error).not.toBeNull();
    expect(rejected.data.user).toBeNull();
  });
});
