import type { Venue } from "../../../lib/types";
import { ProjectMap } from "./ProjectMap";
import styles from "./MapExplorer.module.scss";

interface MapExplorerProps {
  venues: Venue[];
  compact?: boolean;
  className?: string;
}

export function MapExplorer({ venues, compact = false, className = "" }: MapExplorerProps) {
  return (
    <div className={`${styles.explorer} ${compact ? styles.compact : ""} ${className}`}>
      <ProjectMap venues={venues} className={styles.map} />
    </div>
  );
}
