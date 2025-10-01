import type { Draft } from "immer";
import type { InventoriesState, InventoriesAction } from "./InventoriesTypes";
import { inventoriesActionsTypes } from "./InventoriesTypes";
import {
    // current, // para poder acceder al valor original del draft
    // isDraft, // para verificar si el draft es un draft para acceder al valor original, y poder imprimirlo
    produce,
} from "immer";

/* ****************** Reducer  ******************/

const InventoriesReducer = produce((
    draft: Draft<InventoriesState>,
    action: InventoriesAction
) => {
    switch (action.type) {

        // ? Acciones directas al array de inventarios

        case inventoriesActionsTypes.SET_INVENTORIES:
            draft.data = action.payload;
            break;
        case inventoriesActionsTypes.ADD_ITEMS:
            for (const item of action.payload) {
                const isDuplicate = draft.data.some(it => it.item?.id === item.item?.id);
                if (isDuplicate) continue;
                draft.data.push(item);
            }
            break;
        case inventoriesActionsTypes.REMOVE_ITEMS:
            draft.data = draft.data.filter(
                (item) => item?.item?.id && !action.payload.includes(item?.item?.id.toString())
            );
            break;

        // ? Acciones directas a un item del array de inventarios

        case inventoriesActionsTypes.UPDATE_ITEM: {
            const { id, attributes } = action.payload;
            const item = draft.data.find(it => it.item?.id === id);
            if (item) {
                Object.assign(item, attributes);
            }
            break;
        }
        case inventoriesActionsTypes.REMOVE_ATTRIBUTES_ITEM: {
            const { id, attributes } = action.payload;
            const item = draft.data.find(it => it.item?.id === id);
            if (item) {
                for (const key of attributes) {
                    if (key === "id") continue;
                    delete (item as any)[key];
                }
            }
            break;
        }

        // ? Acciones de los steps

        case inventoriesActionsTypes.SET_STEP:
            draft.current_step = action.payload;
            break;
        case inventoriesActionsTypes.BACK_STEP:
            draft.current_step -= 1;
            break;
        case inventoriesActionsTypes.NEXT_STEP:
            draft.current_step += 1;
            break;
        case inventoriesActionsTypes.CLEAR:
            draft.data = [];
            break;
    }
});

export default InventoriesReducer;
