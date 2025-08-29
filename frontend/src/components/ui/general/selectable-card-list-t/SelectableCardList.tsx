import React from "react";
import styles from "./select-table-card.module.css";

type SelectableCardListProps<T> = {
  items: T[];
  label?: string;
  name?: string;
  onChange?: (item: T | undefined) => void;
  renderFields: (item: T) => React.ReactNode;
  getId: (item: T) => number | string;
  selectedItem?: T; // Modo controlado: el item seleccionado se recibe desde afuera
  emptyMessage: string;
  disabled?: boolean;
};

export function SelectableCardList<T>({
  items,
  label = "Select Item",
  name = "selectable-list",
  onChange,
  renderFields,
  getId,
  selectedItem,
  emptyMessage,
  disabled=false,
}: SelectableCardListProps<T>) {

  const handleChange = (item: T) => {
    onChange?.(item);
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
          const selectedId = selectedItem !== undefined ? getId(selectedItem) : undefined;
          // const selectedId = selectedItem ? getId(selectedItem) : undefined;
          const isSelected = selectedId !== undefined && selectedId === id;

          return (
            <label
              key={String(id)}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
            >
              <input
                type="radio"
                name={name}
                checked={isSelected}
                onChange={() => handleChange(item)}
                className={styles.radio}
                disabled={disabled}
              />
              <div className={styles.cardContent}>{renderFields(item)}</div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
