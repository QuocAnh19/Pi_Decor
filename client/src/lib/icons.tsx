import React from "react";
import * as HeroIcons from "@heroicons/react/24/outline";

/**
 * Custom SVG Icon for Marriage / Wedding (PiWedding)
 * Interlocking rings with a sparkling heart diamond motif
 */
export function MarriageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      <circle cx="9" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="15" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/**
 * Custom SVG Icon for Kids / Children / Birthday (PiKids)
 * Smiling party balloon & star sparkle motif
 */
export function KidsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="11" r="8" />
      <path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5" />
      <circle cx="9.5" cy="9.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="9.5" r="1" fill="currentColor" />
      <path d="M12 19v4" />
      <path d="M10 21c.5 1 1.5 1 2 1s1.5 0 2-1" />
      <path d="M12 3l1-2 1 2" />
    </svg>
  );
}

/**
 * Custom SVG Icon for Events / Corporate / Ceremonies (PiEvent)
 * Event stage calendar & award star ribbon motif
 */
export function EventIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="17" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polygon points="12 12 13.2 14.5 16 15 14 17 14.5 19.8 12 18.5 9.5 19.8 10 17 8 15 10.8 14.5 12 12" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

/**
 * Resolves icon component by name string:
 * Supports custom "MarriageIcon", "KidsIcon", "EventIcon", as well as Heroicons.
 */
export function resolveIcon(name: string): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  if (!name || typeof name !== "string") return HeroIcons.QuestionMarkCircleIcon;

  const cleanName = name.trim().toLowerCase();

  if (cleanName === "marriageicon" || cleanName === "marriage" || cleanName === "wedding") {
    return MarriageIcon;
  }

  if (cleanName === "kidsicon" || cleanName === "kids" || cleanName === "pikids") {
    return KidsIcon;
  }

  if (cleanName === "eventicon" || cleanName === "event" || cleanName === "pievent") {
    return EventIcon;
  }

  const iconKey = name.endsWith("Icon") ? name : `${name}Icon`;
  const HeroIcon = (HeroIcons as unknown as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[iconKey];

  return HeroIcon ?? HeroIcons.QuestionMarkCircleIcon;
}
