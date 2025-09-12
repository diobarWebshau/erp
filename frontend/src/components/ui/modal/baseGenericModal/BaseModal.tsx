import type {
    ReactNode,
} from "react";
import {
    X
} from "lucide-react";
import stylesModules
    from "./BaseModal.module.css";
import { createPortal } from "react-dom";

interface IBaseModalProps<T> {
    onClose: () => void;
    children?: ((args?: T) => ReactNode) | ReactNode;
    childrenProps?: T
    className?: string
    classNameCustomContainer?: string
}

const BaseModal = <T,>(
    {
        onClose,
        children = () => null,
        childrenProps,
        className="",
        classNameCustomContainer=""
    }: IBaseModalProps<T>
) => {

    return createPortal(
        <div className={stylesModules.overlay}>
            <div className={`${stylesModules.container} ${className}`}>
                <button
                    className={stylesModules.closeButton}
                    onClick={onClose}
                    type="button"
                >
                    <X className={stylesModules.icon} />
                </button>
                <section className={`${stylesModules.customContainer} ${classNameCustomContainer}`}>
                    {
                        typeof children === "function"
                            ? children(childrenProps)
                            : children
                    }
                </section>
            </div>
        </div>
        ,
        document.body
    );
}

export default BaseModal;


