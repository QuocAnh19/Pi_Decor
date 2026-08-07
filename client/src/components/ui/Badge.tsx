import { ReactNode } from "react";
import styles from "./Badge.module.scss";

type Tone = "ink" | "paper" | "accent";

const toneClass: Record<Tone, string> = {
  ink: styles.ink,
  paper: styles.paper,
  accent: styles.accent,
};

/**
 * Solid-background label used for captions overlaid on imagery or color.
 * Deliberately opaque (no translucency/blur) so it stays legible regardless
 * of what sits behind it.
 */
export function Badge({ tone = "paper", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`${styles.badge} ${toneClass[tone]}`}>{children}</span>;
}
