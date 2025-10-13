import { useState, type ChangeEvent, type JSX } from "react";
import StyleModule from "./InputText.module.css";
import clsx from "clsx";
interface InputTextProps {
    value: string | undefined;
    onChange: (value: string) => void;
    id?: string;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    classNameContainer?: string;
    classNameInput?: string;
    classNameInputValid?: string;
    classNameInputInvalid?: string;
    classNameIcon?: string;
    icon?: JSX.Element;
}

const InputText = ({
    placeholder,
    value,
    onChange,
    name,
    disabled,
    required,
    autoFocus,
    classNameContainer,
    icon,
    classNameInput,
    classNameInputValid,
    classNameInputInvalid,
}: InputTextProps) => {

    const [isValid, setIsValid] = useState<boolean>(false);

    const handleOnChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
            setIsValid(false)
        }
        if (!isValid) setIsValid(true);
        onChange(value);
    }

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
                value={value}
                onChange={handleOnChangeInput}
                name={name}
                disabled={disabled}
                required={required}
                autoFocus={autoFocus}
                className={classNamesInput}
            />
            {icon && icon}
        </div>
    )
}

export default InputText;
