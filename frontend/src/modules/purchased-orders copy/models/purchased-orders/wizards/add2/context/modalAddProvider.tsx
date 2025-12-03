import {
    ModalAddStateContext,
    ModalAddDispatchContext
} from "./modalAddContext";
import {
    modalAddReducer,
    initialState
} from "./ModalAddReducer";
import type {
    ModalAddState,
    ModalAddAction
} from "./modalAddTypes";
import {
    useReducer,
    type Dispatch,
    type ReactNode
} from "react";


const ProviderModalAdd = ({
    children
}: { children: ReactNode }) => {

    const [state, dispatch]: [ModalAddState, Dispatch<ModalAddAction>] =
        useReducer(modalAddReducer, initialState);

    return (
        <ModalAddStateContext.Provider value={state}>
            <ModalAddDispatchContext.Provider value={dispatch}>
                {children}
            </ModalAddDispatchContext.Provider>
        </ModalAddStateContext.Provider>

    );
}

export default ProviderModalAdd;

