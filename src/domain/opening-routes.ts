export type OpeningAction = "play" | "login" | "create-avatar";

export type OpeningRouteState = {
  isSignedIn: boolean;
  hasAvatar: boolean;
};

export const CITY_START_PATH = "/city/town-square";
export const CREATE_AVATAR_PATH = "/create-avatar";
export const LOGIN_PATH = "/login";

export function loginHref(redirectPath: string) {
  return `${LOGIN_PATH}?redirect=${encodeURIComponent(redirectPath)}`;
}

export function getOpeningHref(
  action: OpeningAction,
  state: OpeningRouteState,
) {
  if (action === "login") {
    return LOGIN_PATH;
  }

  if (action === "create-avatar") {
    return state.isSignedIn
      ? CREATE_AVATAR_PATH
      : loginHref(CREATE_AVATAR_PATH);
  }

  if (!state.isSignedIn) {
    return loginHref(CITY_START_PATH);
  }

  return state.hasAvatar ? CITY_START_PATH : CREATE_AVATAR_PATH;
}
