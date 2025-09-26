import type {
    ColumnFilter,
    ColumnFiltersState,
    ColumnSort,
    PaginationState,
    RowSelectionState,
    SortingState,
    VisibilityState
} from "@tanstack/react-table";

// Interfaz para el estado de la tabla
interface TableState {
    // estado para la seleccion de filas
    rowSelectionState: RowSelectionState;
    // estado para la paginacion
    paginationState: PaginationState;
    // estado para el ordenamiento
    sortingState: SortingState;
    // estado para el filtrado de columnas
    columnFiltersState: ColumnFiltersState;
    // estado para la visibilidad de columnas
    columnVisibilityState: VisibilityState;
}

// Acciones como objeto const para tipo seguro y autocompletado
const TableActionTypes = {
    // Acciones de seleccion de filas
    SET_ROW_SELECTION: "SET_ROW_SELECTION",
    ADD_ROW_SELECTION: "ADD_ROW_SELECTION",
    REMOVE_ROW_SELECTION: "REMOVE_ROW_SELECTION",
    CLEAR_ROW_SELECTION: "CLEAR_ROW_SELECTION",
    // Acciones de paginacion
    SET_PAGINATION: "SET_PAGINATION",
    SET_PAGE_INDEX: "SET_PAGE_INDEX",
    SET_PAGE_SIZE: "SET_PAGE_SIZE",
    RESET_PAGINATION: "RESET_PAGINATION",
    // Acciones de ordenamiento
    SET_SORTING: "SET_SORTING",
    ADD_SORTING: "ADD_SORTING",
    REMOVE_SORTING: "REMOVE_SORTING",
    RESET_SORTING: "RESET_SORTING",
    // Acciones de filtrado de columnas
    SET_COLUMN_FILTERS: "SET_COLUMN_FILTERS",
    ADD_COLUMN_FILTER: "ADD_COLUMN_FILTER",
    REMOVE_COLUMN_FILTER: "REMOVE_COLUMN_FILTER",
    RESET_COLUMN_FILTERS: "RESET_COLUMN_FILTERS",
    // Acciones de visibilidad de columnas
    SET_COLUMN_VISIBILITY: "SET_COLUMN_VISIBILITY",
    TOGGLE_COLUMN_VISIBILITY: "TOGGLE_COLUMN_VISIBILITY",
    RESET_COLUMN_VISIBILITY: "RESET_COLUMN_VISIBILITY",
    // Acciones de estado completo de la tabla
    SET_PARTIAL_TABLE_STATE: "SET_PARTIAL_TABLE_STATE",
    SET_TABLE_STATE: "SET_TABLE_STATE"
} as const;

// Inferimos tipo literal de las acciones
type TableActionType =
    typeof TableActionTypes[keyof typeof TableActionTypes];

// Definimos un tipado, que abarque todos los tipos de acciones 
type TableAction =
    // tipado para acciones de seleccion de filas
    | { type: typeof TableActionTypes.SET_ROW_SELECTION; payload: RowSelectionState }
    | { type: typeof TableActionTypes.ADD_ROW_SELECTION; payload: RowSelectionState }
    | { type: typeof TableActionTypes.REMOVE_ROW_SELECTION; payload: RowSelectionState }
    | { type: typeof TableActionTypes.CLEAR_ROW_SELECTION }
    // tipado para acciones de paginacion
    | { type: typeof TableActionTypes.SET_PAGINATION; payload: PaginationState }
    | { type: typeof TableActionTypes.SET_PAGE_INDEX; payload: number }
    | { type: typeof TableActionTypes.SET_PAGE_SIZE; payload: number }
    | { type: typeof TableActionTypes.RESET_PAGINATION }
    // tipado para acciones de ordenamiento
    | { type: typeof TableActionTypes.SET_SORTING; payload: SortingState }
    | { type: typeof TableActionTypes.ADD_SORTING; payload: ColumnSort }
    | { type: typeof TableActionTypes.REMOVE_SORTING; payload: string }
    | { type: typeof TableActionTypes.RESET_SORTING }
    // tipado para acciones de filtrado de columnas
    | { type: typeof TableActionTypes.SET_COLUMN_FILTERS; payload: ColumnFiltersState }
    | { type: typeof TableActionTypes.ADD_COLUMN_FILTER; payload: ColumnFilter }
    | { type: typeof TableActionTypes.REMOVE_COLUMN_FILTER; payload: string }
    | { type: typeof TableActionTypes.RESET_COLUMN_FILTERS }
    // tipado para acciones de visibilidad de columnas
    | { type: typeof TableActionTypes.SET_COLUMN_VISIBILITY; payload: VisibilityState }
    | { type: typeof TableActionTypes.TOGGLE_COLUMN_VISIBILITY; payload: string }
    | { type: typeof TableActionTypes.RESET_COLUMN_VISIBILITY }
    // tipado para estado completo de la tabla
    | { type: typeof TableActionTypes.SET_PARTIAL_TABLE_STATE; payload: Partial<TableState> }
    | { type: typeof TableActionTypes.SET_TABLE_STATE; payload: TableState }

export type {
    TableState,
    TableActionType,
    TableAction
};

export {
    TableActionTypes
};