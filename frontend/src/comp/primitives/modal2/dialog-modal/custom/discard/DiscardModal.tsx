
import type { JSX } from "react";
import DialogModal from "../../base/DialogModal";
import stylesModules from "./DiscardModal.module.css";
import { cloneElement } from "react";
import TertiaryActionButtonCustom from "../../../../button/custom-button/tertiary-action/TertiaryActionButtonCustom";
import MainActionButtonCustom from "../../../../button/custom-button/main-action/MainActionButtonCustom";
import { CircleX, UndoIcon } from "lucide-react";

interface IDiscardModal {
    onClose: () => void;
    onDiscard: () => void;
    title?: string;
    message?: string;
    icon?: JSX.Element;
    classNameContainerSize?: string;
}

const DiscardModal = ({
    onClose,
    onDiscard,
    title,
    message,
    icon = <UndoIcon />,
    classNameContainerSize,
}: IDiscardModal) => {

    const iconWithClass = icon && cloneElement(icon as JSX.Element, {
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
                <div className={stylesModules.containerButtons}>
                    <TertiaryActionButtonCustom
                        label="Cancelar"
                        onClick={onClose}
                        icon={<CircleX />}
                    />
                    <MainActionButtonCustom
                        label="Descartar"
                        onClick={onDiscard}
                        icon={<UndoIcon />}
                    />
                </div>
            </div>
        </DialogModal>
    );
}

export default DiscardModal;
