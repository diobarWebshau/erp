import {
    useContext,
    type Dispatch
} from "react";
import {
    AddModalProductionOrderDispatchContext,
    AddModalProductionOrderStateContext
} from "./AddModalProductionOrderContext";
import type {
    AddModalProductionOrderAction,
    AddModalProductionOrderState
} from "./AddModalProductionOrderTypes";

const useAddModalProductionOrderState = (): AddModalProductionOrderState => {
    const state = useContext(AddModalProductionOrderStateContext);
    if (!state) {
        throw new Error(
            "useAddModalProductionOrderState must be used within a ProviderAddModalProductionOrder"
        );
    }
    return state;
};

const useAddModalProductionOrderDispatch = (): Dispatch<AddModalProductionOrderAction> => {
    const dispatch = useContext(AddModalProductionOrderDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useAddModalProductionOrderDispatch must be used within a ProviderAddModalProductionOrder"
        );
    }
    return dispatch;
};

export {
    useAddModalProductionOrderState,
    useAddModalProductionOrderDispatch
};
