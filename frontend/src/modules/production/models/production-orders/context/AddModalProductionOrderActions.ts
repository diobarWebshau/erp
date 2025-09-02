import type {
    IPartialProductionOrder
} from "../../../../../interfaces/productionOrder";
import type {
    AddModalProductionOrderAction
} from "./AddModalProductionOrderTypes";
import  {
    AddModalProductionOrderActionsTypes
} from "./AddModalProductionOrderTypes";

const set_production_order = (
    payload: IPartialProductionOrder
): AddModalProductionOrderAction => ({
    type: AddModalProductionOrderActionsTypes.SET_PRODUCTION_ORDER,
    payload
});

const update_production_order = (
    payload: IPartialProductionOrder
): AddModalProductionOrderAction => ({
    type: AddModalProductionOrderActionsTypes.UPDATE_PRODUCTION_ORDER,
    payload
});

const set_step = (
    payload: number
): AddModalProductionOrderAction => ({
    type: AddModalProductionOrderActionsTypes.SET_STEP,
    payload
});

const back_step = (): AddModalProductionOrderAction => ({
    type: AddModalProductionOrderActionsTypes.BACK_STEP,
});

const next_step = (): AddModalProductionOrderAction => ({
    type: AddModalProductionOrderActionsTypes.NEXT_STEP,
});

const clear = (): AddModalProductionOrderAction => ({
    type: AddModalProductionOrderActionsTypes.CLEAR,
});

export {
    set_production_order,
    update_production_order,
    set_step,
    back_step,
    next_step,
    clear
}
