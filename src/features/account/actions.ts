"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAvatarSchema } from "@/domain/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreateAvatarActionState } from "@/features/account/state";

export async function createProfileAndAvatar(
  _state: CreateAvatarActionState,
  formData: FormData,
): Promise<CreateAvatarActionState> {
  const parsed = createAvatarSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    avatarBaseType: formData.get("avatarBaseType"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message:
        "Supabase is not configured yet. Add the local environment variables before creating an avatar.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=%2Fcreate-avatar");
  }

  const { username, displayName, avatarBaseType } = parsed.data;

  const existingProfile = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile.error) {
    return {
      status: "error",
      message: "Could not check your profile. Apply the database migration and try again.",
    };
  }

  if (!existingProfile.data) {
    const profileInsert = await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: displayName,
    });

    if (profileInsert.error) {
      const isUsernameConflict =
        profileInsert.error.code === "23505" ||
        profileInsert.error.message.toLowerCase().includes("duplicate");

      return {
        status: "error",
        message: isUsernameConflict
          ? "That username is already taken."
          : "Could not create your profile.",
      };
    }
  } else {
    const profileUpdate = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
      })
      .eq("id", user.id);

    if (profileUpdate.error) {
      return {
        status: "error",
        message: "Could not update your profile.",
      };
    }
  }

  const avatarUpsert = await supabase.from("avatars").upsert(
    {
      player_id: user.id,
      base_type: avatarBaseType,
    },
    {
      onConflict: "player_id",
    },
  );

  if (avatarUpsert.error) {
    return {
      status: "error",
      message: "Could not save your avatar.",
    };
  }

  const walletInsert = await supabase.from("wallets").insert({
    player_id: user.id,
    balance: 250,
  });

  if (
    walletInsert.error &&
    walletInsert.error.code !== "23505" &&
    !walletInsert.error.message.toLowerCase().includes("duplicate")
  ) {
    return {
      status: "error",
      message: "Could not create your starter wallet.",
    };
  }

  revalidatePath("/");
  revalidatePath("/create-avatar");
  redirect("/city/town-square");
}
