import type { IPartialProductionOrder } from "../../../../../interfaces/productionOrder";
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
    data?: IPartialProductionOrder;
    draft?: IPartialProductionOrder;
}

const ModalProductionOrderGeneric = ({
    children,
    mode,
    currentStep,
    totalSteps,
    data,
    draft
}: IModalProductionOrderGeneric) => {
    
    return (
        <ProviderAddModalProductionOrder
            mode={mode}
            currentStep={currentStep}
            totalSteps={totalSteps}
            {...{data: data}}
            {...{draft: draft}}
        >
            {children}
        </ProviderAddModalProductionOrder>
    );
};

export default ModalProductionOrderGeneric;
