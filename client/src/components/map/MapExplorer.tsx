import type { Venue } from "../../lib/types";
import { ProjectMap } from "./ProjectMap";
import styles from "./MapExplorer.module.scss";

interface MapExplorerProps {
  venues: Venue[];
  /** Shorter, homepage-teaser sizing vs. the full /ban-do page. */
  compact?: boolean;
  className?: string;
}

/**
 * Thin sizing wrapper around ProjectMap — kept as its own component so
 * MapPage and the homepage teaser both get the same compact/full height
 * rules without repeating them. The click → fetch → popup interaction now
 * lives inside ProjectMap itself (see its docstring).
 */
export function MapExplorer({ venues, compact = false, className = "" }: MapExplorerProps) {
  return (
    <div className={`${styles.explorer} ${compact ? styles.compact : ""} ${className}`}>
      <ProjectMap venues={venues} className={styles.map} />
    </div>
  );
}
