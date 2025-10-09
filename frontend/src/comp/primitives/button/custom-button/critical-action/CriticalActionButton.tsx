import { useMemo, type JSX } from "react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./CriticalActionButton.module.css";
import withClassName from "../../../../../utils/withClassName";
import { CircleX } from "lucide-react";

interface ICriticalActionButtonProps {
    onClick: () => void;
    label: string;
    icon?: JSX.Element;
    classNameButton?: string;
    disabled?: boolean;
    classNameSpan?: string;
    classNameLabel?: string;
}

const CriticalActionButton = ({
    onClick,
    label,
    icon,
    classNameButton,
    disabled,
    classNameSpan,
    classNameLabel
}: ICriticalActionButtonProps) => {

    const [iconWithClass, buttonClassNames, spanClassNames, labelClassNames] = useMemo(() => {
        const buttonClassNames = `${StyleModule.criticalActionButton} ` + `${disabled ? StyleModule.criticalActionButtonDisabled : StyleModule.criticalActionButtonCustomEnabled} ${classNameButton} `;
        const iconFinal = icon ? icon : <CircleX />;
        const iconWithClass = withClassName(iconFinal, `${StyleModule.criticalActionButtonIcon} ${disabled ? StyleModule.criticalActionButtonIconDisabled : StyleModule.criticalActionButtonIconEnabled} `);
        const spanClassNames = `${classNameSpan} ${StyleModule.criticalActionButtonCustomSpan}`;
        const labelClassNames = `nunito-medium ${StyleModule.criticalActionButtonLabel} ${disabled ? StyleModule.criticalActionButtonCustomLabelDisabled : StyleModule.criticalActionButtonCustomLabelEnabled} ${classNameLabel} `;
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

export default CriticalActionButton;