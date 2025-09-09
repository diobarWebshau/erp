import type {
    IPartialProductionOrder
} from "../../../../../interfaces/productionOrder";


type AddModalProductionOrderState = {
    mode: "create" | "update",
    total_steps: number,
    current_step: number,
    data: IPartialProductionOrder,
    draft: IPartialProductionOrder,
}

const AddModalProductionOrderActionsTypes = {
    SET_PRODUCTION_ORDER: "SET_PRODUCTION_ORDER",
    UPDATE_PRODUCTION_ORDER: "UPDATE_PRODUCTION_ORDER",
    REMOVE_ATTRIBUTES: "REMOVE_ATTRIBUTES",
    SET_STEP: "SET_STEP",
    BACK_STEP: "BACK_STEP",
    NEXT_STEP: "NEXT_STEP",
    CLEAR: "CLEAR",
    SET_DRAFT_PRODUCTION_ORDER: "SET_DRAFT_PRODUCTION_ORDER",
    UPDATE_DRAFT_PRODUCTION_ORDER: "UPDATE_DRAFT_PRODUCTION_ORDER",
    REMOVE_DRAFT_ATTRIBUTES: "REMOVE_DRAFT_ATTRIBUTES",
} as const;

type AddModalProductionOrderActionType =
    typeof AddModalProductionOrderActionsTypes[
        keyof typeof AddModalProductionOrderActionsTypes
    ];

type AddModalProductionOrderAction =
    | { type: typeof AddModalProductionOrderActionsTypes.SET_PRODUCTION_ORDER, payload: IPartialProductionOrder }
    | { type: typeof AddModalProductionOrderActionsTypes.UPDATE_PRODUCTION_ORDER, payload: IPartialProductionOrder }
    | { type: typeof AddModalProductionOrderActionsTypes.REMOVE_ATTRIBUTES, payload: string[]}
    | { type: typeof AddModalProductionOrderActionsTypes.SET_STEP, payload: number }
    | { type: typeof AddModalProductionOrderActionsTypes.BACK_STEP }
    | { type: typeof AddModalProductionOrderActionsTypes.NEXT_STEP }
    | { type: typeof AddModalProductionOrderActionsTypes.CLEAR }
    | { type: typeof AddModalProductionOrderActionsTypes.SET_DRAFT_PRODUCTION_ORDER, payload: IPartialProductionOrder }
    | { type: typeof AddModalProductionOrderActionsTypes.UPDATE_DRAFT_PRODUCTION_ORDER, payload: IPartialProductionOrder }
    | { type: typeof AddModalProductionOrderActionsTypes.REMOVE_DRAFT_ATTRIBUTES, payload: string[]}


export type {
    AddModalProductionOrderState,
    AddModalProductionOrderActionType,
    AddModalProductionOrderAction
};

export {
    AddModalProductionOrderActionsTypes,
};
