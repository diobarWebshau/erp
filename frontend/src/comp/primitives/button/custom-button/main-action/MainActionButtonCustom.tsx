import { cloneElement, useMemo, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./MainActionButtonCustom.module.css";

interface IMainActionButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
    disabled?: boolean;
    classNameButton?: string;
    classNameSpan?: string;
    classNameLabel?: string;
}

const MainActionButtonCustom = ({
    onClick,
    label,
    icon,
    classNameButton,
    disabled,
    classNameSpan,
    classNameLabel
}: IMainActionButtonCustomProps) => {

    const [iconWithClass, buttonClassNames, spanClassNames, labelClassNames] = useMemo(() => {
        const buttonClassNames = `${StyleModule.mainActionButton} `+`${disabled ? StyleModule.mainActionButtonCustomDisabled : StyleModule.mainActionButtonCustom} ${classNameButton} `;
        const iconWithClass = icon && cloneElement(icon, {
            className: `${StyleModule.mainActionIcon} ${ disabled? StyleModule.mainActionButtonCustomIconDisabled : StyleModule.mainActionButtonCustomIcon } `
        });
        const spanClassNames = `${ classNameSpan } ${ StyleModule.mainActionButtonCustomSpan }`;
        const labelClassNames = `nunito-medium ${StyleModule.mainActionLabel} ${disabled ? StyleModule.mainActionButtonCustomLabelDisabled : StyleModule.mainActionButtonCustomLabel} ${classNameLabel} `;
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
            {...icon && { icon: iconWithClass }}
            disabled={disabled}
        />
    );
};

export default MainActionButtonCustom;
