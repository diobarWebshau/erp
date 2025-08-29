import React from "react";
import styles from "./visual-card.module.css";

type VisualCardProps<T> = {
  item: T;
  renderFields: (item: T) => React.ReactNode;
  getImage?: (item: T) => string;
  className?: string;
};

export function VisualCard<T>({
  item,
  renderFields,
  getImage,
  className = "",
}: VisualCardProps<T>) {
  const imageSrc = getImage?.(item);

  return (
    <div className={`${styles.card} ${className}`}>
      {imageSrc && (
        <img
          src={`data:image/jpeg;base64,${imageSrc}`}
          alt="Item"
          className={styles.cardImage}
        />
      )}

      <div className={styles.cardContent}>{renderFields(item)}</div>
    </div>
  );
}
