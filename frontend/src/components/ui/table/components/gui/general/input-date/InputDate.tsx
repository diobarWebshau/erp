import { useState } from "react";
import styles from "./input-date.module.css";

interface InputDateProps {
    label?: string;
    value?: string; // ISO date string, e.g. "2023-05-26"
    onChange?: (value: string) => void;
    name: string;
    min?: string; // valor mínimo aceptado (formato "YYYY-MM-DD")
    max?: string; // valor máximo aceptado
    disabled?: boolean;
    required?: boolean;
    className?: string;
    placeholder?: string;
}

const InputDate: React.FC<InputDateProps> = ({
    label,
    value = "",
    onChange,
    name,
    min,
    max,
    disabled = false,
    required = false,
    className = "",
    placeholder = "",
}) => {

    const [date, setDate] = useState<string>(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
        onChange?.(e.target.value);
    };

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {label && (
                <label htmlFor={name} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                type="date"
                id={name}
                name={name}
                value={date}
                onChange={handleChange}
                min={min}
                max={max}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                className={styles.input}
            />
        </div>
    );
};

export default InputDate;
