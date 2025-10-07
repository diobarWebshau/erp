// tableHooks.ts
import { useContext, type Dispatch } from "react";
import { TableStateContext, TableDispatchContext } from "./tableContext";
import type { TableAction, TableState } from "./tableTypes";

export const useTableState = (): TableState => {
  const state = useContext(TableStateContext);
  if (state === undefined) {
    throw new Error("useTableState must be used within a ProviderTableContext");
  }
  return state;
};

export const useTableDispatch = (): Dispatch<TableAction> => {
  const dispatch = useContext(TableDispatchContext);
  if (dispatch === undefined) {
    throw new Error("useTableDispatch must be used within a ProviderTableContext");
  }
  return dispatch;
};
