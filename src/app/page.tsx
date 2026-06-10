import { OpeningScreen } from "@/components/opening-screen";
import { getOpeningRouteState } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const routeState = await getOpeningRouteState();

  return <OpeningScreen routeState={routeState} />;
}
