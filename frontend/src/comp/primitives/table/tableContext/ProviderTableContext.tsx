import { TableStateContext, TableDispatchContext } from "./tableContext";
import { TableReducer } from "./tableReducer";
import type { TableAction, TableState } from "./tableTypes";
import { set_table_state } from "./tableActions";
import { useEffect, useMemo, useReducer, useRef } from "react";
import type { Dispatch, ReactNode } from "react";

const ProviderTableContext = ({
    children,
    initialState,

}: {
    children: ReactNode;
    initialState: TableState;
}) => {
    const didMountRef = useRef(false);
    /* 
        Empleamos useMemo para evitar recompilar el reducer cada vez que se 
        renderiza el componente.

        Nota: el initialState no se usa actualmente en el reducer (se mantiene
        por simetría con los otros reducers y por si en el futuro se requiere
        `RESET_*` específico aquí). Es decir, Pasamos initialState para 
        configurar el reducer por closure. Esto le da al reducer acceso al estado
        inicial de referencia (p. ej. para RESET_*, SET_PARTIAL_TABLE_STATE, 
        valores por defecto de cada slice, etc.).
    */
    const reducer = useMemo(
        () => TableReducer(initialState), [initialState]
    );

    /* 
        Pasas initialState como estado inicial efectivo con el que arranca React
        la primera vez que monta el hook.
    */
    const [state, dispatch]: [TableState, Dispatch<TableAction>] =
        useReducer(reducer, initialState);

    /* 
        Usamos useEffect para inicializar el estado con el initialState.
    */
    useEffect(() => {
        if (didMountRef.current) {
            // solo cuando initialState cambie DESPUÉS del montaje
            dispatch(set_table_state(initialState));
        } else {
            didMountRef.current = true; // primer montaje: no dispatch
        }
    }, [initialState, dispatch]);
    return (
        <TableStateContext.Provider value={state}>
            <TableDispatchContext.Provider value={dispatch}>
                {children}
            </TableDispatchContext.Provider>
        </TableStateContext.Provider>
    );
};

export default ProviderTableContext;