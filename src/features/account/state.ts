export type CreateAvatarActionState = {
  status: "idle" | "error";
  message?: string;
  errors?: {
    username?: string[];
    displayName?: string[];
    avatarBaseType?: string[];
  };
};

export const initialCreateAvatarActionState: CreateAvatarActionState = {
  status: "idle",
};
