import { memo, useState, useEffect, type ChangeEvent, type JSX } from "react";
import StyleModule from "./InputText.module.css";
import clsx from "clsx";

interface InputTextProps {
    value?: string;
    onChange: (value: string) => void;
    id?: string;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    // autoFocus?: boolean;
    classNameContainer?: string;
    classNameInput?: string;
    classNameInputValid?: string;
    classNameInputInvalid?: string;
    classNameIcon?: string;
    icon?: JSX.Element;
    onFocus?: () => void;
}

const InputText = memo(({
    placeholder,
    value,
    onChange,
    name,
    disabled,
    required,
    // autoFocus,
    classNameContainer,
    icon,
    classNameInput,
    classNameInputValid,
    classNameInputInvalid,
    onFocus,
}: InputTextProps) => {

    const safeValue = value ?? ""; // <- clave: nunca undefined
    const [isValid, setIsValid] = useState<boolean>(safeValue.trim().length > 0);

    useEffect(() => {
        setIsValid((value ?? "").trim().length > 0);
    }, [value]);

    const handleOnChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setIsValid(v.trim().length > 0);
        onChange(v);
    };

    const classNamesInput = clsx(
        StyleModule.input,
        classNameInput,
        isValid ? classNameInputValid : classNameInputInvalid,
    );

    return (
        <div className={clsx(StyleModule.container, classNameContainer)}>
            <input
                type="text"
                placeholder={placeholder}
                value={safeValue}              // <- nunca undefined
                onChange={handleOnChangeInput}
                name={name}
                disabled={disabled}
                required={required}
                // autoFocus={autoFocus}
                className={classNamesInput}
                onFocus={onFocus}
            />
            {icon}
        </div>
    );
});

export default InputText;
