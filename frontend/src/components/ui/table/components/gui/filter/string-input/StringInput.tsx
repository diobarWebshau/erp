import React from "react";
import StyleModule from "./string-input.module.css";

interface StringInputProps {
    id?: string;
    label?: string;
    className?: string;
    inputClassName?: string;
    type?: string;
    name?: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    onChange?: (value: string) => void;
}

const StringInput = (({
    id = `input-${Math.random().toString(36).slice(2, 9)}`,
    label,
    className = "",
    inputClassName = "",
    type = "text",
    name,
    placeholder = "",
    value,
    defaultValue = "",
    disabled = false,
    required = false,
    autoFocus = false,
    onChange
}: StringInputProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.value;
        onChange?.(selected);
    };

    return (
        <div className={`${StyleModule.input_text} ${className}`}>
            {label && <label htmlFor={id}>{label}</label>}
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                defaultValue={value === undefined ? defaultValue : undefined}
                onChange={handleChange}
                disabled={disabled}
                required={required}
                autoFocus={autoFocus}
                className={inputClassName}
            />
        </div>
    );
});

export default StringInput;
