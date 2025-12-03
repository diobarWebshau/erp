import {
    createContext
} from "react";
import type {
    ModalAddState,
    ModalAddAction
} from "./modalAddTypes";
import {
    initialState,
} from "./ModalAddReducer";
import type {
    Dispatch
} from "react";

// Contexto para el estado de la tabla
const ModalAddStateContext =
    createContext<ModalAddState | undefined>(initialState);
// Contexto para el dispatch de la tabla
const ModalAddDispatchContext =
    createContext<Dispatch<ModalAddAction> | undefined>(undefined);

export {
    ModalAddStateContext,
    ModalAddDispatchContext
}