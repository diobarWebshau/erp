import { useEffect, useState, type ChangeEvent, useCallback } from "react";
import styles from "./CheckBoxListAutoSize.module.css";

interface CheckBoxListAutoSizeProps {
  value?: string[];
  options?: string[];
  onChange: (selected: string[]) => void;
  classNameContainer?: string;
  classNameGroupOptions?: string;
  classNameOption?: string;
  classNameSelectedOption?: string;
  classNameInputOption?: string;
}

const sanitizeId = (str: string) => str.replace(/\s+/g, "_");

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
  const [selectedOptions, setSelectedOptions] = useState<string[]>(() => value ?? []);

  // sincroniza si el padre cambia value
  useEffect(() => {
    setSelectedOptions(value ?? []);
  }, [value]);

  const handleToggle = useCallback(
    (e: ChangeEvent<HTMLInputElement>, option: string) => {
      const checked = e.target.checked;
      setSelectedOptions(prev => {
        const next = checked ? [...prev, option] : prev.filter(item => item !== option);
        onChange(next);
        return next;
      });
    },
    [onChange]
  );

  const opts = options ?? [];

  return (
    <div className={`${styles.groupOptions} ${classNameContainer} ${classNameGroupOptions}`}>
      {opts.map((option) => {
        const isSelected = selectedOptions.includes(option);
        const optionId = sanitizeId(option);

        return (
          <label
            htmlFor={optionId}
            key={optionId}
            className={`${styles.option} ${classNameOption} ${isSelected ? styles.selected : ""} ${isSelected ? classNameSelectedOption : ""
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
