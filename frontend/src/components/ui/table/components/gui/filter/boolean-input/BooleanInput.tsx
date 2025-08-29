import React from "react";
import styles
    from "./boolean-input.module.css";
import type { BooleanFilter }
    from "../../../../types";

interface IBooleanInputProps {
    options: [string, string];
    value?: BooleanFilter;
    onChange?: (value: BooleanFilter) => void;
    label?: string;
}

const BooleanInput = ({
    options,
    value = "",
    onChange,
    label = "Select Option",
}: IBooleanInputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected: BooleanFilter = e.target.value;
        onChange?.(selected);
    };

    return (
        <div>
            <label className={styles.label}>
                <strong></strong>{label}
            </label>
            <div className={styles.group}>
                {options.map((opt) => (
                    <label key={opt} className={styles.option}>
                        <input
                            type="radio"
                            name="radio-group"
                            value={opt}
                            checked={value === opt}
                            onChange={handleChange}
                        />
                        {opt.toString()}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default BooleanInput;
