import React from "react";
import styles from "./enum-input.module.css"; // Reutiliza estilos existentes

interface EnumSelectInputProps {
    options: string[];
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
}

const EnumSelectInput = ({
    options,
    value = "",
    onChange,
    label = "Select Option",
}: EnumSelectInputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        onChange?.(selected);
    };

    return (
        <div>
            <label className={styles.label}>
                <strong></strong>{label}
            </label>
            <div className={styles.group}>
                <select
                    className={styles.select}
                    value={value}
                    onChange={handleChange}
                >
                    <option value="">-- Select --</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default EnumSelectInput;
