import { ReactNode, useEffect, useRef, useState } from "react";
import styles from "./Reveal.module.scss";

/**
 * Reveal — fades + lifts children into place the first time they cross into
 * the viewport. This is the one motion primitive used sitewide for
 * "scroll-reveal" so every section enters the same way instead of each
 * component rolling its own animation.
 *
 * Respects prefers-reduced-motion via the global rule in styles/_reset.scss
 * (transition-duration is forced to ~0 there), so no extra check needed here.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms, e.g. index * 80 for a grid. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${styles.reveal} ${visible ? styles.visible : ""} ${className}`}
    >
      {children}
    </div>
  );
}
