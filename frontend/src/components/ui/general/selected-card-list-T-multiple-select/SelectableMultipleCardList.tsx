import React from "react";
import styles from "./select-table-card.module.css";

type SelectableMultipleCardListProps<T> = {
  items: T[];
  label?: string;
  name?: string;
  onChange?: (items: T[]) => void;
  renderFields: (item: T) => React.ReactNode;
  getId: (item: T) => number | string;
  selectedItems?: T[]; // Modo controlado: múltiples seleccionados
  emptyMessage: string;
};

export function SelectableMultipleCardList<T>({
  items,
  label = "Select Items",
  name = "selectable-list",
  onChange,
  renderFields,
  getId,
  selectedItems = [],
  emptyMessage,
}: SelectableMultipleCardListProps<T>) {

  const handleToggle = (item: T) => {
    const id = getId(item);
    const isAlreadySelected = selectedItems.some((selected) => getId(selected) === id);

    const newSelectedItems = isAlreadySelected
      ? selectedItems.filter((selected) => getId(selected) !== id)
      : [...selectedItems, item];

    onChange?.(newSelectedItems);
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
                className={styles.checkbox}
              />
              <div className={styles.cardContent}>{renderFields(item)}</div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
