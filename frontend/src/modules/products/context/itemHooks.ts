import { ItemStateContext, ItemCommandsContext, ItemDispatchContext } from "./itemContext";
import { useContext } from "react";

const useItemState = () => {
    const state = useContext(ItemStateContext);
    if (!state) {
        throw new Error("useItemState must be used within a ProviderItem");
    }
    return state;
}

const useItemDispatch = () => {
    const dispatch = useContext(ItemDispatchContext);
    if (!dispatch) {
        throw new Error("useItemDispatch must be used within a ProviderItem");
    }
    return dispatch;
}

const useItemCommand = () => {
    const commands = useContext(ItemCommandsContext);
    if (!commands) {
        throw new Error("useItemCommand must be used within a ProviderItem");
    }
    return commands;
}

export {
    useItemState,
    useItemDispatch,
    useItemCommand
}
