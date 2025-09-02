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
    initialState
} from "./AddModalProductionOrderReducer";
import {
    useReducer,
    type Dispatch,
    type ReactNode
} from "react";


const ProviderAddModalProductionOrder = ({
    children
}: { children: ReactNode }) => {

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