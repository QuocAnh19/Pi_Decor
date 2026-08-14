import { ReactNode } from "react";
import styles from "./Badge.module.scss";

export type BadgeTone = "ink" | "paper" | "accent" | "published" | "draft" | "warning";

const toneClass: Record<BadgeTone, string> = {
  ink: styles.ink,
  paper: styles.paper,
  accent: styles.accent,
  published: styles.published,
  draft: styles.draft,
  warning: styles.warning,
};

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "paper", className = "", children }: BadgeProps) {
  return <span className={`${styles.badge} ${toneClass[tone]} ${className}`}>{children}</span>;
}
