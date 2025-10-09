import { useMemo, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./TransparentButtonCustom.module.css";
import withClassName from "../../../../../utils/withClassName";


interface ITransparentButtonCustomProps {
    onClick: () => void;
    label: string;
    icon: JSX.Element;
    classNameButton?: string;
    classNameSpan?: string;
    disabled?: boolean;
    classNameLabel?: string;

}

const TransparentButtonCustom = ({
    onClick,
    label,
    icon,
    classNameButton,
    classNameSpan,
    disabled,
    classNameLabel
}: ITransparentButtonCustomProps) => {

    const [iconWithClass, buttonClassNames, spanClassNames, labelClassNames] = useMemo(() => {
        const buttonClassNames = `${StyleModule.transparentActionButtonCustom} ` + `${disabled ? StyleModule.transparentActionButtonCustomDisabled : StyleModule.transparentActionButtonCustomEnabled} ${classNameButton} `;
        const iconWithClass = icon ? withClassName(icon, `${StyleModule.transparentActionButtonCustomIcon} ${disabled ? StyleModule.transparentActionButtonCustomIconDisabled : StyleModule.transparentActionButtonCustomIconEnabled} `) : null;
        const spanClassNames = `${classNameSpan} ${StyleModule.transparentActionButtonCustomSpan}`;
        const labelClassNames = `nunito-medium ${StyleModule.transparentActionButtonCustomLabel} ${disabled ? StyleModule.transparentActionButtonCustomLabelDisabled : StyleModule.transparentActionButtonCustomLabelEnabled} ${classNameLabel} `;
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

        />
    )
}

export default TransparentButtonCustom  
