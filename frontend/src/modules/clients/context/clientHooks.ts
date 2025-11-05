import { ClientDispatchContext, ClientStateContext, ClientCommandsContext } from "./clientContext";
import type { ClientAction, ClientState, ClientCommands } from "./clientTypes";
import type { Dispatch } from "react";
import {useContext} from "react";

const useClientState = (): ClientState => {
    const state = useContext(ClientStateContext);
    if (!state) {
        throw new Error(
            "useClientState must be used within a ProviderClient"
        );
    }
    return state;
};

const useClientDispatch = (): Dispatch<ClientAction> => {
    const dispatch = useContext(ClientDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useClientDispatch must be used within a ProviderClient"
        );
    }
    return dispatch;
};

const useClientCommand = (): ClientCommands => {
    const commands = useContext(ClientCommandsContext);
    if (!commands) {
        throw new Error(
            "useClientCommand must be used within a ProviderClient"
        );
    }
    return commands;
};

export {
    useClientState,
    useClientDispatch,
    useClientCommand
}
