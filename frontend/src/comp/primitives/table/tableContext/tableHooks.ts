import {
    useContext,
    type Dispatch
} from "react";
import {
    TableDispatchContext,
    TableStateContext
} from "./tableContext";
import type {
    TableAction,
    TableState
} from "./tableTypes";

const useTableState = (): TableState => {
    const state = useContext(TableStateContext);
    if (!state) {
        throw new Error(
            "useTableState must be used within a ProviderTableContext"
        );
    }
    return state;
}

const useTableDispatch = (): Dispatch<TableAction> => {
    const dispatch = useContext(TableDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useTableDispatch must be used within a ProviderTableContext"
        );
    }
    return dispatch;
}

export {
    useTableState,
    useTableDispatch
}