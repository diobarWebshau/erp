import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import StyleModule from "./input-select.module.css";

interface InputSelectProps {
  id?: string;
  label?: string;
  className?: string;
  selectClassName?: string;
  name?: string;
  placeholder?: string;
  options: string[]; // ahora es un array de strings
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
}

const defaultId = () => `select-${Math.random().toString(36).slice(2, 9)}`;

const InputSelect = ({
  id = defaultId(),
  label,
  className = "",
  selectClassName = "",
  name,
  placeholder,
  options,
  value,
  defaultValue,
  disabled = false,
  required = false,
  autoFocus = false,
  onChange,
}: InputSelectProps) => {
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState<string>(
    isControlled ? value! : defaultValue ?? ""
  );

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value!);
    }
  }, [value, isControlled]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setInternalValue(selectedValue);
    onChange?.(selectedValue);
  };

  const renderOptions = useMemo(
    () =>
      options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      )),
    [options]
  );

  return (
    <div className={`${StyleModule.input_select} ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <select
        id={id}
        name={name}
        className={selectClassName}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        value={internalValue}
        onChange={handleChange}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {renderOptions}
      </select>
    </div>
  );
};

export default InputSelect;
