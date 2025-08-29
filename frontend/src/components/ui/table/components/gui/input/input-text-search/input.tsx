import {
    type ChangeEvent,
    type ReactNode,
} from "react";
import StyleModule
    from "./input.module.css";

interface InputProps {
    id?: string;
    name?: string;
    type: "text"
    placeholder?: string;
    value?: string;
    onChange?: (
        e: ChangeEvent<HTMLInputElement>
    ) => void;
    disabled?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    classNameContainer?: string;
    classNameInput?: string;
    classNameIcon?: string;
    classNameButton?: string;
    icon?: ReactNode;
    onClick?: () => void;
}

const Input = ({
    placeholder,
    value,
    onChange,
    name,
    disabled,
    required,
    autoFocus,
    classNameContainer,
    type,
    onClick,
    icon,
    classNameInput,
    classNameIcon,
    classNameButton
}: InputProps) => {

    return (
        <div className={`${StyleModule.container} ${classNameContainer}`}>

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                name={name}
                disabled={disabled}
                required={required}
                autoFocus={autoFocus}
                className={`${StyleModule.input} ${classNameInput}`}

            />
            <button
                onClick={onClick}
                className={`${StyleModule.button} ${classNameButton}`}
            >
                {icon}
            </button>
        </div>
    )
}

export default Input;
