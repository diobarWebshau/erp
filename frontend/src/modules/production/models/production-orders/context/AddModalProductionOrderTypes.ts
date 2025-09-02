import type {
    IPartialProductionOrder
} from "../../../../../interfaces/productionOrder";

const total_steps = 3;

type AddModalProductionOrderState = {
    total_steps: number,
    current_step: number,
    data: IPartialProductionOrder,
}

const AddModalProductionOrderActionsTypes = {
    SET_PRODUCTION_ORDER: "SET_PRODUCTION_ORDER",
    UPDATE_PRODUCTION_ORDER: "UPDATE_PRODUCTION_ORDER",
    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",
    CLEAR: "CLEAR",
} as const;

type AddModalProductionOrderActionType =
    typeof AddModalProductionOrderActionsTypes[
        keyof typeof AddModalProductionOrderActionsTypes
    ];

type AddModalProductionOrderAction =
    | { type: typeof AddModalProductionOrderActionsTypes.SET_PRODUCTION_ORDER, payload: IPartialProductionOrder }
    | { type: typeof AddModalProductionOrderActionsTypes.UPDATE_PRODUCTION_ORDER, payload: IPartialProductionOrder }
    | { type: typeof AddModalProductionOrderActionsTypes.SET_STEP, payload: number }
    | { type: typeof AddModalProductionOrderActionsTypes.BACK_STEP }
    | { type: typeof AddModalProductionOrderActionsTypes.NEXT_STEP }
    | { type: typeof AddModalProductionOrderActionsTypes.CLEAR };


export type {
    AddModalProductionOrderState,
    AddModalProductionOrderActionType,
    AddModalProductionOrderAction
};

export {
    AddModalProductionOrderActionsTypes,
    total_steps
};
