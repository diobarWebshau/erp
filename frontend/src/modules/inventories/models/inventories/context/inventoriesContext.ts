import { createContext } from "react";
import type { InventoriesState, InventoriesAction } from "./InventoriesTypes";
import type { Dispatch } from "react";

// Contexto para el estado de inventarios
const InventoriesStateContext =
    createContext<InventoriesState | undefined>(undefined);
// Contexto para el dispatch de inventarios
const InventoriesDispatchContext =
    createContext<Dispatch<InventoriesAction> | undefined>(undefined);

export {
    InventoriesStateContext,
    InventoriesDispatchContext
}   
