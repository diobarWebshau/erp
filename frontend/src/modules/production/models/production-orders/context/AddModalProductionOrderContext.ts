import {
    createContext
} from "react";
import type {
    AddModalProductionOrderState,
    AddModalProductionOrderAction
} from "./AddModalProductionOrderTypes"
import type {
    Dispatch
} from "react";

// Contexto para el estado del modal de add production order
const AddModalProductionOrderStateContext =
    createContext<AddModalProductionOrderState | undefined>(undefined);
// Contexto para el dispatch del modal de add production order
const AddModalProductionOrderDispatchContext =
    createContext<Dispatch<AddModalProductionOrderAction> | undefined>(undefined);

export {
    AddModalProductionOrderStateContext,
    AddModalProductionOrderDispatchContext
}

