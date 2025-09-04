import {
    produce,
    // current,
    // isDraft,
} from "immer";
import type {
    Draft,
    // WritableDraft
} from "immer";
import type {
    AddModalProductionOrderState,
    AddModalProductionOrderAction
} from "./AddModalProductionOrderTypes";
import {
    AddModalProductionOrderActionsTypes,
} from "./AddModalProductionOrderTypes";
import type { IPartialProductionOrder } from "../../../../../interfaces/productionOrder";

// * ****************** Reducer  ******************/ 


const AddModalProductionOrderReducer = produce(
    (
        draft: Draft<AddModalProductionOrderState>,
        action: AddModalProductionOrderAction
    ) => {
        switch (action.type) {
            case AddModalProductionOrderActionsTypes.SET_PRODUCTION_ORDER:
                Object.assign(draft.data, action.payload);
                break;
            case AddModalProductionOrderActionsTypes.REMOVE_ATTRIBUTES:
                action.payload.forEach((attribute) => {
                    delete draft.data[attribute as keyof IPartialProductionOrder];
                });
                break;
            case AddModalProductionOrderActionsTypes.UPDATE_PRODUCTION_ORDER:
                if (action.payload.order_type === "internal") {
                    delete draft.data.purchase_order;
                    Object.assign(draft.data, action.payload);
                }else{
                    Object.assign(draft.data, action.payload);
                }
                break;
            case AddModalProductionOrderActionsTypes.SET_STEP:
                draft.current_step = action.payload;
                break;
            case AddModalProductionOrderActionsTypes.BACK_STEP:
                draft.current_step -= 1;
                break;
            case AddModalProductionOrderActionsTypes.NEXT_STEP:
                draft.current_step += 1;
                break;
        }
    }
)

export {
    AddModalProductionOrderReducer,
}
