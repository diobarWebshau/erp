import { createContext } from "react";
import type { ClientAction, ClientState, ClientCommands } from "./clientTypes";
import type { Dispatch } from "react";

const ClientStateContext = createContext<ClientState | undefined>(undefined);
const ClientDispatchContext = createContext<Dispatch<ClientAction> | undefined>(undefined);
const ClientCommandsContext = createContext<ClientCommands | undefined>(undefined);

export {
    ClientStateContext,
    ClientDispatchContext,
    ClientCommandsContext
}
