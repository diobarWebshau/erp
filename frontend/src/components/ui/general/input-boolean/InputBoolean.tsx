import React, { useState, useEffect } from "react";
import styles from "./input-boolean.module.css";

interface IInputBooleanProps {
    options: [string, string];
    value?: string;
    onChange?: (value: boolean) => void;
    label?: string;
    name?: string;
}

const InputBoolean = ({
    options,
    value,
    onChange,
    label = "Select Option",
    name,
}: IInputBooleanProps) => {
    const groupName = name ?? React.useId();

    const [selectedValue, setSelectedValue] = useState<string>("");

    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.value;
        setSelectedValue(selected);
        const booleanValue = options.indexOf(selected) === 1;
        onChange?.(booleanValue);
    };

    const isChecked = (opt: string) => opt === selectedValue;

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
                            name={groupName}
                            value={opt}
                            checked={isChecked(opt)}
                            onChange={handleChange}
                        />
                        {opt}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default InputBoolean;
