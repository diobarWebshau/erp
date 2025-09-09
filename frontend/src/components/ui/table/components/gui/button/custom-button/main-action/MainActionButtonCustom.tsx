import { cloneElement, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./MainActionButtonCustom.module.css";

interface IMainActionButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
}

const MainActionButtonCustom = ({
    onClick,
    label,
    icon
}: IMainActionButtonCustomProps) => {
    
    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = cloneElement(icon, {
        className: [StyleModule.mainActionButtonCustomIcon, icon.props.className].filter(Boolean).join(" ")
    });

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.mainActionButtonCustom}
            classNameLabel={StyleModule.mainActionButtonCustomLabel}
            classNameSpan={StyleModule.mainActionButtonCustomSpan}
            icon={iconWithClass}
        />
    );
};

export default MainActionButtonCustom;
