import { useMemo, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import withClassName from "../../../../../utils/withClassName";
import StyleModule from "./SecundaryActionButtonCustom.module.css";


interface ISecundaryActionButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
    disabled?: boolean;
    classNameButton?: string;
    classNameSpan?: string;
    classNameLabel?: string;
}

const SecundaryActionButtonCustom = ({
    onClick,
    label,
    icon,
    disabled,
    classNameButton,
    classNameSpan,
    classNameLabel
}: ISecundaryActionButtonCustomProps) => {

    const [iconWithClass, buttonClassNames, spanClassNames, labelClassNames] = useMemo(() => {
        const buttonClassNames = `${StyleModule.secundaryActionButtonCustom} ` + `${disabled ? StyleModule.secundaryActionButtonCustomDisabled : StyleModule.secundaryActionButtonCustomEnabled} ${classNameButton} `;
        const iconWithClass = icon ? withClassName(icon, `${StyleModule.secundaryActionButtonCustomIcon} ${disabled ? StyleModule.secundaryActionButtonCustomIconDisabled : StyleModule.secundaryActionButtonCustomIconEnabled} `) : null;
        const spanClassNames = `${classNameSpan} ${StyleModule.secundaryActionButtonCustomSpan}`;
        const labelClassNames = `nunito-medium ${StyleModule.secundaryActionButtonCustomLabel} ${disabled ? StyleModule.secundaryActionButtonCustomLabelDisabled : StyleModule.secundaryActionButtonCustomLabelEnabled} ${classNameLabel} `;
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
            icon={iconWithClass}
        />
    );
};

export default SecundaryActionButtonCustom;
