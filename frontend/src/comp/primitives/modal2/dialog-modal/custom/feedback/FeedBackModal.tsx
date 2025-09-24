import { cloneElement } from "react";
import type { JSX } from "react";
import DialogModal from "../../base/DialogModal";
import stylesModules from "./FeedBackModal.module.css";

interface IFeedBackModalProps {
    onClose: () => void;
    title?: string;
    message?: string;
    icon?: JSX.Element;
    classNameContainerSize?: string;
}

const FeedBackModal = ({
    onClose,
    title,
    message,
    icon,
    classNameContainerSize
}: IFeedBackModalProps) => {

    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = icon && cloneElement(icon, {
        className: [stylesModules.icon, icon.props.className].filter(Boolean).join(" ")
    });

    return (
        <DialogModal
            onClose={onClose}
            className={`${classNameContainerSize} ${stylesModules.containerDialogModal}`}
            classNameCustomContainer={stylesModules.containerCustomDialogModal}
        >
            <div className={stylesModules.containerIcon} >
                {
                    icon && iconWithClass
                }
            </div>
            <div className={stylesModules.content}>
                {
                    title &&
                    <h2 className={`nunito-bold ${stylesModules.title}`}>
                        {title}
                    </h2>
                }
                {
                    message &&
                    <p className="nunito-semibold">
                        {message}
                    </p>
                }
            </div>
        </DialogModal>
    );
}

export default FeedBackModal;
