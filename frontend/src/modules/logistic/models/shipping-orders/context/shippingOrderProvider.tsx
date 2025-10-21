import type { IPartialShippingOrder } from "../../../../../interfaces/shippingOrder";
import type { ShippingOrderState, ShippingOrderAction } from "./shippingOrderTypes";
import { useMemo, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { ShippingOrderStateContext, ShippingOrderDispatchContext } from "./shippingOrderContext";
import ShippingOrderReducer from "./shippingOrderReducer"
import { initialShippingOrderState } from "./shippingOrderTypes";


interface IProviderShippingOrder {
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
    data: IPartialShippingOrder;
}


const ShippingOrderProvider = ({
    currentStep,
    totalSteps,
    children,
    data
}: IProviderShippingOrder) => {

    const baseData = useMemo(() => ({
        ...initialShippingOrderState.data,
        ...data
    }), [data]);

    const initialState = useMemo<ShippingOrderState>(() => ({
        ...initialShippingOrderState,
        current_step: currentStep,
        total_steps: totalSteps,
        data: baseData
    }), [baseData, currentStep, totalSteps]);


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
