import { useContext } from "react";
import type { Dispatch } from "react";
import { ShippingOrderDispatchContext, ShippingOrderStateContext } from "./shippingOrderContext";
import type { ShippingOrderAction, ShippingOrderState } from "./shippingOrderTypes";

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

export {
    useShippingOrderState,
    useShippingOrderDispatch
};