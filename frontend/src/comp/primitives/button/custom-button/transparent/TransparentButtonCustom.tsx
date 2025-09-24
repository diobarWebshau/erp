import { cloneElement, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./TransparentButtonCustom.module.css";


interface ITransparentButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
}

const TransparentButtonCustom = ({
    onClick,
    label,
    icon
}: ITransparentButtonCustomProps) => {

    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = icon ? cloneElement(icon, {
        className: [StyleModule.transparentButtonCustomIcon, icon.props.className].filter(Boolean).join(" ")
    }) : null;

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.transparentButtonCustom}
            classNameLabel={StyleModule.transparentButtonCustomLabel}
            classNameSpan={StyleModule.transparentButtonCustomSpan}
            {...(icon && { icon: iconWithClass })}
            
        />
    )
}

export default TransparentButtonCustom  
