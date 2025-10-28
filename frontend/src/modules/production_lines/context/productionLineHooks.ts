import { useContext } from "react";
import type { Dispatch } from "react";
import { ProductionLineDispatchContext, ProductionLineStateContext, ProductionLineCommandsContext } from "./productionLineContext";
import type { ProductionLineAction, ProductionLineState, ProductionLineCommands } from "./productionLineTypes";

const useProductionLineState = (): ProductionLineState => {
    const state = useContext(ProductionLineStateContext);
    if (!state) {
        throw new Error(
            "useProductionLineState must be used within a ProviderProductionLine"
        );
    }
    return state;
};

const useProductionLineDispatch = (): Dispatch<ProductionLineAction> => {
    const dispatch = useContext(ProductionLineDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useProductionLineDispatch must be used within a ProviderProductionLine"
        );
    }
    return dispatch;
};

const useProductionLineCommand = (): ProductionLineCommands => {
    const commands = useContext(ProductionLineCommandsContext);
    if (!commands) {
        throw new Error(
            "useProductionLineCommand must be used within a ProviderProductionLine"
        );
    }
    return commands;
};

export {
    useProductionLineState,
    useProductionLineDispatch,
    useProductionLineCommand
};