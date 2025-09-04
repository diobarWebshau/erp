import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./CancelButton.module.css";
import { CircleX } from "lucide-react";

interface ICancelButtonCustomProps {
    onClick: () => void;
}

const CancelButtonCustom = ({ onClick }: ICancelButtonCustomProps) => {
    return (
        <FadeButton
            label="Cancelar"
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.cancelButton}
            classNameLabel={StyleModule.cancelButtonLabel}
            classNameSpan={StyleModule.cancelButtonSpan}
            icon={<CircleX className={StyleModule.cancelButtonIcon} />}
        />
    );
};

export default CancelButtonCustom;