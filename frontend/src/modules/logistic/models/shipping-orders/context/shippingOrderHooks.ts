import { useContext } from "react";
import type { Dispatch } from "react";
import { ShippingOrderDispatchContext, ShippingOrderStateContext, ShippingOrderCommandsContext } from "./shippingOrderContext";
import type { ShippingOrderAction, ShippingOrderState, ShippingOrderCommands } from "./shippingOrderTypes";

const useShippingOrderState = (): ShippingOrderState => {
    const state = useContext(ShippingOrderStateContext);
    if (!state) {
        throw new Error(
            "useShippingOrderState must be used within a ProviderShippingOrder"
        );
    }
    return state;
};

const useShippingOrderDispatch = (): Dispatch<ShippingOrderAction> => {
    const dispatch = useContext(ShippingOrderDispatchContext);
    if (!dispatch) {
        throw new Error(
            "useShippingOrderDispatch must be used within a ProviderShippingOrder"
        );
    }
    return dispatch;
};

const useShippingOrderCommand = (): ShippingOrderCommands => {
    const commands = useContext(ShippingOrderCommandsContext);
    if (!commands) {
        throw new Error(
            "useShippingOrderCommand must be used within a ProviderShippingOrder"
        );
    }
    return commands;
};

export {
    useShippingOrderState,
    useShippingOrderDispatch,
    useShippingOrderCommand
};