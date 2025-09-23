import type { IPartialInventoryDetails } from "../../../../../interfaces/inventories";
import type { InventoriesState, InventoriesAction } from "./InventoriesTypes";
import { useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { InventoriesStateContext, InventoriesDispatchContext} from "./inventoriesContext";
import InventoriesReducer from "./InventoriesReducer";

interface IProviderInventories {
    currentStep: number;
    totalSteps: number;
    children: ReactNode;
    data?: IPartialInventoryDetails[];
}

const InventoriesProvider = ({
    currentStep,
    totalSteps,
    children,
    data
}: IProviderInventories) => {
    const initialState: InventoriesState = {
        current_step: currentStep,
        total_steps: totalSteps,
        data: data || [],
    };
    const [state, dispatch]: [InventoriesState, Dispatch<InventoriesAction>] =
        useReducer(InventoriesReducer, initialState);
    return (
        <InventoriesStateContext.Provider value={state}>
            <InventoriesDispatchContext.Provider value={dispatch}>
                {children}
            </InventoriesDispatchContext.Provider>
        </InventoriesStateContext.Provider>
    )
};

export default InventoriesProvider;


