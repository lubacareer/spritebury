"use client";

import { useActionState } from "react";
import { avatarBaseTypes } from "@/domain/validation";
import { createProfileAndAvatar } from "@/features/account/actions";
import { initialCreateAvatarActionState } from "@/features/account/state";

const avatarLabels: Record<(typeof avatarBaseTypes)[number], string> = {
  townie: "Townie",
  skater: "Skater",
  cozy: "Cozy",
};

export function CreateAvatarForm() {
  const [state, action, pending] = useActionState(
    createProfileAndAvatar,
    initialCreateAvatarActionState,
  );

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="block text-sm font-bold uppercase tracking-wide text-[#553019]"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={20}
            className="w-full rounded-md border-4 border-[#5b351d] bg-[#fff9d8] px-4 py-3 text-lg font-semibold text-[#2c1b12] outline-none focus:border-[#1368ae] focus:ring-4 focus:ring-[#80c7ff]"
            placeholder="spritefan"
          />
          {state.errors?.username ? (
            <p className="text-sm font-semibold text-[#9d1d1d]">
              {state.errors.username[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="displayName"
            className="block text-sm font-bold uppercase tracking-wide text-[#553019]"
          >
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            minLength={2}
            maxLength={32}
            className="w-full rounded-md border-4 border-[#5b351d] bg-[#fff9d8] px-4 py-3 text-lg font-semibold text-[#2c1b12] outline-none focus:border-[#1368ae] focus:ring-4 focus:ring-[#80c7ff]"
            placeholder="Sprite Fan"
          />
          {state.errors?.displayName ? (
            <p className="text-sm font-semibold text-[#9d1d1d]">
              {state.errors.displayName[0]}
            </p>
          ) : null}
        </div>
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-bold uppercase tracking-wide text-[#553019]">
          Starter Avatar
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {avatarBaseTypes.map((type) => (
            <label
              key={type}
              className="cursor-pointer rounded-md border-4 border-[#5b351d] bg-[#fff4b8] px-4 py-5 text-center font-black uppercase text-[#443018] has-[:checked]:border-[#1368ae] has-[:checked]:bg-[#d8f5ff]"
            >
              <input
                className="sr-only"
                type="radio"
                name="avatarBaseType"
                value={type}
                defaultChecked={type === "townie"}
              />
              {avatarLabels[type]}
            </label>
          ))}
        </div>
        {state.errors?.avatarBaseType ? (
          <p className="text-sm font-semibold text-[#9d1d1d]">
            {state.errors.avatarBaseType[0]}
          </p>
        ) : null}
      </fieldset>
      <button
        type="submit"
        disabled={pending}
        className="pixel-button w-full rounded-md bg-[#73bd36] px-5 py-3 text-lg font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Create Avatar"}
      </button>
      {state.message ? (
        <p
          className="rounded-md bg-[#ffe1d8] px-4 py-3 text-sm font-semibold text-[#8a2416]"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
