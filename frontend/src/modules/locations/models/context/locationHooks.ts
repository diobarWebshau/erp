import { LocationStateContext, LocationDispatchContext, LocationCommandsContext } from "./locationContext";
import type { LocationState, LocationAction, LocationCommands } from "./locationTypes";
import type { Dispatch } from "react";
import { useContext } from "react";


const useLocationState = (): LocationState => {
    const state = useContext(LocationStateContext);
    if (!state) {
        throw new Error(
            "useLocationState must be used within a ProviderLocation"
        );
    }
    return state;
};

const useLocationDispatch = (): Dispatch<LocationAction> => {
    const dispatch = useContext(LocationDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useLocationDispatch must be used within a ProviderLocation"
        );
    }
    return dispatch;
};

const useLocationCommand = (): LocationCommands => {
    const commands = useContext(LocationCommandsContext);
    if (!commands) {
        throw new Error(
            "useLocationCommand must be used within a ProviderLocation"
        );
    }
    return commands;
};

export {
    useLocationState,
    useLocationDispatch,
    useLocationCommand
}
