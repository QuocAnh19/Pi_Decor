import { MediaSlot } from "./MediaSlot";
import styles from "./Polaroid.module.scss";

interface PolaroidProps {
  src?: string | null;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt: string;
  label: string;
  hint?: string;
  caption?: string;
  rotate?: number; // degrees
  className?: string;
}

/**
 * Polaroid — a single tilted photo card with a white frame + bottom caption
 * strip, the way Swan Agency stacks its hero photos. Two or three of these,
 * slightly offset and rotated, make up the hero collage.
 */
export function Polaroid({
  src,
  srcSet,
  sizes,
  alt,
  label,
  hint,
  caption,
  rotate = 0,
  width,
  height,
  className = "",
}: PolaroidProps) {
  return (
    <div
      className={`${styles.polaroid} ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, ...(width ? { width } : {}) }}
    >
      <MediaSlot
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        alt={alt}
        label={label}
        hint={hint}
        className={styles.photo}
      />
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
}
