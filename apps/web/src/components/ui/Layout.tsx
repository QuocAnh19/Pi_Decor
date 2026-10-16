import { ReactNode } from "react";
import { Reveal } from "./Reveal";
import styles from "./Layout.module.scss";

/** Enforces the single max content width + horizontal padding rule site-wide. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.container} ${className}`}>{children}</div>;
}

const toneClass = {
  default: "",
  dim: styles.sectionDim,
  blush: styles.sectionBlush,
};

/** Vertical rhythm for page sections. Every section uses this instead of ad-hoc padding. */
export function Section({
  children,
  className = "",
  tone = "default",
  padding = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "dim" | "blush";
  padding?: "default" | "compact";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`${padding === "compact" ? styles.sectionCompact : styles.section} ${toneClass[tone]} ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={`${styles.header} ${align === "center" ? styles.headerCenter : ""}`}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </Reveal>
  );
}
