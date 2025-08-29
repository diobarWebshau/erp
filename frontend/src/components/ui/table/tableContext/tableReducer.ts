import type {
    Draft
} from "immer";
import {
    produce
} from "immer";
import type {
    TableAction,
    TableState,
} from "./tableTypes";
import {
    TableActionTypes
} from "./tableTypes";
import type {
    ColumnFiltersState,
    PaginationState,
    RowSelectionState,
    SortingState,
    VisibilityState
} from "@tanstack/react-table";

/******************
*  Initial State  *
******************/

const initialState: TableState = {
    rowSelectionState: {},
    paginationState: {
        pageIndex: 0,
        pageSize: 10
    },
    sortingState: [],
    columnFiltersState: [],
    columnVisibilityState: {}
};

/*************
*  Slicers   *
*************/

const rowSelectionReducer = (
    draft: Draft<TableState['rowSelectionState']>,
    action: TableAction
): RowSelectionState | void => {
    switch (action.type) {
        case TableActionTypes.SET_ROW_SELECTION:
            return action.payload;
        case TableActionTypes.ADD_ROW_SELECTION:
            draft[action.payload.id.toString()] = action.payload.value;
            break;
        case TableActionTypes.REMOVE_ROW_SELECTION:
            delete draft[action.payload.id.toString()];
            break;
        case TableActionTypes.CLEAR_ROW_SELECTION: {
            const keys = Object.keys(draft);
            for (const key of keys) {
                delete draft[key];
            }
            break;
        }
        default:
            break;
    }
}


const paginationReducer = (
    draft: Draft<TableState['paginationState']>,
    action: TableAction
): PaginationState | void => {
    switch (action.type) {
        case TableActionTypes.SET_PAGINATION:
            return action.payload;
        case TableActionTypes.SET_PAGE_INDEX:
            draft.pageIndex = action.payload;
            break;
        case TableActionTypes.SET_PAGE_SIZE:
            draft.pageSize = action.payload;
            break;
        case TableActionTypes.RESET_PAGINATION:
            draft.pageIndex = initialState.paginationState.pageIndex;
            draft.pageSize = initialState.paginationState.pageSize;
            break;
        default:
            break;
    }
}



const sortingReducer = (
    draft: Draft<TableState['sortingState']>,
    action: TableAction
): SortingState | void => {
    switch (action.type) {
        case TableActionTypes.SET_SORTING:
            return action.payload;
        case TableActionTypes.ADD_SORTING: {
            const index = draft.findIndex(
                item =>
                    item.id === action.payload.id
            );
            if (index !== -1) {
                draft.splice(index, 1);
            }
            draft.push(action.payload);
            break;
        }
        case TableActionTypes.REMOVE_SORTING:
            const index = draft.findIndex(
                item =>
                    item.id === action.payload
            );
            if (index !== -1) {
                // eliminamos el item( apartir del index, elimina 1 elemento, (opcional) remplazo, ...)
                draft.splice(index, 1);
            }
            break;
        case TableActionTypes.RESET_SORTING:
            // vaciamos el array
            draft.length = 0;
            // agregamos el estado inicial
            draft.push(...initialState.sortingState);
            break;
        default:
            break;
    }
}

const columnFiltersReducer = (
    draft: Draft<TableState['columnFiltersState']>,
    action: TableAction
): ColumnFiltersState | void => {
    switch (action.type) {
        case TableActionTypes.SET_COLUMN_FILTERS:
            return action.payload;
        case TableActionTypes.ADD_COLUMN_FILTER: {
            const index = draft.findIndex(
                item =>
                    item.id === action.payload.id
            );
            if (index !== -1) {
                draft.splice(index, 1);
            }
            draft.push(action.payload);
            break;
        }
        case TableActionTypes.REMOVE_COLUMN_FILTER: {
            const index = draft.findIndex(
                item =>
                    item.id === action.payload
            );
            if (index !== -1) {
                // eliminamos el item( apartir del index, elimina 1 elemento, (opcional) remplazo, ...)
                draft.splice(index, 1);
            }
            break;
        }
        case TableActionTypes.RESET_COLUMN_FILTERS: {
            // vaciamos el array
            draft.length = 0;
            // agregamos el estado inicial
            draft.push(...initialState.columnFiltersState);
            break;
        }
        default:
            break;
    }
}


const columnVisibilityReducer = (
    draft: Draft<TableState['columnVisibilityState']>,
    action: TableAction
): VisibilityState | void => {
    switch (action.type) {
        case TableActionTypes.SET_COLUMN_VISIBILITY:
            return action.payload;
        case TableActionTypes.TOGGLE_COLUMN_VISIBILITY:
            draft[action.payload] = !draft[action.payload];
            break;
        case TableActionTypes.RESET_COLUMN_VISIBILITY: {
            const keys = Object.keys(draft);
            for (const key of keys) {
                draft[key] = initialState.columnVisibilityState[key];
            }
            break;
        }
        default:
            break;
    }
}


/*****************
 *   Reducer     *
 *****************/

const TableReducer = produce((
    draft: Draft<TableState>,
    action: TableAction
) => {
    const rowSelectionState =
        rowSelectionReducer(draft.rowSelectionState, action);
    const paginationState =
        paginationReducer(draft.paginationState, action);
    const sortingState =
        sortingReducer(draft.sortingState, action);
    const columnFiltersState =
        columnFiltersReducer(draft.columnFiltersState, action);
    const columnVisibilityState =
        columnVisibilityReducer(draft.columnVisibilityState, action);

    if (rowSelectionState !== undefined)
        draft.rowSelectionState = rowSelectionState;
    if (paginationState !== undefined)
        draft.paginationState = paginationState;
    if (sortingState !== undefined)
        draft.sortingState = sortingState;
    if (columnFiltersState !== undefined)
        draft.columnFiltersState = columnFiltersState;
    if (columnVisibilityState !== undefined)
        draft.columnVisibilityState = columnVisibilityState;


    switch (action.type) {
        case TableActionTypes.SET_PARTIAL_TABLE_STATE: {
            const {
                rowSelectionState,
                paginationState,
                sortingState,
                columnFiltersState,
                columnVisibilityState
            } = action.payload;

            if (rowSelectionState !== undefined)
                draft.rowSelectionState = rowSelectionState;
            if (paginationState !== undefined)
                draft.paginationState = paginationState;
            if (sortingState !== undefined)
                draft.sortingState = sortingState;
            if (columnFiltersState !== undefined)
                draft.columnFiltersState = columnFiltersState;
            if (columnVisibilityState !== undefined)
                draft.columnVisibilityState = columnVisibilityState;
            break;
        }
        case TableActionTypes.SET_TABLE_STATE:
            return action.payload;
        default:
            break;
    }
});

export {
    TableReducer,
    initialState
};