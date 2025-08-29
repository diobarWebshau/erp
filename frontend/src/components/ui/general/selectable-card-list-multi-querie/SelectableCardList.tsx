import React, { useEffect, useState } from "react";
import styles from "./select-table-card.module.css";

type BaseItem = {
  id: number;
  [key: string]: any;
};

type SelectableCardListProps<T extends BaseItem> = {
  items: T[];
  label?: string;
  name?: string;
  onChange?: (item: T | null) => void;
  renderField?: (key: string, value: any, item: T) => React.ReactNode;
  defaultSelectedId?: number | undefined;
  emptyMessage: string;
};

const SelectableCardListMultiQuerie = <T extends BaseItem>({
  items,
  label = "Select Item",
  name = "selectable-list",
  onChange,
  renderField,
  defaultSelectedId,
  emptyMessage,
}: SelectableCardListProps<T>) => {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // Sincroniza el estado interno cuando cambian items o defaultSelectedId
  useEffect(() => {
    if (defaultSelectedId !== undefined && items.length > 0) {
      const found = items.find((i) => i.id === defaultSelectedId) ?? null;
      setSelectedItem(found);
      if (found) onChange?.(found);
    }
  }, [items, defaultSelectedId, onChange]);

  const handleSelection = (item: T) => {
    setSelectedItem(item);
    onChange?.(item);
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.container}>
        {items.length === 0 ? (
          <p className={styles.emptyMessage}>{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <label
              key={item.id}
              className={`${styles.card} ${selectedItem?.id === item.id ? styles.cardSelected : ""
                }`}
            >
              <input
                type="radio"
                name={name}
                checked={selectedItem?.id === item.id}
                onChange={() => handleSelection(item)}
                className={styles.radio}
              />
              <div className={styles.cardContent}>
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className={styles.textRow}>
                    <strong className={styles.key}>{key}:</strong>{" "}
                    <span className={styles.value}>
                      {renderField ? renderField(key, value, item) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

export { SelectableCardListMultiQuerie };