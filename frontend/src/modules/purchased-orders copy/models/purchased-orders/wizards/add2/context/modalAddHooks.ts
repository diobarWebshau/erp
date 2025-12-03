import {
    useContext,
    type Dispatch
} from  "react";
import {
    ModalAddDispatchContext,
    ModalAddStateContext
} from "./modalAddContext";
import type {
    ModalAddAction,
    ModalAddState
} from "./modalAddTypes";

const useModalAddState = (): ModalAddState => {
    const state = useContext(ModalAddStateContext);
    if (!state) {
        throw new Error(
            "useModalAddState must be used within a ProviderModalAdd"
        );
    }
    return state;
};

const useModalAddDispatch = (): Dispatch<ModalAddAction> => {
    const dispatch = useContext(ModalAddDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useModalAddDispatch must be used within a ProviderModalAdd"
        );
    }
    return dispatch;
};


export {
    useModalAddState,
    useModalAddDispatch
};