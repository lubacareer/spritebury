export type BuyProductActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialBuyProductActionState: BuyProductActionState = {
  status: "idle",
};
