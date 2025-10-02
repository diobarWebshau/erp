import { cloneElement, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./MainActionButtonCustom.module.css";

interface IMainActionButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
    classNameButton?: string;
    disabled?: boolean;
    classNameSpan?: string;
}

const MainActionButtonCustom = ({
    onClick,
    label,
    icon,
    classNameButton,
    disabled,
    classNameSpan
}: IMainActionButtonCustomProps) => {
    
    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = icon && cloneElement(icon, {
        className: [StyleModule.mainActionButtonCustomIcon, icon.props.className].filter(Boolean).join(" ")
    });

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={`${classNameButton} ${StyleModule.mainActionButtonCustom}`}
            classNameLabel={`nunito-medium ${StyleModule.mainActionButtonCustomLabel}`}
            classNameSpan={`${classNameSpan} ${StyleModule.mainActionButtonCustomSpan}`}
            {...icon && {icon: iconWithClass}}
            disabled={disabled}
        />
    );
};

export default MainActionButtonCustom;
