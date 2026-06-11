import { getAvatarFrameRect, getAvatarSprite } from "@/domain/avatars";

type AvatarSpriteProps = {
  avatarId: string | null | undefined;
  frame?: number;
  className?: string;
  label?: string;
};

export function AvatarSprite({
  avatarId,
  frame,
  className = "",
  label,
}: AvatarSpriteProps) {
  const sprite = getAvatarSprite(avatarId);

  if (!sprite) {
    return (
      <div
        className={`avatar-sprite-display grid place-items-center text-xs font-black uppercase text-[#6b4a2d] ${className}`}
        role="img"
        aria-label="No avatar selected"
      >
        No Avatar
      </div>
    );
  }

  const frameRect = getAvatarFrameRect(sprite, frame);
  const backgroundSizeX = (sprite.sourceWidth / frameRect.width) * 100;
  const backgroundSizeY = (sprite.sourceHeight / frameRect.height) * 100;
  const xDenominator = sprite.sourceWidth - frameRect.width;
  const yDenominator = sprite.sourceHeight - frameRect.height;
  const x = xDenominator <= 0 ? 0 : (frameRect.x / xDenominator) * 100;
  const y = yDenominator <= 0 ? 0 : (frameRect.y / yDenominator) * 100;

  return (
    <div
      className={`avatar-sprite-display ${className}`}
      role="img"
      aria-label={label ?? sprite.label}
      style={
        {
          "--avatar-image": `url("${sprite.assetPath}")`,
          "--avatar-size": `${backgroundSizeX}% ${backgroundSizeY}%`,
          "--avatar-position": `${x}% ${y}%`,
        } as React.CSSProperties
      }
    />
  );
}
