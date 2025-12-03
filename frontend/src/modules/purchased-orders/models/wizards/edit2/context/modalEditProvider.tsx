import {
    ModalEditStateContext,
    ModalEditDispatchContext
} from "./modalEditContext";
import {
    modalEditReducer,
    initialState
} from "./ModalEditReducer";
import type {
    ModalEditState,
    ModalEditAction
} from "./modalEditTypes";
import {
    useReducer,
    type Dispatch,
    type ReactNode
} from "react";


const ProviderModalAdd = ({
    children
}: { children: ReactNode }) => {

    const [state, dispatch]: [ModalEditState, Dispatch<ModalEditAction>] =
        useReducer(modalEditReducer, initialState);

    return (
        <ModalEditStateContext.Provider value={state}>
            <ModalEditDispatchContext.Provider value={dispatch}>
                {children}
            </ModalEditDispatchContext.Provider>
        </ModalEditStateContext.Provider>

    );
}

export default ProviderModalAdd;

