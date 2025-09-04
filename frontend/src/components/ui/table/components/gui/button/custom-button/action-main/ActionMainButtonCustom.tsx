import { cloneElement, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./ActionMainButtonCustom.module.css"; // Ajusta ruta si es necesario

interface IActionMainButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
}

const ActionMainButtonCustom = ({
    onClick,
    label,
    icon
}: IActionMainButtonCustomProps) => {
    
    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = cloneElement(icon, {
        className: [StyleModule.mainButtonIcon, icon.props.className].filter(Boolean).join(" ")
    });

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.mainButton}
            classNameLabel={StyleModule.mainButtonLabel}
            classNameSpan={StyleModule.mainButtonSpan}
            icon={iconWithClass}
        />
    );
};

export default ActionMainButtonCustom;
