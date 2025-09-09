import type {
    AddModalProductionOrderState,
    AddModalProductionOrderAction
} from "./AddModalProductionOrderTypes";
import {
    AddModalProductionOrderStateContext,
    AddModalProductionOrderDispatchContext
} from "./AddModalProductionOrderContext";
import {
    AddModalProductionOrderReducer,
} from "./AddModalProductionOrderReducer";
import {
    useEffect,
    useReducer,
    type Dispatch,
    type ReactNode
} from "react";
import type { IPartialProductionOrder } from "../../../../../interfaces/productionOrder";
import { set_production_order } from "./AddModalProductionOrderActions";

interface IProviderAddModalProductionOrder {
    mode: "create" | "update";
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
    data?: IPartialProductionOrder;
    draft?: IPartialProductionOrder;
}


const ProviderAddModalProductionOrder = ({
    mode,
    currentStep,
    totalSteps,
    children,
    data,
    draft
}: IProviderAddModalProductionOrder) => {

    const initialState: AddModalProductionOrderState = {
        mode: mode,
        current_step: currentStep,
        total_steps: totalSteps,
        data: {
            ...data,
            ...(data?.order_type === 'internal' && { internal_order: data.extra_data2?.internal_order }),
            ...(data?.order_type === 'client' && { purchase_order: data.extra_data2?.purchase_order }),
            location: data?.extra_data2?.location,
            production_line: data?.extra_data2?.production_line,
        },
        draft: draft || {},
    }

    const [state, dispatch]: [AddModalProductionOrderState, Dispatch<AddModalProductionOrderAction>] =
        useReducer(AddModalProductionOrderReducer, initialState);


    useEffect(() => {
        if (data) {
            // console.log('se actualizo data porque cambio ')
            // console.log(`data`, data);
            dispatch(
                set_production_order(
                    {
                        ...data,
                        ...(data?.order_type === "internal" && { internal_order: data.extra_data2?.internal_order }),
                        ...(data?.order_type === "client" && { purchase_order: data.extra_data2?.purchase_order }),
                        location: data?.extra_data2?.location,
                        production_line: data?.extra_data2?.production_line,
                    }
                )
            );
        }
    }, [data, dispatch]);

    // console.log('Provider se renderiza', data);
    return (
        <AddModalProductionOrderStateContext.Provider value={state}>
            <AddModalProductionOrderDispatchContext.Provider value={dispatch}>
                {children}
            </AddModalProductionOrderDispatchContext.Provider>
        </AddModalProductionOrderStateContext.Provider>
    );
}

export default ProviderAddModalProductionOrder;