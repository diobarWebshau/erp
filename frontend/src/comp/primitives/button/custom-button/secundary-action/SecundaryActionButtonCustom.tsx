import { cloneElement, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./SecundaryActionButtonCustom.module.css";

interface ISecundaryActionButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
}

const SecundaryActionButtonCustom = ({
    onClick,
    label,
    icon
}: ISecundaryActionButtonCustomProps) => {
    
    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = cloneElement(icon, {
        className: [StyleModule.secundaryActionButtonCustomIcon, icon.props.className].filter(Boolean).join(" ")
    });

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.secundaryActionButtonCustom}
            classNameLabel={StyleModule.secundaryActionButtonCustomLabel}
            classNameSpan={StyleModule.secundaryActionButtonCustomSpan}
            icon={iconWithClass}
        />
    );
};

export default SecundaryActionButtonCustom;
