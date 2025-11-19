import type { ItemState, ItemAction, ItemCommands } from "./itemTypes";
import { createContext } from "react";
import type { Dispatch } from "react";

const ItemStateContext = createContext<ItemState | null>(null);
const ItemDispatchContext = createContext<Dispatch<ItemAction> | null>(null);
const ItemCommandsContext = createContext<ItemCommands | null>(null);

export {
    ItemStateContext,
    ItemDispatchContext,
    ItemCommandsContext
};