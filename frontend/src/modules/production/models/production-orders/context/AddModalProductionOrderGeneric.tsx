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
    updated?: IPartialProductionOrder;
}

const ModalProductionOrderGeneric = ({
    children,
    mode,
    currentStep,
    totalSteps,
    data,
    updated
}: IModalProductionOrderGeneric) => {



    
    return (
        <ProviderAddModalProductionOrder
            mode={mode}
            currentStep={currentStep}
            totalSteps={totalSteps}
            {...{data: data}}
            {...{updated: updated}}
        >
            {children}
        </ProviderAddModalProductionOrder>
    );
};

export default ModalProductionOrderGeneric;
