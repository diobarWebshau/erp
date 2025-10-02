import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./TertiaryActionButtonCustom.module.css";
import { cloneElement, type JSX } from "react";

interface ITertiaryActionButtonCustomProps {
    onClick: () => void;
    label: string;
    icon?: JSX.Element;
    disabled?: boolean;
    classNameButton?: string;
}

const TertiaryActionButtonCustom = ({
    onClick,
    label,
    icon,
    disabled,
    classNameButton
}: ITertiaryActionButtonCustomProps) => {

    const iconWithClass = icon ? cloneElement(icon, {
        className: [StyleModule.tertiaryActionButtonCustomIcon, icon.props.className].filter(Boolean).join(" ")
    }) : null;

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={`${classNameButton} ${StyleModule.tertiaryActionButtonCustom}`}
            classNameLabel={`nunito-medium ${StyleModule.tertiaryActionButtonCustomLabel}`}
            classNameSpan={StyleModule.tertiaryActionButtonCustomSpan}
            {...(icon && { icon: iconWithClass })}
            disabled={disabled}
        />
    );
};


export default TertiaryActionButtonCustom;