import type { ChangeEvent, JSX} from "react";
import StyleModule from "./InputText.module.css";

interface InputTextProps {
    value: string;
    onChange: (value: string) => void;
    onClick?: () => void;
    id?: string;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    classNameContainer?: string;
    classNameInput?: string;
    classNameIcon?: string;
    classNameButton?: string;
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
    onClick,
    icon,
    classNameInput,
    classNameButton
}: InputTextProps) => {

    const handleOnChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    }

    return (
        <div className={`${StyleModule.container} ${classNameContainer}`}>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleOnChangeInput}
                name={name}
                disabled={disabled}
                required={required}
                autoFocus={autoFocus}
                className={`${StyleModule.input} ${ icon && StyleModule.inputWithIcon} ${classNameInput}`}
            />
            {icon &&
                <button
                    className={`${StyleModule.button} ${classNameButton}`}
                    type="button"
                    {...(onClick && {onClick: onClick})}
                >
                    {icon}
                </button>
            }
        </div>
    )
}

export default InputText;
