/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  getOpeningHref,
  type OpeningAction,
  type OpeningRouteState,
} from "@/domain/opening-routes";

type OpeningScreenProps = {
  routeState: OpeningRouteState;
};

const HOTSPOTS: Array<{
  action: OpeningAction;
  label: string;
  style: React.CSSProperties;
}> = [
  {
    action: "play",
    label: "Play",
    style: {
      left: "38.55%",
      top: "72.7%",
      width: "23.0%",
      height: "8.1%",
    },
  },
  {
    action: "login",
    label: "Login",
    style: {
      left: "38.55%",
      top: "82.05%",
      width: "23.0%",
      height: "6.9%",
    },
  },
  {
    action: "create-avatar",
    label: "Create Avatar",
    style: {
      left: "38.55%",
      top: "90.0%",
      width: "23.0%",
      height: "7.0%",
    },
  },
];

export function OpeningScreen({ routeState }: OpeningScreenProps) {
  return (
    <main className="opening-viewport" aria-label="Spritebury opening screen">
      <div className="opening-scene" data-testid="opening-scene">
        {/* The opening art is the UI itself, so render the original PNG unoptimized. */}
        <img
          src="/assets/opening_screen.png"
          alt="Spritebury opening screen with Play, Login, and Create Avatar choices"
          className="pixel-art absolute inset-0 h-full w-full select-none object-contain"
          draggable={false}
        />
        {HOTSPOTS.map((hotspot) => (
          <Link
            key={hotspot.action}
            href={getOpeningHref(hotspot.action, routeState)}
            aria-label={hotspot.label}
            className="opening-hotspot"
            style={hotspot.style}
            data-testid={`opening-${hotspot.action}`}
          >
            <span className="sr-only">{hotspot.label}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
