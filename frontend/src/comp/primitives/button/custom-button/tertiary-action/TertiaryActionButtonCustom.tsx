import withClassName from "../../../../../utils/withClassName";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./TertiaryActionButtonCustom.module.css";
import { useMemo, type JSX } from "react";

interface ITertiaryActionButtonCustomProps {
    onClick: () => void;
    label: string;
    icon?: JSX.Element;
    disabled?: boolean;
    classNameButton?: string;
    classNameSpan?: string;
    classNameLabel?: string;
}

const TertiaryActionButtonCustom = ({
    onClick,
    label,
    icon,
    disabled,
    classNameButton,
    classNameSpan,
    classNameLabel
}: ITertiaryActionButtonCustomProps) => {

    const [iconWithClass, buttonClassNames, spanClassNames, labelClassNames] = useMemo(() => {
        const buttonClassNames = `${StyleModule.tertiaryActionButtonCustom} ` + `${disabled ? StyleModule.tertiaryActionButtonCustomDisabled : StyleModule.tertiaryActionButtonCustomEnabled} ${classNameButton} `;
        const iconWithClass = icon ? withClassName(icon, `${StyleModule.tertiaryActionButtonCustomIcon} ${disabled ? StyleModule.tertiaryActionButtonCustomIconDisabled : StyleModule.tertiaryActionButtonCustomIconEnabled} `) : null;
        const spanClassNames = `${classNameSpan} ${StyleModule.tertiaryActionButtonCustomSpan}`;
        const labelClassNames = `nunito-medium ${StyleModule.tertiaryActionButtonCustomLabel} ${disabled ? StyleModule.tertiaryActionButtonCustomLabelDisabled : StyleModule.tertiaryActionButtonCustomLabelEnabled} ${classNameLabel} `;
        return [iconWithClass, buttonClassNames, spanClassNames, labelClassNames];
    }, [icon, disabled, classNameButton, classNameSpan, classNameLabel, classNameSpan])

    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={buttonClassNames}
            classNameLabel={labelClassNames}
            classNameSpan={spanClassNames}
            {...(icon && { icon: iconWithClass })}
            disabled={disabled}
        />
    );
};


export default TertiaryActionButtonCustom;