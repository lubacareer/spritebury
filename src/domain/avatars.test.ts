import { describe, expect, it } from "vitest";
import {
  avatarSprites,
  getAvatarFrameRect,
  getDefaultSelectableAvatarId,
} from "./avatars";

describe("getDefaultSelectableAvatarId", () => {
  it("keeps existing selectable avatar ids", () => {
    expect(getDefaultSelectableAvatarId("male1")).toBe("male1");
  });

  it("falls back to a selectable sprite for empty or legacy avatar ids", () => {
    expect(getDefaultSelectableAvatarId(null)).toBe("female1");
    expect(getDefaultSelectableAvatarId("townie")).toBe("female1");
  });
});

describe("getAvatarFrameRect", () => {
  it("uses explicit preview rectangles for generated sheets with outer padding", () => {
    const female = avatarSprites.find((avatar) => avatar.id === "female1");
    const male = avatarSprites.find((avatar) => avatar.id === "male1");

    expect(female && getAvatarFrameRect(female)).toMatchObject({
      x: 140,
      y: 10,
      width: 368,
      height: 276,
    });
    expect(male && getAvatarFrameRect(male)).toMatchObject({
      x: 76,
      y: 0,
      width: 368,
      height: 276,
    });
  });
});
