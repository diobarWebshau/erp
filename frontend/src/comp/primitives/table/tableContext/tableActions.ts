import type {
    ColumnFilter,
    ColumnFiltersState,
    ColumnSort,
    PaginationState,
    RowSelectionState,
    SortingState,
    VisibilityState
} from "@tanstack/react-table";
import type {
    TableState,
    TableAction
} from "./tableTypes";

import {
    TableActionTypes
} from "./tableTypes";


// Acciones de seleccion de filas

const set_row_selection = (payload: RowSelectionState): TableAction => ({
    type: TableActionTypes.SET_ROW_SELECTION,
    payload
});

const add_row_selection = (payload: string[]): TableAction => ({
    type: TableActionTypes.ADD_ROW_SELECTION,
    payload
});

const remove_row_selection = (payload: string[]): TableAction => ({
    type: TableActionTypes.REMOVE_ROW_SELECTION,
    payload
});

const clear_row_selection = (): TableAction => ({
    type: TableActionTypes.CLEAR_ROW_SELECTION
});


// Acciones de paginacion

const set_pagination = (payload: PaginationState): TableAction => ({
    type: TableActionTypes.SET_PAGINATION,
    payload
});

const set_page_index = (payload: number): TableAction => ({
    type: TableActionTypes.SET_PAGE_INDEX,
    payload
});

const set_page_size = (payload: number): TableAction => ({
    type: TableActionTypes.SET_PAGE_SIZE,
    payload
});

const reset_pagination = (): TableAction => ({
    type: TableActionTypes.RESET_PAGINATION
});



// Acciones de ordenamiento

const set_sorting = (payload: SortingState): TableAction => ({
    type: TableActionTypes.SET_SORTING,
    payload
});

const add_sorting = (payload: ColumnSort): TableAction => ({
    type: TableActionTypes.ADD_SORTING,
    payload
});

const remove_sorting = (payload: string): TableAction => ({
    type: TableActionTypes.REMOVE_SORTING,
    payload
});

const reset_sorting = (): TableAction => ({
    type: TableActionTypes.RESET_SORTING
});


// Acciones de filtrado de columnas

const set_column_filters = (payload: ColumnFiltersState): TableAction => ({
    type: TableActionTypes.SET_COLUMN_FILTERS,
    payload
});

const add_column_filter = (payload: ColumnFilter): TableAction => ({
    type: TableActionTypes.ADD_COLUMN_FILTER,
    payload
});

const remove_column_filter = (payload: string): TableAction => ({
    type: TableActionTypes.REMOVE_COLUMN_FILTER,
    payload
});

const reset_column_filters = (): TableAction => ({
    type: TableActionTypes.RESET_COLUMN_FILTERS
});


// Acciones de visibilidad de columnas

const set_column_visibility = (payload: VisibilityState): TableAction => ({
    type: TableActionTypes.SET_COLUMN_VISIBILITY,
    payload
});

const toggle_column_visibility = (payload: string): TableAction => ({
    type: TableActionTypes.TOGGLE_COLUMN_VISIBILITY,
    payload
});

const reset_column_visibility = (): TableAction => ({
    type: TableActionTypes.RESET_COLUMN_VISIBILITY
});

// Acciones de estado completo de la tabla

const set_table_state = (payload: TableState): TableAction => ({
    type: TableActionTypes.SET_TABLE_STATE,
    payload
});

const set_partial_table_state = (payload: Partial<TableState>): TableAction => ({
    type: TableActionTypes.SET_PARTIAL_TABLE_STATE,
    payload
});



export {
    // Acciones de seleccion de filas
    set_row_selection,
    add_row_selection,
    remove_row_selection,
    clear_row_selection,
    // Acciones de paginacion
    set_pagination,
    set_page_index,
    set_page_size,
    reset_pagination,
    // Acciones de ordenamiento
    set_sorting,
    add_sorting,
    remove_sorting,
    reset_sorting,
    // Acciones de filtrado de columnas
    set_column_filters,
    add_column_filter,
    remove_column_filter,
    reset_column_filters,
    // Acciones de visibilidad de columnas
    set_column_visibility,
    toggle_column_visibility,
    reset_column_visibility,
    // Acciones de estado completo de la tabla
    set_table_state,
    set_partial_table_state
}
