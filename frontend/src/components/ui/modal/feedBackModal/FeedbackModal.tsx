import {
    type SetStateAction,
    type Dispatch,
    type JSX,
    cloneElement,
} from "react";
import {
    X
} from "lucide-react";
import stylesModules
    from "./FeedbackModal.module.css";

interface IFeedbackModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    title?: string
    message?: string
    icon?: JSX.Element
}

const FeedbackModal = (
    {
        onClose,
        title,
        message,
        icon
    }: IFeedbackModalProps
) => {

    // Clonamos el icono y le agregamos la clase deseada
    const iconWithClass = icon && cloneElement(icon, {
        className: [stylesModules.icon, icon.props.className].filter(Boolean).join(" ")
    });


    return (
        <div className={stylesModules.overlay}>
            <div className={stylesModules.container}>
                <button
                    className={stylesModules.closeButton}
                    onClick={() => onClose(false)}
                >
                    <X className={stylesModules.icon} />
                </button>
                <div className={stylesModules.containerCheckIcon} >
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
            </div>
        </div>
    );
}

export default FeedbackModal;


