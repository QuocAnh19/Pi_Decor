/**
 * Feather — a single decorative accent borrowed from the Swan Agency
 * reference. Used sparingly (1–2 per section, never as a repeating pattern)
 * as a small romantic flourish near the polaroid collage and section
 * headers. Pure SVG, colored via `currentColor` so it inherits the
 * `color` set on it via the CSS module class the caller passes in.
 */
export function Feather({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32 4C32 4 6 34 6 74C6 104 20 128 32 136C44 128 58 104 58 74C58 34 32 4 32 4Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M32 8V132"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
      {Array.from({ length: 9 }).map((_, i) => {
        const y = 22 + i * 12;
        const spread = 10 + i * 1.6;
        return (
          <g key={i}>
            <path d={`M32 ${y} Q ${32 - spread} ${y + 6} ${32 - spread - 4} ${y + 16}`} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <path d={`M32 ${y} Q ${32 + spread} ${y + 6} ${32 + spread + 4} ${y + 16}`} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          </g>
        );
      })}
    </svg>
  );
}
