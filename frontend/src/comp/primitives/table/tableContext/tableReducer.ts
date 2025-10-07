import type { ColumnFiltersState, PaginationState, RowSelectionState, SortingState, VisibilityState } from "@tanstack/react-table";
import type { Draft } from "immer";
import { produce } from "immer";
import type { TableAction, TableState } from "./tableTypes";
import { TableActionTypes } from "./tableTypes";

// ****** INITIAL STATE  ******
// (Se deja comentado porque ahora el initialState real vendrá “de afuera” y lo
//  capturamos por cierre en el root reducer/factory.)
//
// const initialState: TableState = {
//     rowSelectionState: {},
//     paginationState: {
//         pageIndex: 0,
//         pageSize: 10
//     },
//     sortingState: [],
//     columnFiltersState: [],
//     columnVisibilityState: {}
// };

// ****** SLICE REDUCERS  ******

/**
 * Factory de slice reducer para selección de filas.
 * Nota: el parámetro `initialState` no se usa actualmente en este slice
 * (se mantiene por simetría con los otros slices y por si en el futuro
 * se requiere `RESET_*` específico aquí).
 */
const rowSelectionSliceReducer = (initialState: RowSelectionState) => (
    draft: Draft<RowSelectionState>, // sería un slice del estado global
    action: TableAction
): RowSelectionState | void => {
    switch (action.type) {
        case TableActionTypes.SET_ROW_SELECTION: {
            // reemplazamos el estado directamente con return (No debemos reasignar la referencia del draft)
            return action.payload;
        }
        case TableActionTypes.ADD_ROW_SELECTION: {
            let changed = false;
            for (const id of action.payload) {
                const key = id.toString();
                if (!draft[key]) {
                    draft[key] = true;
                    changed = true;
                }
            }
            if (!changed) return; // no mutaste nada, Immer devolverá el mismo estado
            break; // si mutaste algo, Immer devolverá el nuevo estado
        }
        case TableActionTypes.REMOVE_ROW_SELECTION: {
            let changed = false;
            for (const id of action.payload) {
                const key = id.toString();
                if (draft[key]) {
                    delete draft[key];
                    changed = true;
                }
            }
            if (!changed) return; // no mutaste nada, Immer devolverá el mismo estado
            break; // si mutaste algo, Immer devolverá el nuevo estado
        }
        case TableActionTypes.CLEAR_ROW_SELECTION: {
            if (Object.keys(draft).length === 0) return; // no mutaste nada, Immer devolverá el mismo estado
            return {}; // si mutaste algo, Immer devolverá el nuevo estado
        }
        default:
            return;
    }
};

const paginationSliceReducer = (initialState: PaginationState) => (
    draft: Draft<PaginationState>, // sería un slice del estado global
    action: TableAction
): PaginationState | void => {
    switch (action.type) {
        case TableActionTypes.SET_PAGINATION:
            // mutación total del estado
            return action.payload;
        case TableActionTypes.SET_PAGE_INDEX:
            // mutación parcial del estado, mutando propiedades primitivas dentro del draft (son reemplazos porque son primitivos)
            if (draft.pageIndex === action.payload) return;
            draft.pageIndex = action.payload;
            break;
        case TableActionTypes.SET_PAGE_SIZE:
            // mutación parcial del estado, mutando propiedades primitivas dentro del draft (son reemplazos porque son primitivos)
            if (draft.pageSize === action.payload) return;
            draft.pageSize = action.payload;
            break;
        case TableActionTypes.RESET_PAGINATION:
            // mutación parcial del estado, mutando propiedades primitivas dentro del draft (son reemplazos porque son primitivos)
            if (draft.pageIndex === initialState.pageIndex && draft.pageSize === initialState.pageSize) return;
            draft.pageIndex = initialState.pageIndex;
            draft.pageSize = initialState.pageSize;
            break;
        default:
            return;
    }
};

const sortingSliceReducer = (initialState: SortingState) => (
    draft: Draft<SortingState>, // sería un slice del estado global
    action: TableAction
): SortingState | void => {
    switch (action.type) {
        case TableActionTypes.SET_SORTING:
            // reemplazamos el estado directamente con return (No debemos reasignar la referencia del draft)
            return action.payload;
        case TableActionTypes.ADD_SORTING: {
            // mutación directa sobre el array
            const index = draft.findIndex(
                (item) => item.id === action.payload.id
            );
            if (index !== -1) {
                draft.splice(index, 1);
            }
            draft.push(action.payload);
            break;
        }
        case TableActionTypes.REMOVE_SORTING: {
            const index = draft.findIndex(
                (item) => item.id === action.payload
            );
            if (index !== -1) {
                // eliminamos el item (a partir del index, elimina 1 elemento)
                draft.splice(index, 1);
            }
            break;
        }
        case TableActionTypes.RESET_SORTING:
            // reemplazo seguro: devolvemos un nuevo array para evitar aliasing de referencias
            return [...initialState];
        default:
            break;
    }
};

