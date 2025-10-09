import { memo, useMemo } from "react";
import StyleModule from "./FadeButton.module.css"

interface FadeButtonProps {
    label?: string;
    icon?: React.ReactNode;
    onClick?: ((e: React.MouseEvent<HTMLButtonElement>) => void) | (() => void);
    disabled?: boolean;
    classNameButton?: string;
    classNameIcon?: string;
    classNameLabel?: string;
    classNameSpan?: string;
    type?: "button" | "submit" | "reset";
    typeOrderIcon?: "first" | "last";
}

const FadeButton = memo(({
    label,
    icon,
    onClick,
    disabled,
    classNameButton = "",
    classNameLabel = "",
    classNameSpan = "",
    type = "button",
    typeOrderIcon = "last",
}: FadeButtonProps) => {

    const [classNamesButton, classNamesSpan, classNamesLabel] = useMemo(() => {
        const classNamesButton = `${StyleModule.fadeButton} ` + `${classNameButton} `;
        const classNamesSpan = `${StyleModule.fadeButtonSpan} ` + `${classNameSpan} `;
        const classNamesLabel = `${StyleModule.fadeButtonLabel} ` + `${classNameLabel} `;
        return [classNamesButton, classNamesSpan, classNamesLabel];
    }, [classNameButton, classNameLabel, classNameSpan]);

    return (
        <button
            className={classNamesButton}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            <span className={classNamesSpan}>
                {typeOrderIcon === "first" && icon}
                {label && <span className={classNamesLabel}>{label}</span>}
                {typeOrderIcon === "last" && icon}
            </span>
        </button>
    )
});

export default FadeButton