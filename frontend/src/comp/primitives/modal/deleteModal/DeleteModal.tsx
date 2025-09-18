
import {
    useSelector,
} from "react-redux";
import type {
    RootState
} from "../../../../store/store";
import stylesModules
    from "./DeleteModal.module.css";
import {
    CircleX, Trash2, X
} from "lucide-react";
import FadeButton
    from "../../../../components/ui/table/components/gui/button/fade-button/FadeButton";
import WarningIcon
    from "../../../../components/icons/WarningIcon";
import BaseModal from "../baseGenericModal/BaseModal";

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

    const validation =
        useSelector((state: RootState) => state.error)
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
                {
                    Object.keys(validation).length > 0 &&
                    <div
                        className={stylesModules.error}
                    >
                        {
                            Object.keys(validation).map((key) => {
                                const errorValue = validation[key];
                                if (!errorValue) return null;
                                if (Array.isArray(errorValue)) {
                                    return errorValue.map((msg, index) => (
                                        <small key={`${key}-${index}`}>{msg}</small>
                                    ));
                                }
                                return <small key={key}>{errorValue}</small>;
                            })
                        }
                    </div>
                }
            </div>
            <div className={`nunito-semibold ${stylesModules.containerButtons}`}>
                <FadeButton
                    classNameButton={stylesModules.cancelButton}
                    classNameSpan={stylesModules.cancelButtonSpan}
                    classNameLabel={stylesModules.cancelButtonLabel}
                    label="Cancel"
                    onClick={onClose}
                    typeOrderIcon="first"
                    icon={<CircleX className={stylesModules.iconCancel} />}
                />
                <FadeButton
                    classNameButton={stylesModules.deleteButton}
                    classNameSpan={stylesModules.deleteButtonSpan}
                    classNameLabel={stylesModules.deleteButtonLabel}
                    label="Delete"
                    onClick={onDelete}
                    typeOrderIcon="first"
                    icon={<Trash2 className={stylesModules.iconDelete} />}
                />
            </div>
        </BaseModal>
    );
}

export default DeleteModal;


