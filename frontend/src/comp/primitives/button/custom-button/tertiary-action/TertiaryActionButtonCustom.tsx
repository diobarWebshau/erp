import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./TertiaryActionButtonCustom.module.css";
import { cloneElement, type JSX } from "react";

interface ITertiaryActionButtonCustomProps {
    onClick: () => void;
    label: string;
    icon?: JSX.Element;
}

const TertiaryActionButtonCustom = ({
    onClick,
    label,
    icon
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
            classNameButton={StyleModule.tertiaryActionButtonCustom}
            classNameLabel={StyleModule.tertiaryActionButtonCustomLabel}
            classNameSpan={StyleModule.tertiaryActionButtonCustomSpan}
            {...(icon && { icon: iconWithClass })}
        />
    );
};


export default TertiaryActionButtonCustom;