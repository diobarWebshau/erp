import type { ReactNode } from "react";
import StylesModule from "./FullContainerModal.module.css";

interface IFullContainerModal {
    children?: ReactNode;
}

const FullContainerModal = ({
    children
}: IFullContainerModal) => {
    return (
        <div className={StylesModule.container}>
            {children}
        </div>
    );
}

export default FullContainerModal;
