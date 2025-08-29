import React from "react";
import styles from "./list-item.module.css";

type ListItemProps<T> = {
  items: T[];
  label?: string;
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void; 
  renderFields: (item: T) => React.ReactNode;
  getId: (item: T) => number | string;
  getImage?: (item: T) => string;
  emptyMessage: string;
};

export function ListItem<T>({
  items,
  label = "Items",
  onDelete,
  onEdit,                 
  renderFields,
  getId,
  getImage,
  emptyMessage,
}: ListItemProps<T>) {
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
          const imageSrc = getImage?.(item);

          return (
            <div key={String(id)} className={styles.cardWrapper}>
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  {imageSrc && (
                    <img
                      src={`data:image/jpeg;base64,${imageSrc}`}
                      alt="Item"
                      className={styles.cardImage}
                    />
                  )}
                  {renderFields(item)}
                </div>
              </div>

              <div className={styles.actionButtons}>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className={styles.editButton}
                    title="Editar"
                  >
                    ✏️
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className={styles.deleteButton}
                    title="Eliminar"
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
