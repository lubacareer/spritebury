import { describe, expect, it } from "vitest";
import { selectableAvatarIds } from "./avatars";
import { createAvatarSchema, sanitizeRedirectPath } from "./validation";

describe("createAvatarSchema", () => {
  it("normalizes valid usernames", () => {
    const result = createAvatarSchema.parse({
      username: "Sprite_Fan",
      displayName: "Sprite Fan",
      avatarBaseType: "female1",
    });

    expect(result.username).toBe("sprite_fan");
  });

  it("rejects usernames outside the allowed character set", () => {
    expect(() =>
      createAvatarSchema.parse({
        username: "bad name!",
        displayName: "Sprite Fan",
        avatarBaseType: "female1",
      }),
    ).toThrow();
  });

  it("rejects unknown avatar base types", () => {
    expect(() =>
      createAvatarSchema.parse({
        username: "spritefan",
        displayName: "Sprite Fan",
        avatarBaseType: "admin",
      }),
    ).toThrow();
  });

  it("accepts every selectable avatar sprite id", () => {
    for (const avatarBaseType of selectableAvatarIds) {
      expect(
        createAvatarSchema.parse({
          username: "spritefan",
          displayName: "Sprite Fan",
          avatarBaseType,
        }).avatarBaseType,
      ).toBe(avatarBaseType);
    }
  });
});

describe("sanitizeRedirectPath", () => {
  it("allows same-site absolute paths", () => {
    expect(sanitizeRedirectPath("/create-avatar")).toBe("/create-avatar");
  });

  it("rejects external URLs", () => {
    expect(sanitizeRedirectPath("https://evil.example")).toBe(
      "/city/town-square",
    );
  });

  it("rejects protocol-relative URLs", () => {
    expect(sanitizeRedirectPath("//evil.example")).toBe("/city/town-square");
  });
});
