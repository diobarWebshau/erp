import { Trash2, X } from "lucide-react";
import WarningIcon from "../../../../components/icons/WarningIcon";
import BaseModal from "../baseGenericModal/BaseModal";
import CriticalActionButton from "../../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import stylesModules from "./DeleteModal.module.css";

interface IDeleteModalProps {
    onClose: () => void,
    onDelete: () => void,
    title?: string | null,
    message?: string | null,
}

const DeleteModal = (
    {
        onClose,
        onDelete,
        title = null,
        message = null,
    }: IDeleteModalProps
) => {
    return (
        <BaseModal
            onClose={onClose}
            className={stylesModules.container}
            classNameCustomContainer={stylesModules.containerCustom}
        >
            <button
                className={stylesModules.closeButton}
                onClick={onClose}
            >
                <X className={stylesModules.icon} />
            </button>
            <div className={stylesModules.containerWarningIcon} >
                <WarningIcon
                    className={stylesModules.warningIcon}
                />
            </div>
            <div className={stylesModules.content}>

                <h2 className={`nunito-bold ${stylesModules.title}`}>
                    {title}
                </h2>
                <p className="nunito-semibold">
                    {message}
                </p>
            </div>
            <div className={`nunito-semibold ${stylesModules.containerButtons}`}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onClose}
                />
                <MainActionButtonCustom
                    icon={<Trash2 />}
                    label="Eliminar"
                    onClick={onDelete}
                    classNameButton={stylesModules.buttonDelete}
                    classNameLabel={stylesModules.buttonDeleteLabel}

                />
            </div>
        </BaseModal>
    );
}

export default DeleteModal;


