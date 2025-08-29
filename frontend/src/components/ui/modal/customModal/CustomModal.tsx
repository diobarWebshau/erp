import type {
    SetStateAction,
    Dispatch,
    ReactNode,
    MouseEvent,
} from "react";
import {
    X
} from "lucide-react";
import stylesModules
    from "./CustomModal.module.css";
import { createPortal } from "react-dom";

interface ICustomModalProps<T> {
    onClose: (e: MouseEvent<HTMLButtonElement>) => void;
    title?: string | null,
    message?: string | null,
    icon?: ReactNode | null,
    children?: (args?: T) => ReactNode | ReactNode
    childrenProps?: T
}

const CustomModal = <T,>(
    {
        onClose,
        title = null,
        message = null,
        icon = null,
        children = () => null,
        childrenProps
    }: ICustomModalProps<T>
) => {

    return createPortal(
        <div className={stylesModules.overlay}>
            <div className={stylesModules.container}>
                <button
                    className={stylesModules.closeButton}
                    onClick={onClose}
                >
                    <X className={stylesModules.icon} />
                </button>
                <section className={stylesModules.containerIcon} >
                    {
                        icon && icon
                    }
                </section>
                <section className={stylesModules.containerTitle}>
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
                </section>
                <section className={stylesModules.customContainer}>
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

export default CustomModal;


