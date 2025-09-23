import {
    useContext,
    type Dispatch
} from "react";
import {
    InventoriesDispatchContext,
    InventoriesStateContext
} from "./inventoriesContext";
import type {
    InventoriesAction,
    InventoriesState
} from "./InventoriesTypes";

const useInventoriesState = (): InventoriesState => {
    const state = useContext(InventoriesStateContext);
    if (!state) {
        throw new Error(
            "useInventoriesState must be used within a ProviderInventories"
        );
    }
    return state;
};

const useInventoriesDispatch = (): Dispatch<InventoriesAction> => {
    const dispatch = useContext(InventoriesDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useInventoriesDispatch must be used within a ProviderInventories"
        );
    }
    return dispatch;
};

export {
    useInventoriesState,
    useInventoriesDispatch
};