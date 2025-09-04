import type {
    AddModalProductionOrderState,
    AddModalProductionOrderAction
} from "./AddModalProductionOrderTypes";
import {
    AddModalProductionOrderStateContext,
    AddModalProductionOrderDispatchContext
} from "./AddModalProductionOrderContext";
import {
    AddModalProductionOrderReducer,
} from "./AddModalProductionOrderReducer";
import {
    useReducer,
    type Dispatch,
    type ReactNode
} from "react";

interface IProviderAddModalProductionOrder {
    mode: "create" | "update";
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
}


const ProviderAddModalProductionOrder = ({
    mode,
    currentStep,
    totalSteps,
    children,
}: IProviderAddModalProductionOrder) => {

    const initialState: AddModalProductionOrderState = {
        mode: mode,
        current_step: currentStep,
        total_steps: totalSteps,
        data: {},
    }

    const [state, dispatch]: [AddModalProductionOrderState, Dispatch<AddModalProductionOrderAction>] =
        useReducer(AddModalProductionOrderReducer, initialState);

    return (
        <AddModalProductionOrderStateContext.Provider value={state}>
            <AddModalProductionOrderDispatchContext.Provider value={dispatch}>
                {children}
            </AddModalProductionOrderDispatchContext.Provider>
        </AddModalProductionOrderStateContext.Provider>
    );
}

export default ProviderAddModalProductionOrder;