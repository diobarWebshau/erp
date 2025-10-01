import InputText from "../base/inputText"
import type { JSX} from "react";
import StyleModule from "./InputTextCustom.module.css";
import withClassName from "../../../../../utils/withClassName";

interface InputTextProps {
    value: string | undefined;
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
    classNameButton?: string;
    icon?: JSX.Element;
}

const InputTextCustom = ({
    placeholder,
    value,
    onChange,
    name,
    disabled = false,
    required = false,
    autoFocus = false,
    classNameContainer,
    onClick,
    icon,
    classNameInput,
    classNameButton
}: InputTextProps) => {

    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = icon && withClassName(icon, StyleModule.iconButton)

    return (
        <InputText
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            onClick={onClick}
            {...(icon && { icon: iconWithClass })}
            classNameContainer={`${StyleModule.containerInputTextCustom} ${classNameContainer}`}
            classNameInput={`nunito-regular ${StyleModule.inputTextCustom} ${classNameInput}`}
            classNameButton={`${StyleModule.inputTextButton} ${classNameButton}`}
        />
    )
}

export default InputTextCustom
