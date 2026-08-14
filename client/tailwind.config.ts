import type { Config } from "tailwindcss";

/**
 * Tailwind is scoped to the Studio Builder only (see `content` below) — the
 * rest of the site keeps using the existing SCSS modules / _variables.scss
 * design tokens untouched. `preflight` is disabled so Tailwind's base reset
 * doesn't fight with styles/_reset.scss, which already normalizes the page.
 *
 * Color/font tokens below are copied 1:1 from styles/_variables.scss so the
 * Studio Builder still matches the rest of Pi Decor exactly.
 */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FBF7F1",
          dim: "#F4EEE3",
        },
        ink: {
          DEFAULT: "#271620",
          muted: "#6E6259",
          faint: "#9C9186",
        },
        line: "#E7DED0",
        accent: {
          DEFAULT: "#A15C2E",
          hover: "#874C25",
          subtle: "#F1E4D8",
        },
        material: {
          rose: "#E7B6BB",
          sage: "#AFC49C",
          sand: "#C99F6F",
          lavender: "#B98AC9",
          champagne: "#E7BE79",
          smoke: "#8A9BAE",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ['"Be Vietnam Pro"', "sans-serif"],
      },
      maxWidth: {
        content: "1240px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      transitionTimingFunction: {
        DEFAULT: "ease-in-out",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(39,22,32,0.06)",
        DEFAULT: "0 4px 16px rgba(39,22,32,0.08)",
        lg: "0 30px 70px -20px rgba(39,22,32,0.28)",
      },
    },
  },
  plugins: [],
} satisfies Config;
