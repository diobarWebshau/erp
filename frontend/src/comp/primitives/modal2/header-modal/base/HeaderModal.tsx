import type { ReactNode } from "react";
import { X } from "lucide-react";
import stylesModules from "./HeaderModal.module.css";
import { createPortal } from "react-dom";

interface IDialogModalProps<T> {
    onClose: () => void;
    children?: ((args?: T) => ReactNode) | ReactNode;
    title?: string;
    childrenProps?: T
    className?: string
    classNameCustomContainer?: string
}

const HeaderModal = <T,>(
    {
        onClose,
        children = () => null,
        title,
        childrenProps,
        className = "",
        classNameCustomContainer = ""
    }: IDialogModalProps<T>
) => {

    return createPortal(
        <div className={stylesModules.overlay}>
            <div className={`${stylesModules.container} ${className}`}>
                <section className={stylesModules.headerContainer}>
                    <h2 className="nunito-bold">{title}</h2>
                    <button
                        className={stylesModules.closeButton}
                        onClick={onClose}
                        type="button"
                    >
                        <X className={stylesModules.icon} />
                    </button>
                </section>
                <div className={`${stylesModules.customContainer} ${classNameCustomContainer}`}>
                    {
                        typeof children === "function"
                            ? children(childrenProps)
                            : children
                    }
                </div>
            </div>
        </div>
        ,
        document.body
    );
}

export default HeaderModal;