const columnFiltersSliceReducer = (initialState: ColumnFiltersState) => (
    draft: Draft<ColumnFiltersState>, // sería un slice del estado global
    action: TableAction
): ColumnFiltersState | void => {
    switch (action.type) {
        case TableActionTypes.SET_COLUMN_FILTERS:
            // reemplazamos el estado directamente con return (No debemos reasignar la referencia del draft)
            return action.payload;
        case TableActionTypes.ADD_COLUMN_FILTER: {
            console.log('filter')
            console.log(action.payload);
            const index = draft.findIndex(
                (item) => item.id === action.payload.id
            );
            if (index !== -1) {
                draft.splice(index, 1);
            }
            draft.push(action.payload);
            break;
        }
        case TableActionTypes.REMOVE_COLUMN_FILTER: {
            const index = draft.findIndex(
                (item) => item.id === action.payload
            );
            if (index !== -1) {
                // eliminamos el item (a partir del index, elimina 1 elemento)
                draft.splice(index, 1);
            }
            break;
        }
        case TableActionTypes.RESET_COLUMN_FILTERS:
            // reemplazo seguro: devolvemos un nuevo array para evitar aliasing de referencias
            return [...initialState];
        default:
            break;
    }
};

const columnVisibilitySliceReducer = (initialState: VisibilityState) => (
    draft: Draft<VisibilityState>, // sería un slice del estado global
    action: TableAction
): VisibilityState | void => {
    switch (action.type) {
        case TableActionTypes.SET_COLUMN_VISIBILITY:
            return action.payload;
        case TableActionTypes.TOGGLE_COLUMN_VISIBILITY:
            draft[action.payload] = !draft[action.payload];
            break;
        case TableActionTypes.RESET_COLUMN_VISIBILITY:
            // reemplazo seguro: devolvemos un nuevo objeto para evitar dejar claves residuales y aliasing
            return { ...initialState };
        default:
            break;
    }
};


// ****** RECIPE para produce (Immer) ******
// `tableRecipe` es una *factory* que recibe el `initialState` del *root*
// y también los slice reducers precompilados. Devolvemos el "recipe" que
// mutará el draft. El acceso al initial se hace por CIERRE (closure).
type CompiledSlices = {
    rowSel: ReturnType<typeof rowSelectionSliceReducer>;
    pag: ReturnType<typeof paginationSliceReducer>;
    sort: ReturnType<typeof sortingSliceReducer>;
    filt: ReturnType<typeof columnFiltersSliceReducer>;
    vis: ReturnType<typeof columnVisibilitySliceReducer>;
};

const tableRecipe = (
    slices: CompiledSlices
) => (
    draft: Draft<TableState>, // sería el estado global
    action: TableAction
) => {
        // 1) Casos “fast path”
        if (action.type === TableActionTypes.SET_TABLE_STATE) {
            // Reemplazo total del estado
            return action.payload;
        }

        if (action.type === TableActionTypes.SET_PARTIAL_TABLE_STATE) {
            // Reemplazo parcial de los slices del estado global, si es que vienen en el payload
            const p = action.payload;
            if (p.rowSelectionState !== undefined) draft.rowSelectionState = p.rowSelectionState;
            if (p.paginationState !== undefined) draft.paginationState = p.paginationState;
            if (p.sortingState !== undefined) draft.sortingState = p.sortingState;
            if (p.columnFiltersState !== undefined) draft.columnFiltersState = p.columnFiltersState;
            if (p.columnVisibilityState !== undefined) draft.columnVisibilityState = p.columnVisibilityState;
            return; // usa el draft mutado
        }

        // 2) Resto de acciones → delega a sub-reducers ya pre-creados
        const nextRow = slices.rowSel(draft.rowSelectionState, action);
        if (nextRow !== undefined) draft.rowSelectionState = nextRow;

        const nextPag = slices.pag(draft.paginationState, action);
        if (nextPag !== undefined) draft.paginationState = nextPag;

        const nextSort = slices.sort(draft.sortingState, action);
        if (nextSort !== undefined) draft.sortingState = nextSort;

        const nextFilt = slices.filt(draft.columnFiltersState, action);
        if (nextFilt !== undefined) draft.columnFiltersState = nextFilt;

        const nextVis = slices.vis(draft.columnVisibilityState, action);
        if (nextVis !== undefined) draft.columnVisibilityState = nextVis;

        // No es necesario retornar nada: si nadie mutó, Immer conserva la referencia original;
        // si hubo mutaciones (o replacements), Immer genera el nuevo estado.
    };


// ****** ROOT REDUCER ******
// Precompilamos los slice reducers una sola vez por `initialState` y devolvemos
// el reducer producido por Immer usando `tableRecipe(...)`. Esto evita recrear
// funciones en cada acción y **sí** usa `tableRecipe` como pediste.
const TableRootReducer = (initialState: TableState) => {
    // Precompilación de slices con el initial de cada slice
    const slices: CompiledSlices = {
        rowSel: rowSelectionSliceReducer(initialState.rowSelectionState),
        pag: paginationSliceReducer(initialState.paginationState),
        sort: sortingSliceReducer(initialState.sortingState),
        filt: columnFiltersSliceReducer(initialState.columnFiltersState),
        vis: columnVisibilitySliceReducer(initialState.columnVisibilityState),
    };

    // Usamos tableRecipe + produce (Immer)
    return produce(tableRecipe(slices));
};

export {
    TableRootReducer as TableReducer,
};
