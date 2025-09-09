import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./CriticalActionButton.module.css";
import { CircleX } from "lucide-react";

interface ICriticalActionButtonProps {
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
}

const CriticalActionButton = ({ onClick, label, icon }: ICriticalActionButtonProps) => {
    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.criticalActionButton}
            classNameLabel={StyleModule.criticalActionButtonLabel}
            classNameSpan={StyleModule.criticalActionButtonSpan}
            icon={icon ?? <CircleX className={StyleModule.criticalActionButtonIcon} />}
        />
    );
};

export default CriticalActionButton;