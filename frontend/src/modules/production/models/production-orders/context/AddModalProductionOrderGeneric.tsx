import ProviderAddModalProductionOrder
    from "./AddModalProductionOrderProvider";
import type {
    ReactNode
} from "react";

interface IModalProductionOrderGeneric {
    children: ReactNode;
    mode: "create" | "update";
    currentStep: number;
    totalSteps: number;
}

const ModalProductionOrderGeneric = ({
    children,
    mode,
    currentStep,
    totalSteps
}: IModalProductionOrderGeneric) => {
    return (
        <ProviderAddModalProductionOrder
            mode={mode}
            currentStep={currentStep}
            totalSteps={totalSteps}
        >
            {children}
        </ProviderAddModalProductionOrder>
    );
};

export default ModalProductionOrderGeneric;
