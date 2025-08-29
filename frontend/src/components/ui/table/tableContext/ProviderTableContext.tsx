import {
    TableStateContext,
    TableDispatchContext
} from "./tableContext";
import {
    TableReducer,
    initialState
} from "./tableReducer";
import type {
    TableAction,
    TableState,
} from "./tableTypes";
import {
    useReducer,
    type Dispatch,
    type ReactNode
} from "react";

const ProviderTableContext = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [state, dispatch]: [TableState, Dispatch<TableAction>] =
        useReducer(TableReducer, initialState);
    return (
        <TableStateContext.Provider value={state}>
            <TableDispatchContext.Provider value={dispatch}>
                {children}
            </TableDispatchContext.Provider>
        </TableStateContext.Provider>
    );
};

export default ProviderTableContext;