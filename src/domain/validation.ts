import { z } from "zod";
import { selectableAvatarIds } from "./avatars";

export const avatarBaseTypes = selectableAvatarIds;

export const emailOtpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  redirectTo: z.string().optional(),
});

export const createAvatarSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be at most 20 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Use only letters, numbers, and underscores.",
    )
    .transform((value) => value.toLowerCase()),
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(32, "Display name must be at most 32 characters."),
  avatarBaseType: z.enum(avatarBaseTypes),
});

export type CreateAvatarInput = z.infer<typeof createAvatarSchema>;

export function sanitizeRedirectPath(value: FormDataEntryValue | string | null) {
  if (typeof value !== "string") {
    return "/city/town-square";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/city/town-square";
  }

  return value;
}
