import { useEffect, useState, type ChangeEvent, useCallback } from "react";
import styles from "./CheckBoxListAutoSize.module.css";

interface CheckBoxListAutoSizeProps {
  value: string[];
  options: string[];
  onChange: (selected: string[]) => void;
  classNameContainer?: string;
  classNameGroupOptions?: string;
  classNameOption?: string;
  classNameSelectedOption?: string;
  classNameInputOption?: string;
}

const sanitizeId = (str: string) => str.replace(/\s+/g, "_"); // Para HTML seguro

const CheckBoxListAutoSize = ({
  value,
  options,
  onChange,
  classNameContainer = "",
  classNameGroupOptions = "",
  classNameOption = "",
  classNameSelectedOption = "",
  classNameInputOption = "",
}: CheckBoxListAutoSizeProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value);

  // Función para manejar toggle de checkboxes
  const handleToggle = useCallback(
    (e: ChangeEvent<HTMLInputElement>, option: string) => {
      const checked = e.target.checked;
      const updated = checked
        ? [...selectedOptions, option]
        : selectedOptions.filter((item) => item !== option);
      console.log(`checked: ${checked}`);
      console.log(`updated: ${updated}`);

      setSelectedOptions(updated); // 🔑 actualizar estado interno
      onChange?.(updated);
    },
    [selectedOptions, onChange]
  );

  return (
    <div className={`${styles.groupOptions} ${classNameContainer} ${classNameGroupOptions}`}>
      {options.map((option) => {
        const isSelected = selectedOptions.includes(option);
        const optionId = sanitizeId(option);

        return (
          <label
            htmlFor={optionId}
            key={optionId}
            className={`${styles.option} ${classNameOption} ${isSelected ? styles.selected : ""} ${
              isSelected ? classNameSelectedOption : ""
            }`}
          >
            <input
              id={optionId}
              type="checkbox"
              className={`${styles.inputCheckbox} ${classNameInputOption}`}
              checked={isSelected}
              onChange={(e) => handleToggle(e, option)}
            />
            {option}
          </label>
        );
      })}
    </div>
  );
};

export default CheckBoxListAutoSize;
