import {
    useContext,
    type Dispatch
} from  "react";
import {
    ModalEditDispatchContext,
    ModalEditStateContext
} from "./modalEditContext";
import type {
    ModalEditAction,
    ModalEditState
} from "./modalEditTypes";

const useModalEditState = (): ModalEditState => {
    const state = useContext(ModalEditStateContext);
    if (!state) {
        throw new Error(
            "useModalEditState must be used within a ProviderModalEdit"
        );
    }
    return state;
};

const useModalEditDispatch = (): Dispatch<ModalEditAction> => {
    const dispatch = useContext(ModalEditDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useModalEditDispatch must be used within a ProviderModalEdit"
        );
    }
    return dispatch;
};


export {
    useModalEditState,
    useModalEditDispatch
};