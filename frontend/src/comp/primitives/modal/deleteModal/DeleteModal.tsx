import CriticalActionButton from "../../../primitives/button/custom-button/critical-action/CriticalActionButton";
import MainActionButtonCustom from "../../../primitives/button/custom-button/main-action/MainActionButtonCustom";
import WarningIcon from "../../../../components/icons/WarningIcon";
import BaseModal from "../baseGenericModal/BaseModal";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import stylesModules from "./DeleteModal.module.css";

interface IDeleteModalProps {
    onClose: () => void,
    onDelete: (() => (void | Promise<boolean>)),
    title?: string | null,
    message?: string | null,
}
const DeleteModal = ({
    onClose,
    onDelete,
    title = null,
    message = null,
}: IDeleteModalProps) => {
    const [loading, setLoading] = useState(false);

    const handleDeleteClick = async () => {
        try {
            setLoading(true);
            const result = onDelete(); // void | Promise<boolean>
            if (result instanceof Promise) {
                const ok = await result;
                if (ok === false) return; // el caller decide no cerrar
                onClose();
            } else {
                // sincrono
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            onClose={onClose}
            className={stylesModules.container}
            classNameCustomContainer={stylesModules.containerCustom}
        >
            <button
                className={stylesModules.closeButton}
                onClick={onClose}
                disabled={loading}
            >
                <X className={stylesModules.icon} />
            </button>

            <div className={stylesModules.containerWarningIcon}>
                <WarningIcon className={stylesModules.warningIcon} />
            </div>

            <div className={stylesModules.content}>
                <h2 className={`nunito-bold ${stylesModules.title}`}>{title}</h2>
                <p className="nunito-semibold">{message}</p>
            </div>

            <div className={`nunito-semibold ${stylesModules.containerButtons}`}>
                <CriticalActionButton
                    label="Cancelar"
                    onClick={onClose}
                    disabled={loading}
                />
                <MainActionButtonCustom
                    icon={<Trash2 />}
                    label={loading ? "Eliminando..." : "Eliminar"}
                    onClick={handleDeleteClick}
                    classNameButton={stylesModules.buttonDelete}
                    classNameLabel={stylesModules.buttonDeleteLabel}
                    disabled={loading}
                />
            </div>
        </BaseModal>
    );
};

export default DeleteModal;


