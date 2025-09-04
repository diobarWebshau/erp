import { cloneElement, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./TransparentButton.module.css";


interface ITransparentButton {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
}

const TransparentButton = ({
    onClick,
    label,
    icon
}: ITransparentButton) => {

    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = icon ? cloneElement(icon, {
        className: [StyleModule.transparentButtonIcon, icon.props.className].filter(Boolean).join(" ")
    }) : null;

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.transparentButton}
            classNameLabel={StyleModule.transparentButtonLabel}
            classNameSpan={StyleModule.transparentButtonSpan}
            {...(icon && { icon: iconWithClass })}
            
        />
    )
}

export default TransparentButton
