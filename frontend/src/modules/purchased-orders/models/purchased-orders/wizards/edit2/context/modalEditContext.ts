import {
    createContext
} from "react";
import type {
    ModalEditState,
    ModalEditAction
} from "./modalEditTypes";
import {
    initialState,
} from "./ModalEditReducer";
import type {
    Dispatch
} from "react";

// Contexto para el estado de la tabla
const ModalEditStateContext =
    createContext<ModalEditState | undefined>(initialState);
// Contexto para el dispatch de la tabla
const ModalEditDispatchContext =
    createContext<Dispatch<ModalEditAction> | undefined>(undefined);

export {
    ModalEditStateContext,
    ModalEditDispatchContext
}