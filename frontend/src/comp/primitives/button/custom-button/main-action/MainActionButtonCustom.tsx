import { useMemo, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./MainActionButtonCustom.module.css";
import withClassName from "../../../../../utils/withClassName";

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
        const buttonClassNames = `${StyleModule.mainActionButton} `+`${disabled ? StyleModule.mainActionButtonCustomDisabled : StyleModule.mainActionButtonCustomEnabled} ${classNameButton} `;
        const iconWithClass = icon ? withClassName(icon, `${StyleModule.mainActionIcon} ${ disabled? StyleModule.mainActionButtonCustomIconDisabled : StyleModule.mainActionButtonCustomIconEnabled } `) : null;
        const spanClassNames = `${ classNameSpan } ${ StyleModule.mainActionButtonCustomSpan }`;
        const labelClassNames = `nunito-medium ${StyleModule.mainActionLabel} ${disabled ? StyleModule.mainActionButtonCustomLabelDisabled : StyleModule.mainActionButtonCustomLabelEnabled} ${classNameLabel} `;
        return [iconWithClass, buttonClassNames, spanClassNames, labelClassNames];
    }, [icon, disabled, classNameButton, classNameSpan, classNameLabel])

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
