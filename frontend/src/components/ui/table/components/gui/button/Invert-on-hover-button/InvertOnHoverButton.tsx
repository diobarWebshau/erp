import StyleModule from "./InvertOnHoverButton.module.css";
import {
    type ReactElement,
    type MouseEvent,
    isValidElement,
    cloneElement
} from "react";

interface ToggleInverseButtonProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
    typeOrderIcon?: "first" | "last";
    classNameIcon?: string;
    classNameLabel?: string;
    classNameSpan?: string;
    classNameButton?: string;
}

const InvertOnHoverButton = ({
    label,
    icon,
    onClick,
    disabled,
    classNameButton = "",
    classNameLabel = "",
    classNameSpan = "",
    type = "button",
    typeOrderIcon = "last",
}: ToggleInverseButtonProps) => {
    return (
        <button
            className={`${StyleModule.toggleInverseButton} ${classNameButton}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            <span className={`${StyleModule.toggleInverseButtonSpan} ${classNameSpan}`}>
                {typeOrderIcon === "first" && icon}
                <span className={`${StyleModule.toggleInverseButtonLabel} ${classNameLabel}`}>{label}</span>
                {typeOrderIcon === "last" && icon}
            </span>
        </button>
    );
};

export default InvertOnHoverButton;
