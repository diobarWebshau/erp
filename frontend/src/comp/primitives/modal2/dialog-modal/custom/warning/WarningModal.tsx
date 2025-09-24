import WarningIcon from "../../../../../../components/icons/WarningIcon";
import MainActionButtonCustom from "../../../../button/custom-button/main-action/MainActionButtonCustom";
import DialogModal from "../../base/DialogModal";
import { X } from "lucide-react";
import stylesModules from "./WarningModal.module.css";
import CriticalActionButton from "../../../../button/custom-button/critical-action/CriticalActionButton";

interface IWarningModalProps {
    onClose: () => void;
    onLeave: () => void;
}

const WarningModal = ({
    onClose,
    onLeave
}: IWarningModalProps) => {
    return (
        <DialogModal onClose={onClose}
            className={stylesModules.containerDialogModal}
            classNameCustomContainer={stylesModules.containerCustomDialogModal}
        >
            <div className={stylesModules.containerMain}>
                <div className={stylesModules.containerIcon} >
                    <WarningIcon className={stylesModules.icon} />
                </div>
                <div className={stylesModules.content}>
                    <h2 className={`nunito-bold ${stylesModules.title}`}>
                        ¿Seguro que deseas salir?
                    </h2>
                    <p className="nunito-semibold">
                        El avance de este proceso no se guardara.
                    </p>
                </div>
            </div>
            <div className={`nunito-semibold ${stylesModules.containerButtons}`}>
                <CriticalActionButton
                    onClick={onClose}
                    label="Cancelar"
                />
                <MainActionButtonCustom
                    onClick={onLeave}
                    label="Salir"
                    icon={<X />}
                />
            </div>
        </DialogModal>
    );
}

export default WarningModal;
