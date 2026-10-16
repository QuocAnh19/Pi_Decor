import { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import styles from "./MediaSlot.module.scss";

export interface MediaSlotProps {
  /** Path relative to /public, e.g. "/images/hero.jpg" */
  src?: string | null;
  srcSet?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
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
  srcSet,
  sizes,
  width,
  height,
  alt,
  label,
  hint,
  className = "",
  mediaClassName = "",
  priority = false,
}: MediaSlotProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

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
          srcSet={srcSet}
          sizes={sizes}
          width={width}
          height={height}
          alt={alt}
          className={`${styles.media} ${mediaClassName}`}
          loading={priority ? "eager" : "lazy"}
          {...(priority ? { fetchPriority: "high" as const } : {})}
          onError={() => setFailed(true)}
        />
      )}
      {!showReal && (
        <div className={styles.placeholder}>
          <PhotoIcon
            className={`h-6 w-6 ${styles.placeholderIcon}`}
            style={{ width: 22, height: 22 }}
          />
          <p className={styles.placeholderLabel}>{label}</p>
          {hint && <p className={styles.placeholderHint}>{hint}</p>}
        </div>
      )}
    </div>
  );
}
