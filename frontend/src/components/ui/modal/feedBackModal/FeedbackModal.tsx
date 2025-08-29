import type {
    SetStateAction,
    Dispatch,
    ReactNode,
} from "react";
import {
    X
} from "lucide-react";
import stylesModules
    from "./FeedbackModal.module.css";

interface IFeedbackModalProps {
    onClose: Dispatch<SetStateAction<boolean>>
    title?: string | null,
    message?: string | null,
    icon?: ReactNode | null
}

const FeedbackModal = (
    {
        onClose,
        title = null,
        message = null,
        icon = null
    }: IFeedbackModalProps
) => {

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
                        icon && icon
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


