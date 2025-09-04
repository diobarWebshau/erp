import { cloneElement, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./ActionSecundaryButton.module.css"; // Ajusta ruta si es necesario

interface IActionSecundaryButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
}

const ActionSecundaryButtonCustom = ({
    onClick,
    label,
    icon
}: IActionSecundaryButtonCustomProps) => {
    
    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = cloneElement(icon, {
        className: [StyleModule.secundaryButtonIcon, icon.props.className].filter(Boolean).join(" ")
    });

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.secundaryButton}
            classNameLabel={StyleModule.secundaryButtonLabel}
            classNameSpan={StyleModule.secundaryButtonSpan}
            icon={iconWithClass}
        />
    );
};

export default ActionSecundaryButtonCustom;
