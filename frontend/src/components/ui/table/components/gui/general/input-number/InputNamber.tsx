import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import StyleModule from "./input-number.module.css";

type NumberType = "integer" | "decimal";

interface InputNumberProps {
  id?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  name?: string;
  placeholder?: string;
  value?: number;
  defaultValue?: number;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  min?: number;
  max?: number;
  step?: number;
  numberType?: NumberType;
  onChange?: (value: number) => void;
}

const defaultId = () => `input-${Math.random().toString(36).slice(2, 9)}`;

const patterns = {
  integer: /^\d*$/,
  decimal: /^\d*\.?\d*$/
};

const isValidInput = (value: string, type: NumberType) =>
  value === "" || patterns[type].test(value);

const InputNumber = ({
  id = defaultId(),
  label,
  className = "",
  inputClassName = "",
  name,
  placeholder = "",
  value,
  defaultValue,
  disabled = false,
  required = false,
  autoFocus = false,
  min,
  max,
  step = 1,
  numberType = "integer",
  onChange,
}: InputNumberProps) => {
  const finalNumberType = useMemo<NumberType>(() => {
    if (numberType) return numberType;
    return step % 1 === 0 ? "integer" : "decimal";
  }, [numberType, step]);

  const [internalValue, setInternalValue] = useState<string>(
    value !== undefined
      ? String(value)
      : defaultValue !== undefined
      ? String(defaultValue)
      : ""
  );

  useEffect(() => {
    if (value !== undefined) setInternalValue(String(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!isValidInput(val, finalNumberType)) return;

    setInternalValue(val);

    const parsed = Number(val);
    if (
      !isNaN(parsed) &&
      (min === undefined || parsed >= min) &&
      (max === undefined || parsed <= max)
    ) {
      onChange?.(parsed);
    }
  };

  return (
    <div className={`${StyleModule.input_text} ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        name={name}
        type="text"
        inputMode={finalNumberType === "integer" ? "numeric" : "decimal"}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        className={inputClassName}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};

export default InputNumber;
