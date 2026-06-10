import { expect, test } from "@playwright/test";

test("desktop opening screen loads image, focuses buttons, and redirects guests", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByTestId("opening-scene")).toBeVisible();
  await expect(page.getByAltText(/Spritebury opening screen/i)).toBeVisible();

  const play = page.getByRole("link", { name: "Play" });
  const login = page.getByRole("link", { name: "Login" });
  const createAvatar = page.getByRole("link", { name: "Create Avatar" });

  await expect(play).toHaveAttribute(
    "href",
    "/login?redirect=%2Fcity%2Ftown-square",
  );
  await expect(login).toHaveAttribute("href", "/login");
  await expect(createAvatar).toHaveAttribute(
    "href",
    "/login?redirect=%2Fcreate-avatar",
  );

  const playBox = await play.boundingBox();
  const loginBox = await login.boundingBox();
  const createAvatarBox = await createAvatar.boundingBox();

  expect(playBox?.width).toBeGreaterThan(240);
  expect(loginBox?.y).toBeGreaterThan(playBox?.y ?? 0);
  expect(createAvatarBox?.y).toBeGreaterThan(loginBox?.y ?? 0);

  await page.keyboard.press("Tab");
  await expect(play).toBeFocused();

  await play.click();
  await expect(page).toHaveURL(/\/login\?redirect=%2Fcity%2Ftown-square$/);
});

test("mobile opening screen keeps the three native buttons reachable", async ({
  page,
}) => {
  await page.goto("/");

  const scene = page.getByTestId("opening-scene");
  const createAvatar = page.getByRole("link", { name: "Create Avatar" });

  await expect(scene).toBeVisible();
  await expect(createAvatar).toBeVisible();

  const box = await createAvatar.boundingBox();
  expect(box?.width).toBeGreaterThan(80);
  expect(box?.height).toBeGreaterThan(20);

  await createAvatar.click();
  await expect(page).toHaveURL(/\/login\?redirect=%2Fcreate-avatar$/);
});
