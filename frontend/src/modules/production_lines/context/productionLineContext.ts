import { createContext } from "react";
import type { ProductionLineState, ProductionLineAction, ProductionLineCommands } from "./productionLineTypes";
import type { Dispatch } from "react";


// Contexto para el estado de production line
const ProductionLineStateContext =
    createContext<ProductionLineState | undefined>(undefined);
// Contexto para el dispatch de production line
const ProductionLineDispatchContext =
    createContext<Dispatch<ProductionLineAction> | undefined>(undefined);

// Contexto para los comandos de production line(en el caso de que se obtenga el estado de forma asincrona).
const ProductionLineCommandsContext =
    createContext<ProductionLineCommands | undefined>(undefined);

export {
    ProductionLineStateContext,
    ProductionLineDispatchContext,
    ProductionLineCommandsContext
}
