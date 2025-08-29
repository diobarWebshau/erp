import React from "react";
import styles from "./select-table-card.module.css";

type SelectableCardListProps<T> = {
  items: T[];
  label?: string;
  name?: string;
  onChange?: (item: T | undefined) => void;
  renderFields: (item: T) => React.ReactNode;
  getId: (item: T) => number | string;
  getImage?: (item: T) => string;
  selectedItem?: T | undefined;
  emptyMessage: string;
};

export function SelectableCardListWithImage<T>({
  items,
  label = "Select Item",
  name = "selectable-list",
  onChange,
  renderFields,
  getId,
  getImage,
  selectedItem,
  emptyMessage,
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
          const isSelected = selectedItem ? getId(selectedItem) === id : false;
          const imageSrc = getImage?.(item);

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


/** COMO USARLO
 
    <SelectableCardList<Product>
      items={products}
      label="Selecciona un producto"
      emptyMessage="No hay productos disponibles"
      selectedItem={selected}
      onChange={setSelected}
      getId={(item) => item.id}
      getImage={(item) => item.photo}
      renderFields={(item) => (
        <>
          <strong>{item.name}</strong>
          <p>${item.price.toFixed(2)}</p>
        </>
      )}
    />
 
 */
