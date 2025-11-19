import { createContext } from "react";
import type { LocationAction, LocationState, LocationCommands } from "./locationTypes";
import type { Dispatch } from "react";

const LocationStateContext = createContext<LocationState | null>(null);
const LocationDispatchContext = createContext<Dispatch<LocationAction> | null>(null);
const LocationCommandsContext = createContext<LocationCommands | null>(null);

export {
    LocationStateContext,
    LocationDispatchContext,
    LocationCommandsContext
};