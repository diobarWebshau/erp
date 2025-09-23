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

const FadeButton = ({
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
    // Aseguramos que si el icono es un ReactElement válido, le pasamos className
    // const styledIcon =
    //     isValidElement(icon) && cloneElement(icon as ReactElement<any>, {
    //         className: `${StyleModule.icon} ${classNameIcon}`,
    //     });

    return (
        <button
            className={`${StyleModule.fadeButton} ${classNameButton}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            <span className={`nunito-medium ${StyleModule.fadeButtonSpan} ${classNameSpan}`}>
                {typeOrderIcon === "first" && icon}
                {label && <span className={classNameLabel}>{label}</span>}
                {typeOrderIcon === "last" && icon}
            </span>
        </button>
    )
}

export default FadeButton