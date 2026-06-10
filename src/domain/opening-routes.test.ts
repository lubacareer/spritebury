import { describe, expect, it } from "vitest";
import {
  CITY_START_PATH,
  CREATE_AVATAR_PATH,
  LOGIN_PATH,
  getOpeningHref,
} from "./opening-routes";

describe("getOpeningHref", () => {
  it("sends guest Play clicks to login with the town-square redirect", () => {
    expect(
      getOpeningHref("play", { isSignedIn: false, hasAvatar: false }),
    ).toBe(`${LOGIN_PATH}?redirect=%2Fcity%2Ftown-square`);
  });

  it("sends signed-in players with avatars to the city", () => {
    expect(getOpeningHref("play", { isSignedIn: true, hasAvatar: true })).toBe(
      CITY_START_PATH,
    );
  });

  it("sends signed-in players without avatars to avatar creation", () => {
    expect(getOpeningHref("play", { isSignedIn: true, hasAvatar: false })).toBe(
      CREATE_AVATAR_PATH,
    );
  });

  it("keeps Login as the explicit login route", () => {
    expect(getOpeningHref("login", { isSignedIn: true, hasAvatar: true })).toBe(
      LOGIN_PATH,
    );
  });

  it("requires guests to login before creating an avatar", () => {
    expect(
      getOpeningHref("create-avatar", { isSignedIn: false, hasAvatar: false }),
    ).toBe(`${LOGIN_PATH}?redirect=%2Fcreate-avatar`);
  });
});
