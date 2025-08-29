import React from "react";
import StyleModule from "./input-text.module.css";

interface InputTextProps {
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

const InputText = (({
    id = `input-${Math.random().toString(36).slice(2, 9)}`, // generar un ID único y automático para el elemento
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
}: InputTextProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.value;
        console.log(selected);
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

export default InputText;
