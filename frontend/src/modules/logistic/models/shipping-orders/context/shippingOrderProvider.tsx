import type { IPartialShippingOrder } from "../../../../../interfaces/shippingOrder";
import type { ShippingOrderState, ShippingOrderAction } from "./shippingOrderTypes";
import { useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { ShippingOrderStateContext, ShippingOrderDispatchContext } from "./shippingOrderContext";
import ShippingOrderReducer from "./shippingOrderReducer"


interface IProviderShippingOrder {
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
    data?: IPartialShippingOrder;
}


const ShippingOrderProvider = ({
    currentStep,
    totalSteps,
    children,
    data
}: IProviderShippingOrder) => {

    const baseData: IPartialShippingOrder = {
        ...data,
        ...(data?.shipping_order_purchase_order_product && {
            shipping_order_purchase_order_product: data.shipping_order_purchase_order_product
        })
    };

    const initialState: ShippingOrderState = {
        current_step: currentStep,
        total_steps: totalSteps,
        data: baseData || {}
    };

    const [state, dispatch]: [ShippingOrderState, Dispatch<ShippingOrderAction>] =
        useReducer(ShippingOrderReducer, initialState);
        return (
        <ShippingOrderStateContext.Provider value={state}>
            <ShippingOrderDispatchContext.Provider value={dispatch}>
                {children}
            </ShippingOrderDispatchContext.Provider>
        </ShippingOrderStateContext.Provider>
    )
};

export default ShippingOrderProvider;
