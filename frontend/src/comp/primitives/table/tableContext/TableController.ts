import type { Dispatch } from "react";
import type { TableAction, TableState } from "./tableTypes";

export interface GenericTableController {
    state: TableState;                 // lectura de estado interno (opcional)
    dispatch: Dispatch<TableAction>;   // para disparar acciones directamente (opcional)
    resetFilters: () => void;          // helper imperativo
    exportTable: () => void | Promise<void>; // helper imperativo
}
