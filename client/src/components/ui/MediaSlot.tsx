import { useState } from "react";
import { ImagePlus } from "lucide-react";
import styles from "./MediaSlot.module.scss";

/**
 * MediaSlot — the single place in the codebase that knows how to display a
 * "real photo" position.
 *
 * - If `src` is set AND the file loads successfully → renders the real
 *   photo/video, full-bleed, object-cover, ready for hover-zoom/parallax.
 * - If `src` is missing OR the file 404s (i.e. you haven't dropped the file
 *   in yet) → renders an unmistakable placeholder with the exact filename,
 *   folder, and aspect ratio it expects.
 *
 * Handoff workflow for real Pi Decor photos/video:
 *   1. Drop the file into `public/images/` using the filename shown below.
 *   2. Nothing else to change — this component picks it up automatically.
 */

export interface MediaSlotProps {
  /** Path relative to /public, e.g. "/images/hero.jpg" */
  src?: string | null;
  alt: string;
  /** Shown in the placeholder so whoever preps assets knows exactly what to export. */
  label: string;
  /** e.g. "1600×1000 · ngang · JPG" */
  hint?: string;
  className?: string;
  /** Extra class applied to the <img>/<video> itself (e.g. a hover-zoom class from the parent's own module). */
  mediaClassName?: string;
  priority?: boolean;
}

function isVideoSrc(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src);
}

export function MediaSlot({
  src,
  alt,
  label,
  hint,
  className = "",
  mediaClassName = "",
  priority = false,
}: MediaSlotProps) {
  const [failed, setFailed] = useState(false);
  const showReal = Boolean(src) && !failed;

  return (
    <div className={`${styles.slot} ${className}`}>
      {showReal && src && isVideoSrc(src) && (
        <video
          className={`${styles.media} ${mediaClassName}`}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setFailed(true)}
        >
          <source src={src} />
        </video>
      )}
      {showReal && src && !isVideoSrc(src) && (
        <img
          src={src}
          alt={alt}
          className={`${styles.media} ${mediaClassName}`}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      )}
      {!showReal && (
        <div className={styles.placeholder}>
          <ImagePlus size={22} strokeWidth={1.5} className={styles.placeholderIcon} />
          <p className={styles.placeholderLabel}>{label}</p>
          {hint && <p className={styles.placeholderHint}>{hint}</p>}
        </div>
      )}
    </div>
  );
}
