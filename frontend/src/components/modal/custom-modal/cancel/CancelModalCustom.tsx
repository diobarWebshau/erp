import type { ReactNode } from "react";
import CustomModal from "../../customModal/CustomModal";
import StyleModule from "./CancelModalCustom.module.css";
import FadeButton from "../../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import { CircleX, X } from "lucide-react";
import WarningIcon from "../../../../../assets/icons/warning-icon.svg";

interface ICancelModalProps {
    onClose: () => void;
    icon: JSX.Element;
    onClickCancel: () => void;
}

const CancelModalCustom = ({
    onClose,
    icon,
    onClickCancel,
}: ICancelModalProps) => {



    const handleOnClickCancel = () => {
        console.log("handleOnClickCancel");
        onClose();
        onClickCancel();
    }

    return (
        <CustomModal
            onClose={onClose}
            title={'¿Seguro que deseas salir?'}
            message={'El avance de este proceso no se guardara.'}
            icon={icon}
            children={
                () => {
                    return (
                        <div className={StyleModule.containerChildrenCancelProcess}>
                            <FadeButton
                                label="Cancelar"
                                type="button"
                                typeOrderIcon="first"
                                classNameButton={StyleModule.cancelProcessButton}
                                classNameLabel={StyleModule.cancelProcessButtonLabel}
                                classNameSpan={StyleModule.cancelProcessButtonSpan}
                                icon={<CircleX className={StyleModule.cancelProcessButtonIcon} />}
                                onClick={onClose}
                            />
                            <FadeButton
                                label="Salir"
                                type="button"
                                typeOrderIcon="first"
                                classNameButton={StyleModule.exitProcessButton}
                                classNameLabel={StyleModule.exitProcessButtonLabel}
                                classNameSpan={StyleModule.exitProcessButtonSpan}
                                icon={<X className={StyleModule.exitProcessButtonIcon} />}
                                onClick={handleOnClickCancel}
                            />
                        </div>
                    );
                }
            }
        />
    );
};

export default CancelModalCustom;
