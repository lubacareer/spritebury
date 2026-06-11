export const selectableAvatarIds = ["female1", "male1"] as const;

export type SelectableAvatarId = (typeof selectableAvatarIds)[number];

export type AvatarFrameRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AvatarSpriteDefinition = {
  id: SelectableAvatarId;
  label: string;
  assetPath: string;
  sourceWidth: number;
  sourceHeight: number;
  columns: number;
  rows: number;
  previewFrame: number;
  previewRect: AvatarFrameRect;
};

export const avatarSprites: AvatarSpriteDefinition[] = [
  {
    id: "female1",
    label: "Female 1",
    assetPath: "/assets/female1.png",
    sourceWidth: 1448,
    sourceHeight: 1086,
    columns: 4,
    rows: 4,
    previewFrame: 0,
    previewRect: {
      x: 140,
      y: 10,
      width: 368,
      height: 276,
    },
  },
  {
    id: "male1",
    label: "Male 1",
    assetPath: "/assets/male1.png",
    sourceWidth: 1448,
    sourceHeight: 1086,
    columns: 4,
    rows: 4,
    previewFrame: 0,
    previewRect: {
      x: 76,
      y: 0,
      width: 368,
      height: 276,
    },
  },
];

export function getAvatarSprite(avatarId: string | null | undefined) {
  return avatarSprites.find((avatar) => avatar.id === avatarId) ?? null;
}

export function getDefaultSelectableAvatarId(
  avatarId: string | null | undefined,
): SelectableAvatarId {
  return getAvatarSprite(avatarId)?.id ?? "female1";
}

export function getAvatarFrameRect(
  sprite: AvatarSpriteDefinition,
  frame = sprite.previewFrame,
): AvatarFrameRect {
  if (frame === sprite.previewFrame) {
    return sprite.previewRect;
  }

  const frameWidth = sprite.sourceWidth / sprite.columns;
  const frameHeight = sprite.sourceHeight / sprite.rows;
  const column = frame % sprite.columns;
  const row = Math.floor(frame / sprite.columns);

  return {
    x: column * frameWidth,
    y: row * frameHeight,
    width: frameWidth,
    height: frameHeight,
  };
}
