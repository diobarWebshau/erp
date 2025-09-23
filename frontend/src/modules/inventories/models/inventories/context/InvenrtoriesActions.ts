import type {
    IPartialInventoryDetails
} from "../../../../../interfaces/inventories";
import type {
    InventoriesAction
} from "./InventoriesTypes";
import {
    inventoriesActionsTypes
} from "./InventoriesTypes";


// ? Acciones directas al array de inventarios

const set_inventories = (
    payload: IPartialInventoryDetails[]
): InventoriesAction => ({
    type: inventoriesActionsTypes.SET_INVENTORIES,
    payload
});

const add_items= (
    payload: IPartialInventoryDetails[]
): InventoriesAction => ({
    type: inventoriesActionsTypes.ADD_ITEMS,
    payload
});

const remove_items= (
    payload: number[]
): InventoriesAction => ({
    type: inventoriesActionsTypes.REMOVE_ITEMS,
    payload
});


// ? Acciones directas a un item del array de inventarios

const update_item= (
    payload: { id: number, attributes: IPartialInventoryDetails }
): InventoriesAction => ({
    type: inventoriesActionsTypes.UPDATE_ITEM,
    payload
});  

const remove_attributes_item= (
    payload: { id: number, attributes: string[] }
): InventoriesAction => ({
    type: inventoriesActionsTypes.REMOVE_ATTRIBUTES_ITEM,
    payload
});


// ?  Acciones de los steps

const set_step= (
    payload: number
): InventoriesAction => ({
    type: inventoriesActionsTypes.SET_STEP,
    payload
});

const back_step= (): InventoriesAction => ({
    type: inventoriesActionsTypes.BACK_STEP
});

const next_step= (): InventoriesAction => ({
    type: inventoriesActionsTypes.NEXT_STEP
});

// ? Acciones de limpieza

const clear= (): InventoriesAction => ({
    type: inventoriesActionsTypes.CLEAR
});


export {
    set_inventories,
    add_items,
    remove_items,
    update_item,
    remove_attributes_item,
    set_step,
    back_step,
    next_step,
    clear
}
