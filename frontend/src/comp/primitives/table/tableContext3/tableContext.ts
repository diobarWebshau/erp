import { createContext} from "react";
import type { Dispatch } from "react";
import type { TableAction, TableState} from "./tableTypes";

// Contexto para el estado de la tabla
const TableStateContext = createContext<TableState | undefined>(undefined);
// Contexto para el dispatch de la tabla
const TableDispatchContext = createContext<Dispatch<TableAction> | undefined>(undefined);

export {
    TableStateContext,
    TableDispatchContext
}