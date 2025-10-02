import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./CriticalActionButton.module.css";
import { CircleX } from "lucide-react";

interface ICriticalActionButtonProps {
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
    classNameButton?: string;
}

const CriticalActionButton = ({ onClick, label, icon, classNameButton }: ICriticalActionButtonProps) => {
    return (
        <FadeButton
            label={label}
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={`${StyleModule.criticalActionButton} ${classNameButton}`}
            classNameLabel={`nunito-medium ${StyleModule.criticalActionButtonLabel}`}
            classNameSpan={StyleModule.criticalActionButtonSpan}
            icon={icon ?? <CircleX className={StyleModule.criticalActionButtonIcon} />}
        />
    );
};

export default CriticalActionButton;