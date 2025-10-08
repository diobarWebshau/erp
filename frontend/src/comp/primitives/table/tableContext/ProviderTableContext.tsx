import { TableStateContext, TableDispatchContext } from "./tableContext";
import { TableReducer } from "./tableReducer";
import type { TableAction, TableState } from "./tableTypes";
import { useMemo, useReducer, useRef } from "react";
import type { Dispatch, ReactNode } from "react";

const ProviderTableContext = ({
    children,
    initialState,
}: {
    children: ReactNode;
    initialState: TableState;
}) => {

    const initialRef = useRef<TableState>(initialState);

    const reducer = useMemo(() => TableReducer(initialRef.current), []);

    const [state, dispatch]: [TableState, Dispatch<TableAction>] = useReducer(
        reducer, undefined as unknown as TableState,
        () => initialRef.current!
    );

    return (
        <TableStateContext.Provider value={state}>
            <TableDispatchContext.Provider value={dispatch}>
                {children}
            </TableDispatchContext.Provider>
        </TableStateContext.Provider>
    );
};

export default ProviderTableContext;
