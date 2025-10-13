import InputText from "../base/inputText"
import { memo, type JSX } from "react";
import StyleModule from "./InputTextCustom.module.css";
import withClassName from "../../../../../utils/withClassName";
import clsx from "clsx";

interface InputTextProps {
    value: string | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    classNameContainer?: string;
    classNameInput?: string;
    icon?: JSX.Element;
    withValidation?: boolean;
}

const InputTextCustom = memo(({
    value,
    onChange,
    autoFocus = false,
    classNameContainer,
    icon,
    classNameInput,
    placeholder,
    withValidation = true
}: InputTextProps) => {

    const iconWithClass = icon && withClassName(icon, StyleModule.icon)

    return (
        <InputText
            {...(placeholder ? { placeholder: placeholder } : {})}
            value={value}
            onChange={onChange}
            {...(autoFocus && { autoFocus })}
            {...(icon && { icon: iconWithClass })}
            classNameContainer={clsx(StyleModule.container, classNameContainer)}
            classNameInput={clsx(`nunito-regular`, StyleModule.input, classNameInput)}
            classNameInputValid={StyleModule.inputValid}
            classNameInputInvalid={clsx(withValidation ? StyleModule.inputInvalid : undefined)}
        />
    )
})

export default InputTextCustom
