export type LoginActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: {
    email?: string[];
  };
};

export const initialLoginActionState: LoginActionState = {
  status: "idle",
};
