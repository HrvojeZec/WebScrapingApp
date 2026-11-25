import { useState } from "react";
import classes from "./ProductImage.module.scss";

const FALLBACK_SRC = "/product-fallback.svg";

interface ProductImageProps {
  /** Loaded from the store; null when the store lists no image */
  src: string | null;
  alt: string;
}

/** A product photo in a fixed 4:3 box, with a placeholder when there is none or it fails to load. */
export function ProductImage({ src, alt }: ProductImageProps) {
  // Remembers which URL failed, so a new src gets its own chance without an effect
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showFallback = src === null || src === failedSrc;

  return (
    <div className={classes.frame}>
      <img
        className={showFallback ? classes.fallback : classes.image}
        src={showFallback ? FALLBACK_SRC : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={showFallback ? undefined : () => setFailedSrc(src)}
      />
    </div>
  );
}
