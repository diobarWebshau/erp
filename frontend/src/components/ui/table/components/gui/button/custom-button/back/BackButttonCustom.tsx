import { ChevronLeft } from "lucide-react";
import FadeButton from "../../fade-button/FadeButton";
import StyleModule from "./BackButtonCustom.module.css";

interface IBackButtonCustomProps {
    onClick: () => void;
}

const BackButtonCustom = ({
    onClick
}: IBackButtonCustomProps) => {
    return (
        <FadeButton
            label="Regresar"
            onClick={onClick}
            type="button"
            typeOrderIcon="first"
            classNameButton={StyleModule.backButton}
            classNameLabel={StyleModule.backButtonLabel}
            classNameSpan={StyleModule.backButtonSpan}
            icon={<ChevronLeft className={StyleModule.backButtonIcon} />}
        />
    );
};


export default BackButtonCustom;