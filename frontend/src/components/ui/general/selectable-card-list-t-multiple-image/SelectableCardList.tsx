import React from "react";
import styles from "./select-table-card.module.css";

type SelectableCardListMultipleImageProps<T> = {
  items: T[];
  label?: string;
  name?: string;
  onChange?: (items: T[]) => void;
  renderFields: (item: T) => React.ReactNode;
  getId: (item: T) => number | string;
  getImage?: (item: T) => string;
  selectedItems?: T[];
  emptyMessage: string;
};

export function SelectableCardListMultipleImage<T>({
  items,
  label = "Select Items",
  name = "selectable-list",
  onChange,
  renderFields,
  getId,
  getImage,
  selectedItems = [],
  emptyMessage,
}: SelectableCardListMultipleImageProps<T>) {
  const handleToggle = (item: T) => {
    const id = getId(item);
    const isSelected = selectedItems.some((selected) => getId(selected) === id);

    const updatedSelection = isSelected
      ? selectedItems.filter((selected) => getId(selected) !== id)
      : [...selectedItems, item];

    onChange?.(updatedSelection);
  };

  if (items.length === 0) {
    return (
      <div className={styles.wrapper}>
        <label className={styles.label}>{label}</label>
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.container}>
        {items.map((item) => {
          const id = getId(item);
          const isSelected = selectedItems.some((selected) => getId(selected) === id);
          const imageSrc = getImage?.(item);

          return (
            <label
              key={String(id)}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
            >
              <input
                type="checkbox"
                name={name}
                checked={isSelected}
                onChange={() => handleToggle(item)}
                className={styles.radio}
              />
              <div className={styles.cardContent}>
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Item"
                    className={styles.cardImage}
                  />
                )}
                {renderFields(item)}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
